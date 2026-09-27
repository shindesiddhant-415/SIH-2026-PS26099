import pandas as pd
import os

path = "data/processed/extracted_items/material_abbreviations.csv"
print("Looking for file:", os.path.abspath(path))
print("Exists:", os.path.exists(path))

df = pd.read_csv(path)
print("DataFrame:")
print(df)
print("\nIterating:")
for idx, row in df.iterrows():
    print(f"Abbreviation: {row['abbreviation']}, Full form: {row['full_form']}, Category: {row['category']}")