import sys
import json
import os
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "model_risk_level_cu_weights")
MODEL_PATH = os.path.abspath(MODEL_PATH)

MAX_LEN = 512
STRIDE = 128

TH_HIGH = 0.25
TH_LOW = 0.35

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
model.eval()

def _id2label_safe(cfg):
    out = {}
    for k, v in cfg.id2label.items():
        out[int(k)] = v
    return out

ID2LABEL = _id2label_safe(model.config)
LABEL2ID = {v: k for k, v in ID2LABEL.items()}

HIGH_ID = LABEL2ID.get("high_risk")
LOW_ID = LABEL2ID.get("low_risk")

def predict_risk_long_text(text):
    enc = tokenizer(
        text,
        truncation=True,
        max_length=MAX_LEN,
        return_overflowing_tokens=True,
        stride=STRIDE,
        padding="max_length",
        return_tensors="pt"
    )

    enc.pop("overflow_to_sample_mapping", None)
    enc.pop("num_truncated_tokens", None)

    enc = {k: v.to(device) for k, v in enc.items()}

    with torch.no_grad():
        logits = model(**enc).logits
        probs = torch.softmax(logits, dim=-1)

    probs_doc = probs.mean(dim=0)

    p_high = float(probs_doc[HIGH_ID]) if HIGH_ID is not None else None
    p_low = float(probs_doc[LOW_ID]) if LOW_ID is not None else None

    if HIGH_ID is not None and p_high >= TH_HIGH:
        pred_id = HIGH_ID
    elif LOW_ID is not None and p_low >= TH_LOW:
        pred_id = LOW_ID
    else:
        pred_id = int(torch.argmax(probs_doc).item())

    pred_label = ID2LABEL[pred_id]

    scores = {ID2LABEL[i]: float(probs_doc[i]) for i in range(len(probs_doc))}

    p_low = scores.get("low_risk", 0.0)
    p_medium = scores.get("medium_risk", 0.0)
    p_high = scores.get("high_risk", 0.0)

    return {
    "risk_level": pred_label,
    "probabilities": {
        "low": round(p_low, 4),
        "medium": round(p_medium, 4),
        "high": round(p_high, 4)
    }
}
print("\n")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No text provided"}))
        sys.exit(1)

    text = sys.argv[1]
    result = predict_risk_long_text(text)
    print(json.dumps(result))