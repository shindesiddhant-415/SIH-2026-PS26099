#!/usr/bin/env python3
"""
Script to download and examine the CPSE-related development corpus from Hugging Face.
"""

import os
import pandas as pd
from datasets import load_dataset

def download_and_examine_dataset():
    """Download the dataset and examine its structure."""
    print("Downloading SIH 26099 CPSE Material Codes dataset from Hugging Face...")

    # Load the dataset
    dataset = load_dataset("sarthak20024/sih26099-cpse-material-codes")

    # Get the main table
    df = dataset['train']  # Assuming the main data is in 'train' split

    print(f"Dataset loaded successfully!")
    print(f"Number of records: {len(df)}")
    print(f"Columns: {df.columns.tolist()}")

    # Show first few records
    print("\nFirst 5 records:")
    print(df.head())

    # Show info about the dataset
    print("\nDataset info:")
    print(df.info())

    # Save to local CSV for easier access
    output_path = "data/processed/extracted_items/material_description_corpus.csv"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"\nDataset saved to: {output_path}")

    # Also save supporting files if they exist in the dataset
    # Check if there are other splits or files
    supporting_files = [
        "unspsc_master.csv",
        "unspsc_industrial_subset.csv",
        "material_abbreviations.csv",
        "material_grades.csv",
        "pressure_classes.csv",
        "unit_normalisation.csv",
        "cppp_product_categories.csv",
        "ntpc_locations.csv"
    ]

    for file_name in supporting_files:
        # Try to see if this exists as a separate dataset or in the main dataset
        try:
            # This is a simplified approach - in reality, we'd need to check
            # how these files are structured in the HF dataset
            print(f"Note: Supporting file {file_name} would need to be extracted from dataset")
        except Exception as e:
            print(f"Could not process {file_name}: {e}")

    return df

if __name__ == "__main__":
    download_and_examine_dataset()