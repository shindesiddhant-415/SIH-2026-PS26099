import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from models.material_fingerprint import MaterialNormalizer

normalizer = MaterialNormalizer()
print("Abbreviations loaded:", len(normalizer.abbreviations))
for abbr, info in normalizer.abbreviations.items():
    print(f"  {abbr}: {info}")

# Test normalization
desc1 = "BALL VL 2 IN CL300"
desc2 = "BALL VALVE 2\" CLASS 300"

print("\nOriginal desc1:", desc1)
norm1 = normalizer.normalize_description(desc1)
print("Normalized desc1:", norm1)

print("\nOriginal desc2:", desc2)
norm2 = normalizer.normalize_description(desc2)
print("Normalized desc2:", norm2)