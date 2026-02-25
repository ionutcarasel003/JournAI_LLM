import pandas as pd
import re

input_file = "mentalchat16k_brut.csv"
try:
    df = pd.read_csv(input_file)
    print(f"Am încărcat {len(df)} conversații brute.")
except FileNotFoundError:
    print("Nu găsesc fișierul 'mentalchat16k_brut.csv'. Asigură-te că e în același folder.")
    exit()

df = df.dropna(subset=['input', 'output'])

df = df.drop_duplicates()

df['input'] = df['input'].astype(str).str.strip()
df['output'] = df['output'].astype(str).str.strip()


def is_response_good(text):
    word_count = len(text.split())
    return word_count >= 5  

initial_count = len(df)
df = df[df['output'].apply(is_response_good)]
print(f"Am eliminat {initial_count - len(df)} răspunsuri prea scurte/nefolositoare.")

def clean_text(text):
    text = re.sub(r'<.*?>', '', text)  
    text = text.replace('  ', ' ')    
    return text

df['input'] = df['input'].apply(clean_text)
df['output'] = df['output'].apply(clean_text)

print(f"\nSetul de date final are {len(df)} conversații de calitate.")

output_csv = "dataset_psiholog_curat.csv"
df.to_csv(output_csv, index=False)
print(f"Datele curate salvate în: {output_csv}")

import json
output_jsonl = "curatare_date.jsonl"
system_prompt = (
    "You are a compassionate and empathetic mental health assistant. "
    "Your goal is to provide emotional support. "
    "If the user mentions self-harm or a serious situation, "
    "you must immediately advise them to seek help from a professional."
)
with open(output_jsonl, 'w', encoding='utf-8') as f:
    for _, row in df.iterrows():
        conversatie = {
            "instruction": system_prompt,
            "input": row['input'],
            "output": row['output']
        }
        f.write(json.dumps(conversatie, ensure_ascii=False) + "\n")

print(f"Datele JSONL (pentru fine-tuning) salvate în: {output_jsonl}")