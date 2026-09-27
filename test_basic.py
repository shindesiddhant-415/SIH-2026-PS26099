#!/usr/bin/env python3
"""
Basic test to verify the enhanced matching engine works correctly.
Avoids Unicode characters that might cause encoding issues on Windows.
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Import the modules
from services.matching_engine import MatchingEngine, EquivalenceDecision
from models.material_fingerprint import create_material_fingerprint

def test_constraint_enforcement():
    """Test that critical attribute constraints override similarity scores."""
    print("Testing Constraint Enforcement")
    print("-" * 30)

    matcher = MatchingEngine()

    # Test case: Same valve, different pressure class - should be NOT_EQUIVALENT
    result = matcher.match_score(
        "GATE VALVE 4\" CLASS 150",
        "GATE VALVE 4\" CLASS 300"
    )

    print(f"TEST 1: Pressure Class Mismatch")
    print(f"  Description 1: GATE VALVE 4\" CLASS 150")
    print(f"  Description 2: GATE VALVE 4\" CLASS 300")
    print(f"  Match Type: {result['match_type']}")
    print(f"  Is Match: {result['is_match']}")
    print(f"  Reason: {result['decision_reason']}")
    print(f"  Constraint Score: {result['constraint_score']:.1f}")

    # Should be NOT_EQUIVALENT due to pressure class constraint
    assert result['match_type'] == EquivalenceDecision.NOT_EQUIVALENT.value
    assert result['is_match'] == False
    assert result['constraint_score'] == 0.0
    assert len(result['evidence']['constraint_violations']) > 0
    print("  RESULT: PASS - Pressure class constraint correctly enforced\n")

    # Test case: Same material, different descriptions - should be match
    result = matcher.match_score(
        "BALL VL 2 IN CL300",
        "BALL VALVE 2\" CLASS 300"
    )

    print(f"TEST 2: Exact Duplicate (Different Formats)")
    print(f"  Description 1: BALL VL 2 IN CL300")
    print(f"  Description 2: BALL VALVE 2\" CLASS 300")
    print(f"  Match Type: {result['match_type']}")
    print(f"  Is Match: {result['is_match']}")
    print(f"  Reason: {result['decision_reason']}")
    print(f"  Technical Score: {result['technical_score']:.2f}")

    # Should be a match (EXACT_DUPLICATE or TECHNICALLY_EQUIVALENT)
    assert result['is_match'] == True
    assert result['match_type'] in [EquivalenceDecision.EXACT_DUPLICATE.value, EquivalenceDecision.TECHNICALLY_EQUIVALENT.value]
    print("  RESULT: PASS - Exact duplicate correctly identified\n")

    # Test case: Functional alternative - same function, different material
    result = matcher.match_score(
        "CS PIPE 6\" SCH 40",
        "SS PIPE 6\" SCH 40"
    )

    print(f"TEST 3: Functional Alternative (Same Size, Different Material)")
    print(f"  Description 1: CS PIPE 6\" SCH 40")
    print(f"  Description 2: SS PIPE 6\" SCH 40")
    print(f"  Match Type: {result['match_type']}")
    print(f"  Is Match: {result['is_match']}")
    print(f"  Reason: {result['decision_reason']}")
    print(f"  Technical Score: {result['technical_score']:.2f}")
    print(f"  Semantic Score: {result['semantic_score']:.2f}")

    # Should be a match (FUNCTIONAL_ALTERNATIVE or TECHNICALLY_EQUIVALENT)
    assert result['is_match'] == True
    print("  RESULT: PASS - Functional alternative handled\n")

    # Test case: Cable matching
    result = matcher.match_score(
        "CU CABLE 11KV 3CX4MM2 XLPE",
        "COPPER CABLE 11000V 3 CORE 4 SQ MM XLPE"
    )

    print(f"TEST 4: Cable Matching")
    print(f"  Description 1: CU CABLE 11KV 3CX4MM2 XLPE")
    print(f"  Description 2: COPPER CABLE 11000V 3 CORE 4 SQ MM XLPE")
    print(f"  Match Type: {result['match_type']}")
    print(f"  Is Match: {result['is_match']}")
    print(f"  Reason: {result['decision_reason']}")

    # Should be a match (same cable specs)
    assert result['is_match'] == True
    print("  RESULT: PASS - Cable matching works\n")

    print("All constraint enforcement tests PASSED!")

def test_fingerprint_creation():
    """Test that fingerprints are created correctly."""
    print("\nTesting Fingerprint Creation")
    print("-" * 30)

    # Test valve fingerprint
    fp_valve = create_material_fingerprint("BALL VL 2 IN CL300")
    print(f"VALVE Fingerprint: {fp_valve.category}")
    print(f"  Size: {fp_valve.nominal_size} {fp_valve.size_unit}")
    print(f"  Pressure: {fp_valve.pressure_class} {fp_valve.pressure_unit}")
    assert fp_valve.category == "VALVE"
    assert fp_valve.nominal_size == "2"
    assert fp_valve.size_unit == '"'
    assert fp_valve.pressure_class == "300"
    assert fp_valve.pressure_unit == "PSI"
    print("  RESULT: PASS - Valve fingerprint correct\n")

    # Test pipe fingerprint
    fp_pipe = create_material_fingerprint("CS PIPE 8 INCH SCH 40")
    print(f"PIPE Fingerprint: {fp_pipe.category}")
    print(f"  Size: {fp_pipe.nominal_size} {fp_pipe.size_unit}")
    print(f"  Schedule: {fp_pipe.schedule}")
    print(f"  Material: {fp_pipe.material_grade} {fp_pipe.material_type}")
    assert fp_pipe.category == "PIPE"
    assert fp_pipe.nominal_size == "8"
    assert fp_pipe.size_unit == "INCH"
    assert fp_pipe.schedule == "40"
    assert fp_pipe.material_grade == "CS"
    assert fp_pipe.material_type == "STEEL"  # This might be None depending on parsing
    print("  RESULT: PASS - Pipe fingerprint correct\n")

if __name__ == "__main__":
    test_constraint_enforcement()
    test_fingerprint_creation()
    print("\n🎉 All basic tests completed!")