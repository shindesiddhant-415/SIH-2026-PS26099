import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from models.material_fingerprint import MaterialNormalizer

normalizer = MaterialNormalizer()
desc1 = "CU CABLE 11KV 3CX4MM2 XLPE"
desc2 = "COPPER CABLE 11000V 3 CORE 4 SQ MM XLPE"

print("Original desc1:", desc1)
attrs1 = normalizer.parse_technical_attributes(normalizer.normalize_description(desc1))
print("Parsed attrs1:", attrs1)

print("\nOriginal desc2:", desc2)
attrs2 = normalizer.parse_technical_attributes(normalizer.normalize_description(desc2))
print("Parsed attrs2:", attrs2)