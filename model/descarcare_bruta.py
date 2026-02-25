import pandas as pd
from datasets import load_dataset
import os

DATASET_NAME = "ShenLab/MentalChat16K"
OUTPUT_FILE = "mentalchat16k_brut.csv"

print(f"--- 1. Încărcarea Setului de Date Brut: {DATASET_NAME} ---")
try:

    hf_dataset = load_dataset(DATASET_NAME, split="train") 
    print(f"Setul de date '{DATASET_NAME}' a fost încărcat cu succes.")

    df = hf_dataset.to_pandas()
    print(f"DataFrame creat cu {len(df)} rânduri și {len(df.columns)} coloane.")
    
except Exception as e:
    print(f"Eroare la încărcarea setului de date: {e}")
    exit()

print(f"\n--- 2. Salvarea Setului de Date Brut în {OUTPUT_FILE} ---")

df.to_csv(OUTPUT_FILE, index=False, encoding='utf-8')

output_path = os.path.abspath(OUTPUT_FILE)
print(f"Datele brute au fost salvate în fișierul: {output_path}")

print("\n--- Proces Finalizat ---")