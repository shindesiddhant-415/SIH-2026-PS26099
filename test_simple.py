#!/usr/bin/env python3
"""
Simple test to verify the enhanced matching engine works correctly.
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Import the modules
from services.matching_engine import MatchingEngine, EquivalenceDecision
from models.material_fingerprint import create_material_fingerprint

def test_basic_functionality():
    """Test basic functionality."""
    print("Testing Basic Functionality")
    print("=" * 30)

    matcher = MatchingEngine()

    # Test fingerprint creation
    fp1 = create_material_fingerprint("BALL VL 2 IN CL300")
    fp2 = create_material_fingerprint("BALL VALVE 2\" CLASS 300")

    print(f"Fingerprint 1: {fp1.category} - {fp1.to_dict()}")
    print(f"Fingerprint 2: {fp2.category} - {fp2.to_dict()}")

    # Test matching
    result = matcher.match_score("BALL VL 2 IN CL300", "BALL VALVE 2\" CLASS 300")

    print(f"\nMatch Result:")
    print(f"  Type: {result['match_type']}")
    print(f"  Is Match: {result['is_match']}")
    print(f"  Reason: {result['decision_reason']}")

    # Test constraint violation
    result2 = matcher.match_score("GATE VALVE 4\" CLASS 150", "GATE VALVE 4\" CLASS 300")

    print(f"\nConstraint Test:")
    print(f"  Type: {result2['match_type']}")
    print(f"  Is Match: {result2['is_match']}")
    print(f"  Reason: {result2['decision_reason']}")
    print(f"  Constraint Score: {result2['constraint_score']}")

    # Verify constraint worked
    assert result2['match_type'] == EquivalenceDecision.NOT_EQUIVALENT.value
    assert result2['is_match'] == False
    assert result2['constraint_score'] == 0.0

    print("\n✓ Basic functionality test passed!")

if __name__ == "__main__":
    test_basic_functionality()