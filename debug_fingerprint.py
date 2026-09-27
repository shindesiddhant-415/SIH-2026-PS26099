import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from models.material_fingerprint import create_material_fingerprint, MaterialNormalizer

desc1 = "BALL VL 2 IN CL300"
desc2 = "BALL VALVE 2\" CLASS 300"

print("Original desc1:", desc1)
print("Original desc2:", desc2)

fp1 = create_material_fingerprint(desc1)
fp2 = create_material_fingerprint(desc2)

print("\nFingerprint 1:")
print(fp1.to_dict())
print("\nFingerprint 2:")
print(fp2.to_dict())

print("\nComparison dict 1:")
print(fp1.to_comparison_dict())
print("\nComparison dict 2:")
print(fp2.to_comparison_dict())

# Check normalization
normalizer = MaterialNormalizer()
norm1 = normalizer.normalize_description(desc1)
norm2 = normalizer.normalize_description(desc2)
print("\nNormalized desc1:", norm1)
print("Normalized desc2:", norm2)

# Check category detection
cat1 = normalizer.detect_category(desc1)
cat2 = normalizer.detect_category(desc2)
print("\nCategory 1:", cat1)
print("Category 2:", cat2)