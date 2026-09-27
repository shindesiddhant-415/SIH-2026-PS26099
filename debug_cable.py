import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from models.material_fingerprint import create_material_fingerprint

desc1 = "CU CABLE 11KV 3CX4MM2 XLPE"
desc2 = "COPPER CABLE 11000V 3 CORE 4 SQ MM XLPE"

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