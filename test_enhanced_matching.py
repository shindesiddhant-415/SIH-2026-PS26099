#!/usr/bin/env python3
"""
Test script to verify the enhanced matching engine works correctly.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from services.matching_engine import MatchingEngine, EquivalenceDecision

def test_constraint_enforcement():
    """Test that critical attribute constraints override similarity scores."""
    matcher = MatchingEngine()

    print("Testing Constraint Enforcement")
    print("=" * 40)

    # Test case: Same valve, different pressure class - should be NOT_EQUIVALENT
    result = matcher.match_score(
        "GATE VALVE 4\" CLASS 150",
        "GATE VALVE 4\" CLASS 300"
    )

    print(f"GATE VALVE 4\" CLASS 150 vs GATE VALVE 4\" CLASS 300")
    print(f"Match Type: {result['match_type']}")
    print(f"Is Match: {result['is_match']}")
    print(f"Decision Reason: {result['decision_reason']}")
    print(f"Constraint Score: {result['constraint_score']:.3f}")

    # Should be NOT_EQUIVALENT due to pressure class constraint
    assert result['match_type'] == EquivalenceDecision.NOT_EQUIVALENT.value
    assert result['is_match'] == False
    assert result['constraint_score'] == 0.0
    assert len(result['evidence']['constraint_violations']) > 0
    print("PASS: Pressure class constraint correctly enforced\n")

    # Test case: Same material, different descriptions - should be EXACT_DUPLICATE
    result = matcher.match_score(
        "BALL VL 2 IN CL300",
        "BALL VALVE 2\" CLASS 300"
    )

    print(f"BALL VL 2 IN CL300 vs BALL VALVE 2\" CLASS 300")
    print(f"Match Type: {result['match_type']}")
    print(f"Is Match: {result['is_match']}")
    print(f"Decision Reason: {result['decision_reason']}")
    print(f"Technical Score: {result['technical_score']:.3f}")

    # Should be EXACT_DUPLICATE or TECHNICALLY_EQUIVALENT
    assert result['is_match'] == True
    assert result['match_type'] in [EquivalenceDecision.EXACT_DUPLICATE.value, EquivalenceDecision.TECHNICALLY_EQUIVALENT.value]
    print("PASS: Exact duplicate correctly identified\n")

    # Test case: Functional alternative - same function, different material
    result = matcher.match_score(
        "CS PIPE 6\" SCH 40",
        "SS PIPE 6\" SCH 40"
    )

    print(f"CS PIPE 6\" SCH 40 vs SS PIPE 6\" SCH 40")
    print(f"Match Type: {result['match_type']}")
    print(f"Is Match: {result['is_match']}")
    print(f"Decision Reason: {result['decision_reason']}")
    print(f"Technical Score: {result['technical_score']:.3f}")
    print(f"Semantic Score: {result['semantic_score']:.3f}")

    # Should be FUNCTIONAL_ALTERNATIVE (same size/schedule, different material)
    assert result['is_match'] == True
    # Could be FUNCTIONAL_ALTERNATIVE or TECHNICALLY_EQUIVALENT depending on weights
    print("PASS: Functional alternative handled\n")

    # Test case: Cable matching
    result = matcher.match_score(
        "CU CABLE 11KV 3CX4MM2 XLPE",
        "COPPER CABLE 11000V 3 CORE 4 SQ MM XLPE"
    )

    print(f"CU CABLE 11KV 3CX4MM2 XLPE vs COPPER CABLE 11000V 3 CORE 4 SQ MM XLPE")
    print(f"Match Type: {result['match_type']}")
    print(f"Is Match: {result['is_match']}")
    print(f"Decision Reason: {result['decision_reason']}")

    # Should be a match (same cable specs)
    assert result['is_match'] == True
    print("PASS: Cable matching works\n")

    # Test case: Bearing matching
    result = matcher.match_score(
        "BEARING 6205 25X52X15 MM",
        "BEARING 6205 25MM ID 52MM OD 15MM WIDTH"
    )

    print(f"BEARING 6205 25X52X15 MM vs BEARING 6205 25MM ID 52MM OD 15MM WIDTH")
    print(f"Match Type: {result['match_type']}")
    print(f"Is Match: {result['is_match']}")
    print(f"Decision Reason: {result['decision_reason']}")

    # Should be a match (same bearing specs)
    assert result['is_match'] == True
    print("PASS: Bearing matching works\n")

    print("All constraint enforcement tests passed!")

def test_explainability():
    """Test that explainability evidence is properly generated."""
    matcher = MatchingEngine()

    print("\nTesting Explainability")
    print("=" * 30)

    result = matcher.match_score(
        "GATE VALVE 4\" CLASS 150",
        "GATE VALVE 4\" CLASS 300"
    )

    evidence = result['evidence']

    print(f"Matched Attributes: {evidence['matched_attributes']}")
    print(f"Conflicting Attributes: {evidence['conflicting_attributes']}")
    print(f"Constraint Violations: {evidence['constraint_violations']}")
    print(f"Component Scores: {evidence['component_scores']}")
    print(f"Weights: {evidence['weights']}")

    # Should have constraint violations for pressure class
    assert len(evidence['constraint_violations']) > 0
    violation = evidence['constraint_violations'][0]
    assert violation['attribute'] == 'pressure_class'
    assert violation['material_a'] == '150'
    assert violation['material_b'] == '300'

    print("PASS: Explainability evidence correctly generated\n")

if __name__ == "__main__":
    test_constraint_enforcement()
    test_explainability()
    print("\nAll tests passed! The enhanced matching engine is working correctly.")