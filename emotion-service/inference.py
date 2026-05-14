import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
import os


class ModelManager:
    def __init__(self, base_model_path, device, mental_chat_path):
        self.base_model_path = base_model_path
        self.device = device
        print(f"Loading tokenizer from {base_model_path}...")
        self.tokenizer = AutoTokenizer.from_pretrained(base_model_path)

        print(f"Loading base model {base_model_path} (this may take a while)...")
        self.base_model = AutoModelForCausalLM.from_pretrained(
            base_model_path,
            torch_dtype=torch.float16 if device != "cpu" else torch.float32,
            device_map=device if device != "cpu" else None
        )

        self.adapters = {
            "MentalChat": mental_chat_path
        }

        # Initialize PeftModel with MentalChat
        print(f"Loading MentalChat adapter from {mental_chat_path}...")
        self.model = PeftModel.from_pretrained(
            self.base_model,
            self.adapters["MentalChat"],
            adapter_name="MentalChat"
        )

    def generate_response(self, chat_history, model_type="MentalChat", max_new_tokens=512):
        """
        Generates a response using the specified LoRA adapter and conversation history.
        chat_history: A list of message dictionaries: [{"role": "user", "content": "..."}, ...]
        """
        # Set the active adapter
        self.model.set_adapter(model_type)

        # Apply the chat template to the entire history
        prompt = self.tokenizer.apply_chat_template(chat_history, tokenize=False, add_generation_prompt=True)
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.device)

        with torch.no_grad():
            output_tokens = self.model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                do_sample=True,
                temperature=0.4,
                top_p=0.9,
                top_k=50,
                repetition_penalty=1.15,
                no_repeat_ngram_size=5,
                pad_token_id=self.tokenizer.eos_token_id,
                eos_token_id=self.tokenizer.eos_token_id
            )

        # Get only the newly generated tokens
        input_length = inputs.input_ids.shape[1]
        new_tokens = output_tokens[0][input_length:]

        response = self.tokenizer.decode(new_tokens, skip_special_tokens=True).strip()

        # Post-process: Remove repetitive babbling/aberrations
        import re

        # 1. Detect sequence of 3+ repeating special characters (like !!!, ....)
        aberration_pattern = r'([^a-zA-Z0-9\s])(?:\s*?\1){2,}'
        aberration_match = re.search(aberration_pattern, response)
        if aberration_match:
            char = aberration_match.group(1)
            response = response[:aberration_match.start()].strip() + char

        # 2. Prevent "Goodbye Loops": Detect strings of short sentences often used in closing
        # These are usually 1-4 words ending in [!?.]. If we see 3+ in a row at the end, truncate.
        closing_patterns = [
            r"bye", r"goodbye", r"cheers", r"take care", r"see ya", r"later",
            r"peace", r"love", r"blessings", r"amen", r"happy holidays", r"thanks", r"cya"
        ]

        # Split into sentences (simple regex)
        sentences = re.split(r'(?<=[.!?])\s+', response)
        if len(sentences) > 2:
            filtered_sentences = []
            for i, sent in enumerate(sentences):
                # Check if sentence is a suspicious closing (short and contains closing words)
                sent_lower = sent.lower()
                is_closing = any(re.search(rf"\b{p}\b", sent_lower) for p in closing_patterns)
                is_short = len(sent.split()) < 5

                if i > 0 and is_closing and is_short:
                    # If we hit a closing-style sentence after some content,
                    # check if the rest of the message is also just closings
                    remaining = sentences[i:]
                    closings_count = sum(
                        1 for s in remaining if any(re.search(rf"\b{p}\b", s.lower()) for p in closing_patterns))
                    if closings_count >= 2 or len(remaining) >= 3:
                        # Found a loop/excessive closing. Stop here.
                        break
                filtered_sentences.append(sent)
            response = " ".join(filtered_sentences).strip()

        # 3. Deduplicate sentences
        sentences = re.split(r'(?<=[.!?])\s+', response)
        unique_sentences = []
        seen_sentences = set()
        for sent in sentences:
            stripped_sent = re.sub(r'[^a-zA-Z0-9]', '', sent).lower()
            if stripped_sent and stripped_sent not in seen_sentences:
                unique_sentences.append(sent)
                seen_sentences.add(stripped_sent)
            elif not stripped_sent:
                unique_sentences.append(sent)
        response = " ".join(unique_sentences).strip()

        # 4. Formatting: Ensure numbered items have double newlines for elegance
        # This finds numbered items (e.g., "1.") and ensures they have an empty line before them.
        response = re.sub(r'(?<!^)\s*(\d+\.)', r'\n\n\1', response)
        response = re.sub(r'\n{3,}', '\n\n', response).strip()

        # 5. Final safety: Trim at the LAST sensible punctuation but only if we haven't already truncated
        punctuation_marks = [m.start() for m in re.finditer(r'[.!?]', response)]
        if punctuation_marks:
            last_mark = punctuation_marks[-1]
            response = response[:last_mark + 1]

        return response
