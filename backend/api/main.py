"""
FastAPI API for NMIG - National Material Intelligence & Harmonization Platform
Provides endpoints for material matching, duplicate detection, and fingerprint generation.
"""

from enum import Enum
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import logging
from services.matching_engine import MatchingEngine, EquivalenceDecision
from models.material_fingerprint import MaterialFingerprint, create_material_fingerprint

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="NMIG - National Material Intelligence & Harmonization Platform",
    description="AI-driven standardization and harmonization of material codes across CPSEs",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize matcher (singleton)
matcher = MatchingEngine()

# Pydantic models for request/response
class MaterialDescription(BaseModel):
    description: str
    original_description: Optional[str] = None

class MaterialComparison(BaseModel):
    description_1: str
    description_2: str

class MatchEvidence(BaseModel):
    matched_attributes: List[str]
    conflicting_attributes: List[Dict[str, Any]]
    constraint_violations: List[Dict[str, Any]]
    component_scores: Dict[str, float]
    weights: Dict[str, float]

class MatchResult(BaseModel):
    description_1: str
    description_2: str
    fingerprint_1: Dict[str, Any]
    fingerprint_2: Dict[str, Any]
    technical_score: float
    semantic_score: float
    fuzzy_score: float
    constraint_score: float
    combined_score: float
    match_type: str
    confidence: str
    is_match: bool
    technical_identity: bool
    requires_human_review: bool
    evidence: MatchEvidence
    decision_reason: str

class DuplicatePair(BaseModel):
    index_1: int
    index_2: int
    description_1: str
    description_2: str
    combined_score: float
    match_type: str
    confidence: str
    decision_reason: str

class DuplicateDetectionResponse(BaseModel):
    duplicates: List[DuplicatePair]
    total_pairs_checked: int

class FingerprintResponse(BaseModel):
    description: str
    fingerprint: Dict[str, Any]

class ClusterResponse(BaseModel):
    clusters: Dict[int, List[str]]
    total_clusters: int

# API Endpoints

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "NMIG - National Material Intelligence & Harmonization Platform",
        "version": "1.0.0",
        "description": "AI-driven standardization and harmonization of material codes across CPSEs",
        "endpoints": {
            "match": "/match - Compare two materials",
            "duplicates": "/duplicates - Find duplicates in a list",
            "fingerprint": "/fingerprint - Generate material fingerprint",
            "cluster": "/cluster - Cluster similar materials",
            "health": "/health - Health check",
            "stats": "/stats - API usage statistics"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "NMIG Material Matching API",
        "version": "1.0.0"
    }

@app.post("/fingerprint", response_model=FingerprintResponse)
async def generate_fingerprint(material: MaterialDescription):
    """
    Generate a Material Fingerprint from a description.

    Converts free-text/material records into structured, category-aware engineering identity.
    """
    try:
        desc = material.original_description or material.description
        fingerprint = create_material_fingerprint(desc)

        return FingerprintResponse(
            description=desc,
            fingerprint=fingerprint.to_dict()
        )
    except Exception as e:
        logger.error(f"Error generating fingerprint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/match", response_model=MatchResult)
async def match_materials(comparison: MaterialComparison):
    """
    Compare two material descriptions for similarity and technical identity.

    Returns detailed match analysis including technical score, semantic score,
    fuzzy score, constraint score, and match classification with explainability evidence.
    """
    try:
        result = matcher.match_score(
            comparison.description_1,
            comparison.description_2
        )

        # Convert evidence to MatchEvidence model
        evidence = MatchEvidence(
            matched_attributes=result['evidence']['matched_attributes'],
            conflicting_attributes=result['evidence']['conflicting_attributes'],
            constraint_violations=result['evidence']['constraint_violations'],
            component_scores=result['evidence']['component_scores'],
            weights=result['evidence']['weights']
        )

        return MatchResult(
            description_1=result['description_1'],
            description_2=result['description_2'],
            fingerprint_1=result['fingerprint_1'],
            fingerprint_2=result['fingerprint_2'],
            technical_score=result['technical_score'],
            semantic_score=result['semantic_score'],
            fuzzy_score=result['fuzzy_score'],
            constraint_score=result['constraint_score'],
            combined_score=result['combined_score'],
            match_type=result['match_type'],
            confidence=result['confidence'],
            is_match=result['is_match'],
            technical_identity=result['technical_identity'],
            requires_human_review=result['requires_human_review'],
            evidence=evidence,
            decision_reason=result['decision_reason']
        )
    except Exception as e:
        logger.error(f"Error matching materials: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/duplicates", response_model=DuplicateDetectionResponse)
async def find_duplicates(materials: List[MaterialDescription]):
    """
    Find duplicate materials in a list of descriptions.

    Identifies duplicate, near-duplicate, and functionally equivalent materials.
    """
    try:
        descriptions = [m.original_description or m.description for m in materials]

        duplicates = matcher.find_duplicates(descriptions)

        # Convert to response format
        duplicate_pairs = []
        for dup in duplicates:
            duplicate_pairs.append(DuplicatePair(
                index_1=dup['index_1'],
                index_2=dup['index_2'],
                description_1=dup['description_1'],
                description_2=dup['description_2'],
                combined_score=dup['combined_score'],
                match_type=dup['match_type'],
                confidence=dup['confidence'],
                decision_reason=dup['decision_reason']
            ))

        total_pairs = len(descriptions) * (len(descriptions) - 1) // 2

        return DuplicateDetectionResponse(
            duplicates=duplicate_pairs,
            total_pairs_checked=total_pairs
        )
    except Exception as e:
        logger.error(f"Error finding duplicates: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cluster", response_model=ClusterResponse)
async def cluster_materials(materials: List[MaterialDescription]):
    """
    Cluster similar materials into groups.

    Groups materials by similarity for easier review and standardization.
    """
    try:
        descriptions = [m.original_description or m.description for m in materials]

        clusters = matcher.cluster_similar_materials(descriptions)

        return ClusterResponse(
            clusters=clusters,
            total_clusters=len(clusters)
        )
    except Exception as e:
        logger.error(f"Error clustering materials: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
async def get_stats():
    """Get API usage statistics."""
    return {
        "matcher_initialized": matcher is not None,
        "technical_weight": matcher.technical_weight,
        "semantic_weight": matcher.semantic_weight,
        "fuzzy_weight": matcher.fuzzy_weight,
        "constraint_weight": matcher.constraint_weight,
        "similarity_threshold": matcher.similarity_threshold,
        "cached_fingerprints": len(matcher.fingerprint_cache),
        "cached_embeddings": len(matcher.embedding_cache)
    }

if __name__ == "__main__":
    uvicorn.run(
        "backend.api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )