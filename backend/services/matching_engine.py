"""
Matching Engine for Material Harmonization
Combines Material Fingerprint technical identity with semantic similarity for robust matching.
Implements hybrid equivalence engine with constraint checking and explainability.
"""

import numpy as np
import pandas as pd
import re
from typing import List, Dict, Any, Tuple, Optional
from enum import Enum
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from sentence_transformers import SentenceTransformer
import logging
from difflib import SequenceMatcher
from models.material_fingerprint import MaterialFingerprint, MaterialNormalizer, MaterialCategory

logger = logging.getLogger(__name__)

class EquivalenceDecision(Enum):
    """Standardized equivalence decisions."""
    EXACT_DUPLICATE = "EXACT_DUPLICATE"
    TECHNICALLY_EQUIVALENT = "TECHNICALLY_EQUIVALENT"
    FUNCTIONAL_ALTERNATIVE = "FUNCTIONAL_ALTERNATIVE"
    NOT_EQUIVALENT = "NOT_EQUIVALENT"

class MatchingEngine:
    """
    Advanced matching engine that implements the hybrid equivalence approach:
    - Uses semantic similarity for candidate retrieval
    - Applies technical attribute matching for precision
    - Enforces engineering constraints (critical attributes must match)
    - Provides explainable decisions with evidence
    """

    def __init__(self,
                 semantic_model_name: str = 'all-MiniLM-L6-v2',
                 technical_weight: float = 0.4,
                 semantic_weight: float = 0.3,
                 fuzzy_weight: float = 0.2,
                 constraint_weight: float = 0.1,
                 similarity_threshold: float = 0.75):
        """
        Initialize the matcher.

        Args:
            semantic_model_name: Sentence transformer model for semantic similarity
            technical_weight: Weight for technical identity score (0-1)
            semantic_weight: Weight for semantic similarity score (0-1)
            fuzzy_weight: Weight for fuzzy string similarity (0-1)
            constraint_weight: Weight for constraint satisfaction (0-1)
            similarity_threshold: Minimum score to consider a match
        """
        self.technical_weight = technical_weight
        self.semantic_weight = semantic_weight
        self.fuzzy_weight = fuzzy_weight
        self.constraint_weight = constraint_weight
        self.similarity_threshold = similarity_threshold

        # Validate weights sum to 1.0
        total_weight = technical_weight + semantic_weight + fuzzy_weight + constraint_weight
        if abs(total_weight - 1.0) > 0.001:
            logger.warning(f"Weights sum to {total_weight}, normalizing to 1.0")
            self.technical_weight = technical_weight / total_weight
            self.semantic_weight = semantic_weight / total_weight
            self.fuzzy_weight = fuzzy_weight / total_weight
            self.constraint_weight = constraint_weight / total_weight

        # Initialize semantic model
        try:
            self.semantic_model = SentenceTransformer(semantic_model_name)
            logger.info(f"Loaded semantic model: {semantic_model_name}")
        except Exception as e:
            logger.warning(f"Could not load semantic model {semantic_model_name}: {e}")
            # Fallback to TF-IDF
            self.semantic_model = None
            self.tfidf_vectorizer = TfidfVectorizer(
                lowercase=True,
                stop_words='english',
                ngram_range=(1, 2),
                max_features=10000
            )
            self.tfidf_fitted = False

        # Initialize material normalizer for fingerprints
        self.normalizer = MaterialNormalizer()

        # Cache for fingerprints and embeddings
        self.fingerprint_cache = {}
        self.embedding_cache = {}

        # Define critical attributes that must match for equivalence
        # These are engineering constraints that override similarity scores
        self.critical_attributes = {
            MaterialCategory.VALVE: ['category', 'nominal_size', 'size_unit', 'pressure_class', 'pressure_unit', 'end_connection', 'facing_type'],
            MaterialCategory.PIPE: ['category', 'nominal_size', 'size_unit', 'schedule', 'material_grade', 'material_type'],
            MaterialCategory.FLANGE: ['category', 'nominal_size', 'size_unit', 'pressure_class', 'pressure_unit', 'facing_type'],
            MaterialCategory.CABLE: ['category', 'voltage', 'conductor_material', 'core_count', 'cross_section', 'insulation'],
            MaterialCategory.BEARING: ['category', 'bore', 'outer_diameter', 'width', 'bearing_type'],
            MaterialCategory.GASKET: ['category', 'inner_diameter', 'outer_diameter', 'thickness', 'gasket_material'],
            MaterialCategory.BOLT: ['category', 'diameter', 'length', 'thread_pitch', 'material_grade', 'strength_grade'],
            MaterialCategory.NUT: ['category', 'diameter', 'thread_pitch', 'material_grade', 'strength_grade'],
            MaterialCategory.WASHER: ['category', 'inner_diameter', 'outer_diameter', 'thickness', 'material'],
            MaterialCategory.ELBOW: ['category', 'nominal_size', 'size_unit', 'angle', 'schedule', 'material_grade', 'material_type'],
            MaterialCategory.TEE: ['category', 'nominal_size', 'size_unit', 'branch_size', 'schedule', 'material_grade', 'material_type'],
            MaterialCategory.REDUCER: ['category', 'nominal_size', 'size_unit', 'reduction', 'schedule', 'material_grade', 'material_type'],
            MaterialCategory.CAP: ['category', 'nominal_size', 'size_unit', 'schedule', 'material_grade', 'material_type'],
            MaterialCategory.PLUG: ['category', 'nominal_size', 'size_unit', 'schedule', 'material_grade', 'material_type', 'plug_type']
        }

    def create_fingerprint(self, description: str) -> MaterialFingerprint:
        """Create or retrieve cached material fingerprint."""
        if description not in self.fingerprint_cache:
            self.fingerprint_cache[description] = self.normalizer.create_fingerprint(description)
        return self.fingerprint_cache[description]

    def get_semantic_embedding(self, description: str) -> np.ndarray:
        """Get or compute cached semantic embedding for a description."""
        if description not in self.embedding_cache:
            if self.semantic_model is not None:
                # Use sentence transformer
                embedding = self.semantic_model.encode([description])[0]
            else:
                # Use TF-IDF fallback
                if not self.tfidf_fitted:
                    # We need at least one document to fit
                    self.tfidf_vectorizer.fit([description])
                    self.tfidf_fitted = True
                embedding = self.tfidf_vectorizer.transform([description]).toarray()[0]

            self.embedding_cache[description] = embedding
        return self.embedding_cache[description]

    def semantic_similarity_score(self, desc1: str, desc2: str) -> float:
        """Calculate semantic similarity between two descriptions."""
        try:
            emb1 = self.get_semantic_embedding(desc1)
            emb2 = self.get_semantic_embedding(desc2)

            # Cosine similarity
            similarity = cosine_similarity([emb1], [emb2])[0][0]
            return float(similarity)
        except Exception as e:
            logger.warning(f"Error calculating semantic similarity: {e}")
            return 0.0

    def fuzzy_similarity_score(self, desc1: str, desc2: str) -> float:
        """Calculate fuzzy string similarity between two descriptions."""
        try:
            # Using SequenceMatcher for robust fuzzy matching
            similarity = SequenceMatcher(None, desc1.lower(), desc2.lower()).ratio()
            return float(similarity)
        except Exception as e:
            logger.warning(f"Error calculating fuzzy similarity: {e}")
            return 0.0

    def technical_identity_score(self, fp1: MaterialFingerprint, fp2: MaterialFingerprint) -> Tuple[float, List[str], List[Dict]]:
        """
        Calculate technical identity score based on Material Fingerprints.
        Returns: (score, matched_attributes, conflicting_attributes)
        """
        # Compare technical fields only
        dict1 = fp1.to_comparison_dict()
        dict2 = fp2.to_comparison_dict()

        if not dict1 and not dict2:
            return 0.0, [], []

        # Get all technical fields from both fingerprints
        all_fields = set(dict1.keys()) | set(dict2.keys())

        if not all_fields:
            return 0.0, [], []

        matches = 0
        total_fields = len(all_fields)
        matched_attributes = []
        conflicting_attributes = []

        for field in all_fields:
            val1 = dict1.get(field)
            val2 = dict2.get(field)

            # Both None - consider as match (missing info)
            if val1 is None and val2 is None:
                matches += 1
                matched_attributes.append(field)
            # One None, other not None - partial mismatch (missing info)
            elif val1 is None or val2 is None:
                matches += 0.5  # Partial credit for missing info
                matched_attributes.append(field)  # Still count as matched for missing info
            # Both have values - exact match required (case-insensitive for strings)
            elif isinstance(val1, str) and isinstance(val2, str):
                if val1.lower() == val2.lower():
                    matches += 1
                    matched_attributes.append(field)
                else:
                    matches += 0
                    conflicting_attributes.append({
                        'attribute': field,
                        'material_a': str(val1) if val1 is not None else '',
                        'material_b': str(val2) if val2 is not None else ''
                    })
            else:
                # Non-string comparison
                if val1 == val2:
                    matches += 1
                    matched_attributes.append(field)
                else:
                    matches += 0
                    conflicting_attributes.append({
                        'attribute': field,
                        'material_a': str(val1) if val1 is not None else '',
                        'material_b': str(val2) if val2 is not None else ''
                    })

        base_score = matches / total_fields if total_fields > 0 else 0.0
        return base_score, matched_attributes, conflicting_attributes

    def constraint_satisfaction_score(self, fp1: MaterialFingerprint, fp2: MaterialFingerprint) -> Tuple[float, List[Dict]]:
        """
        Check if critical engineering constraints are satisfied.
        Returns: (score, constraint_violations)
        Score is 0.0 if ANY critical attribute conflicts, 1.0 if all critical attributes match or are missing.
        """
        category_a = fp1.get_category_enum()
        category_b = fp2.get_category_enum()

        # If categories don't match, it's a constraint violation
        if category_a != category_b:
            return 0.0, [{
                'constraint_type': 'category_mismatch',
                'attribute': 'category',
                'material_a': fp1.category,
                'material_b': fp2.category,
                'description': f'Material category mismatch: {fp1.category} vs {fp2.category}'
            }]

        # Get critical attributes for this category
        critical_attrs = self.critical_attributes.get(category_a, [])

        if not critical_attrs:
            # No critical attributes defined for this category, pass
            return 1.0, []

        dict1 = fp1.to_comparison_dict()
        dict2 = fp2.to_comparison_dict()

        violations = []
        all_critical_satisfied = True

        for attr in critical_attrs:
            val1 = dict1.get(attr)
            val2 = dict2.get(attr)

            # Critical attribute conflict: both present but different (case-insensitive for strings)
            if val1 is not None and val2 is not None:
                if isinstance(val1, str) and isinstance(val2, str):
                    if val1.lower() != val2.lower():
                        all_critical_satisfied = False
                        violations.append({
                            'constraint_type': 'critical_attribute_mismatch',
                            'attribute': attr,
                            'material_a': str(val1),
                            'material_b': str(val2),
                            'description': f'Critical attribute mismatch: {attr} ({val1} vs {val2})'
                        })
                else:
                    if val1 != val2:
                        all_critical_satisfied = False
                        violations.append({
                            'constraint_type': 'critical_attribute_mismatch',
                            'attribute': attr,
                            'material_a': str(val1),
                            'material_b': str(val2),
                            'description': f'Critical attribute mismatch: {attr} ({val1} vs {val2})'
                        })
            # One is missing, other present - this is acceptable (missing info vs negative info)
            elif val1 is None and val2 is not None:
                # Material A missing info, Material B has it - acceptable
                pass
            elif val1 is not None and val2 is None:
                # Material A has it, Material B missing - acceptable
                pass
            # Both missing - acceptable
            # Both present and match - acceptable (handled above)

        score = 1.0 if all_critical_satisfied else 0.0
        return score, violations

    def match_score(self, desc1: str, desc2: str) -> Dict[str, Any]:
        """
        Calculate comprehensive match score between two material descriptions.
        Implements the hybrid equivalence engine with constraint checking.

        Returns:
            Dictionary with scores, match classification, and explainability evidence
        """
        # Create fingerprints
        fp1 = self.create_fingerprint(desc1)
        fp2 = self.create_fingerprint(desc2)

        # Calculate individual score components
        semantic_score = self.semantic_similarity_score(desc1, desc2)
        fuzzy_score = self.fuzzy_similarity_score(desc1, desc2)
        technical_score, matched_attrs, conflicting_attrs = self.technical_identity_score(fp1, fp2)
        constraint_score, constraint_violations = self.constraint_satisfaction_score(fp1, fp2)

        # Apply constraint logic: if critical constraints violated, force NOT_EQUIVALENT
        # regardless of similarity scores
        if constraint_score == 0.0 and len(constraint_violations) > 0:
            # Hard constraint violation - cannot be equivalent
            combined_score = 0.0
            match_type = EquivalenceDecision.NOT_EQUIVALENT.value
            confidence = "HIGH"  # High confidence in NOT_EQUIVALENT due to hard constraint
            requires_human_review = False
            technical_identity = False
            is_equivalent = False
        else:
            # No hard constraint violations, calculate weighted score
            combined_score = (
                self.technical_weight * technical_score +
                self.semantic_weight * semantic_score +
                self.fuzzy_weight * fuzzy_score +
                self.constraint_weight * constraint_score
            )

            # Determine match classification based on scores and constraint satisfaction
            is_technical_strong = technical_score >= 0.95  # Very high technical similarity
            is_semantic_strong = semantic_score >= 0.85   # High semantic similarity
            is_fuzzy_strong = fuzzy_score >= 0.90         # Very high string similarity

            # Check if we have strong technical identity (near-perfect match)
            if is_technical_strong and len(conflicting_attrs) == 0 and constraint_score == 1.0:
                match_type = EquivalenceDecision.EXACT_DUPLICATE.value
                confidence = "HIGH"
                requires_human_review = False
                technical_identity = True
                is_equivalent = True
            # Check for technical equivalence (good technical match, constraints satisfied)
            elif technical_score >= 0.8 and constraint_score == 1.0:
                match_type = EquivalenceDecision.TECHNICALLY_EQUIVALENT.value
                confidence = "MEDIUM_HIGH"
                requires_human_review = False
                technical_identity = True
                is_equivalent = True
            # Check for functional alternative (good semantic/fuzzy but some technical differences)
            elif (semantic_score >= 0.7 or fuzzy_score >= 0.75) and constraint_score == 1.0:
                match_type = EquivalenceDecision.FUNCTIONAL_ALTERNATIVE.value
                confidence = "MEDIUM"
                technical_identity = False
                is_equivalent = True
                # May require human review if there are conflicting attributes
                requires_human_review = len(conflicting_attrs) > 0 and technical_score < 0.6
            # Check if meets similarity threshold
            elif combined_score >= self.similarity_threshold and constraint_score == 1.0:
                match_type = EquivalenceDecision.FUNCTIONAL_ALTERNATIVE.value
                confidence = "LOW_MEDIUM"
                technical_identity = technical_score >= 0.7
                is_equivalent = True
                requires_human_review = technical_score < 0.6 or len(conflicting_attrs) > 2
            else:
                match_type = EquivalenceDecision.NOT_EQUIVALENT.value
                confidence = "LOW"
                technical_identity = False
                is_equivalent = False
                requires_human_review = False

        # Prepare explainability evidence
        evidence = {
            'matched_attributes': matched_attrs,
            'conflicting_attributes': conflicting_attrs,
            'constraint_violations': constraint_violations,
            'component_scores': {
                'semantic': semantic_score,
                'fuzzy': fuzzy_score,
                'technical': technical_score,
                'constraint': constraint_score
            },
            'weights': {
                'technical': self.technical_weight,
                'semantic': self.semantic_weight,
                'fuzzy': self.fuzzy_weight,
                'constraint': self.constraint_weight
            }
        }

        return {
            'description_1': desc1,
            'description_2': desc2,
            'fingerprint_1': fp1.to_dict(),
            'fingerprint_2': fp2.to_dict(),
            'technical_score': technical_score,
            'semantic_score': semantic_score,
            'fuzzy_score': fuzzy_score,
            'constraint_score': constraint_score,
            'combined_score': combined_score,
            'match_type': match_type,
            'confidence': confidence,
            'is_match': is_equivalent,
            'technical_identity': technical_identity,
            'requires_human_review': requires_human_review,
            'evidence': evidence,
            'decision_reason': self._generate_decision_reason(
                match_type, technical_score, semantic_score, fuzzy_score,
                constraint_score, matched_attrs, conflicting_attrs, constraint_violations
            )
        }

    def _generate_decision_reason(self, match_type: str, technical_score: float,
                                semantic_score: float, fuzzy_score: float,
                                constraint_score: float, matched_attrs: List[str],
                                conflicting_attrs: List[Dict], constraint_violations: List[Dict]) -> str:
        """Generate human-readable explanation of the decision."""
        if match_type == EquivalenceDecision.EXACT_DUPLICATE.value:
            return f"Exact technical duplicate: all critical attributes match (technical score: {technical_score:.2f})"
        elif match_type == EquivalenceDecision.TECHNICALLY_EQUIVALENT.value:
            return f"Technically equivalent: strong technical match ({technical_score:.2f}) with no critical conflicts"
        elif match_type == EquivalenceDecision.FUNCTIONAL_ALTERNATIVE.value:
            return f"Functionally equivalent: good semantic/fuzzy match ({semantic_score:.2f}/{fuzzy_score:.2f}) with acceptable technical differences"
        elif match_type == EquivalenceDecision.NOT_EQUIVALENT.value:
            if constraint_score == 0.0 and constraint_violations:
                violation = constraint_violations[0]
                return f"Not equivalent: critical constraint violation - {violation['description']}"
            else:
                return f"Not equivalent: insufficient similarity (combined: {technical_score*self.technical_weight + semantic_score*self.semantic_weight + fuzzy_score*self.fuzzy_weight:.2f})"
        else:
            return f"Decision: {match_type}"

    def find_duplicates(self, descriptions: List[str]) -> List[Dict[str, Any]]:
        """
        Find all duplicate pairs in a list of descriptions.

        Args:
            descriptions: List of material descriptions to check

        Returns:
            List of duplicate pairs with scores, sorted by confidence
        """
        duplicates = []

        # Compare each pair
        for i in range(len(descriptions)):
            for j in range(i + 1, len(descriptions)):
                desc1 = descriptions[i]
                desc2 = descriptions[j]

                match_result = self.match_score(desc1, desc2)

                if match_result['is_match']:
                    # Add indices for reference
                    match_result['index_1'] = i
                    match_result['index_2'] = j
                    duplicates.append(match_result)

        # Sort by combined score (descending)
        duplicates.sort(key=lambda x: x['combined_score'], reverse=True)

        return duplicates

    def cluster_similar_materials(self, descriptions: List[str]) -> Dict[int, List[str]]:
        """
        Cluster materials into groups of similar items.
        Uses the match_score function for equivalence decisions.

        Returns:
            Dictionary mapping cluster ID to list of descriptions in that cluster
        """
        clusters = {}
        cluster_id = 0
        assigned = set()

        for i, desc1 in enumerate(descriptions):
            if i in assigned:
                continue

            # Start new cluster
            clusters[cluster_id] = [descriptions[i]]
            assigned.add(i)

            # Find all items that are equivalent with this item
            for j, desc2 in enumerate(descriptions):
                if j in assigned or i == j:
                    continue

                match_result = self.match_score(desc1, desc2)
                if match_result['is_match']:
                    clusters[cluster_id].append(desc2)
                    assigned.add(j)

            cluster_id += 1

        return clusters

    def get_candidate_materials(self, query_description: str, candidate_descriptions: List[str],
                              top_k: int = 20) -> List[Tuple[str, float]]:
        """
        Retrieve candidate materials using semantic similarity (for future pgvector integration).
        Returns top-k candidates sorted by semantic similarity score.

        Args:
            query_description: The material description to find matches for
            candidate_descriptions: List of candidate material descriptions
            top_k: Number of top candidates to return

        Returns:
            List of (description, similarity_score) tuples sorted by score descending
        """
        if not candidate_descriptions:
            return []

        # Calculate semantic similarity with query for all candidates
        query_embedding = self.get_semantic_embedding(query_description)
        similarities = []

        for desc in candidate_descriptions:
            try:
                desc_embedding = self.get_semantic_embedding(desc)
                similarity = float(cosine_similarity([query_embedding], [desc_embedding])[0][0])
                similarities.append((desc, similarity))
            except Exception as e:
                logger.warning(f"Error calculating similarity for {desc}: {e}")
                similarities.append((desc, 0.0))

        # Sort by similarity score descending and return top-k
        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:top_k]

