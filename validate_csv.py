import csv
import sys
import os

def validate_csv(filepath):
    print(f"Validating {filepath}")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            for i, row in enumerate(reader, 1):
                # Just reading to see if any error occurs
                pass
        print(f"  SUCCESS: No parsing errors")
        return True
    except Exception as e:
        print(f"  ERROR at line {getattr(e, 'lineno', 'unknown')}: {e}")
        return False

if __name__ == "__main__":
    base_path = r"D:\sih-ps-2\proto\data\processed\extracted_items"
    files = [
        "material_description_corpus.csv",
        "material_abbreviations.csv",
        "material_grades.csv",
        "pressure_classes.csv",
        "material_categories.csv"
    ]

    all_good = True
    for fname in files:
        path = os.path.join(base_path, fname)
        if not validate_csv(path):
            all_good = False
        print()

    if all_good:
        print("All CSV files are valid!")
    else:
        print("Some CSV files have issues.")
        sys.exit(1)