def demonstrate_matching():
    """Demonstrate the matching engine with examples from the specification."""
    matcher = MatchingEngine()

    # Test cases from the SIH 26099 specification
    test_pairs = [
        # Should be EXACT_DUPLICATE (same material, different descriptions)
        ("BALL VL 2 IN CL300", "BALL VALVE 2\" CLASS 300"),
        ("BALL VL 2 IN CL300", "2 IN BALL VALVE CL-300"),

        # Should NOT be merged (same type, different pressure class) - CONSTRAINT VIOLATION
        ("GATE VALVE 4\" CLASS 150", "GATE VALVE 4\" CLASS 300"),

        # Should be TECHNICALLY_IDENTICAL (different format, same specs)
        ("CS PIPE 8 INCH SCH 40", "8\" CARBON STEEL PIPE SCHEDULE 40"),
        ("CS PIPE 8 INCH SCH 40", "PIPE CS 8NB SCH40"),

        # Should be TECHNICALLY_IDENTICAL (flange examples)
        ("FLANGE SS 304 2IN CL150", "2 INCH SS304 FLANGE CLASS 150"),
        ("FLANGE SS 304 2IN CL150", "FLANGE 2NB SS304 CL150"),

        # Functional alternatives (same function, different specs)
        ("CS PIPE 6\" SCH 40", "SS PIPE 6\" SCH 40"),  # Same size/schedule, different material
        ("GATE VALVE 4\" CLASS 150", "GLOBE VALVE 4\" CLASS 150"),  # Same size/pressure, different type

        # Not equivalent (different categories)
        ("FLANGE SS 304 2IN CL150", "BOLT HEX M12"),

        # Cable examples
        ("CU CABLE 11KV 3CX4MM2 XLPE", "COPPER CABLE 11000V 3 CORE 4 SQ MM XLPE"),
        ("ALUMINUM CABLE 415V 4CX2.5MM2 PVC", "AL CABLE 415 VOLT 4CX2.5 SQ MM PVC"),

        # Bearing examples
        ("BEARING 6205 25X52X15 MM", "BEARING 6205 25MM ID 52MM OD 15MM WIDTH"),

        # Gasket examples
        ("GASKET SS 304 50X70X3 MM", "GASKET SS304 50MM ID 70MM OD 3MM THICK"),
    ]

    print("Enhanced Material Matching Demonstration")
    print("=" * 60)

    for desc1, desc2 in test_pairs:
        result = matcher.match_score(desc1, desc2)
        print(f"\nComparing:")
        print(f"  1: {desc1}")
        print(f"  2: {desc2}")
        print(f"  Technical Score: {result['technical_score']:.3f}")
        print(f"  Semantic Score:  {result['semantic_score']:.3f}")
        print(f"  Fuzzy Score:     {result['fuzzy_score']:.3f}")
        print(f"  Constraint Score:{result['constraint_score']:.3f}")
        print(f"  Combined Score:  {result['combined_score']:.3f}")
        print(f"  Match Type:      {result['match_type']}")
        print(f"  Confidence:      {result['confidence']}")
        print(f"  Is Match:        {result['is_match']}")
        print(f"  Technical ID:    {result['technical_identity']}")
        if result['requires_human_review']:
            print("  ⚠️  Requires Human Review")
        print(f"  Reason:          {result['decision_reason']}")

        # Show evidence
        evidence = result['evidence']
        if evidence['matched_attributes']:
            print(f"  ✓ Matched:       {', '.join(evidence['matched_attributes'][:5])}{'...' if len(evidence['matched_attributes']) > 5 else ''}")
        if evidence['conflicting_attributes']:
            print(f"  ⚠ Conflicting:   {len(evidence['conflicting_attributes'])} attributes")
        if evidence['constraint_violations']:
            print(f"  ❌ Constraint Violations: {len(evidence['constraint_violations'])}")

    # Demonstrate duplicate detection
    print("\n\nDuplicate Detection Demo")
    print("=" * 30)

    all_descriptions = [pair[0] for pair in test_pairs] + [pair[1] for pair in test_pairs]
    # Remove duplicates while preserving order
    seen = set()
    unique_descriptions = []
    for desc in all_descriptions:
        if desc not in seen:
            seen.add(desc)
            unique_descriptions.append(desc)

    duplicates = matcher.find_duplicates(unique_descriptions[:15])  # Limit for demo

    print(f"Found {len(duplicates)} duplicate pairs:")
    for i, dup in enumerate(duplicates[:8]):  # Show first 8
        print(f"{i+1}. '{dup['description_1']}'")
        print(f"   ↔ '{dup['description_2']}'")
        print(f"   Score: {dup['combined_score']:.3f} ({dup['match_type']})")
        print(f"   Reason: {dup['decision_reason']}")
        print()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    demonstrate_matching()