"""
FastAPI Backend Application for National Material Master Harmonization Platform.
Serves REST APIs for Analytics, AI Resolution Workbench, Catalog Search, CSV Upload, and Governance.
Smart India Hackathon 2026 - Team Spartans_1 (SIH26099)
"""

import io
import csv
import re
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Query, Response, File, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from pydantic import BaseModel
from pathlib import Path

from src.models.material import RawMaterialRecord, NormalizedMaterial, CPSEIdentifier, MatchStatus
from src.data.sample_cpse_catalogs import SAMPLE_CPSE_DATASETS
from src.engine.ingestion import ingest_and_normalize_records, parse_csv_catalog
from src.engine.clusterer import cluster_materials_by_similarity, DuplicateCluster
from src.engine.mapping_registry import MappingRegistry, MappingRecord
from src.taxonomy.unspcs_rules import lookup_taxonomy_for_item_type
from src.governance.audit_ledger import TamperEvidentAuditLedger
from src.engine.pipeline_output import generate_all_core_ai_outputs

from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

app = FastAPI(
    title="National Material Master Harmonizer API",
    description="One Nation – One Material Code AI Framework for Indian CPSEs (SIH26099)",
    version="2.0.0"
)

# Enable CORS for external frontends, cloud gateways, and developer tools
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enable GZip compression for high-performance payload transfers
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Persistent In-Memory State
NORMALIZED_STORE: List[NormalizedMaterial] = []
CLUSTER_STORE: Dict[str, DuplicateCluster] = {}
REGISTRY = MappingRegistry()
AUDIT_LEDGER = TamperEvidentAuditLedger()


def initialize_sample_data():
    """Initializes the engine with curated multi-CPSE datasets."""
    global NORMALIZED_STORE, CLUSTER_STORE, REGISTRY, AUDIT_LEDGER
    NORMALIZED_STORE = ingest_and_normalize_records(SAMPLE_CPSE_DATASETS)
    clusters = cluster_materials_by_similarity(NORMALIZED_STORE, confidence_threshold=75.0)
    CLUSTER_STORE = {c.cluster_id: c for c in clusters}

    # Automatically pre-harmonize one cluster (e.g. Cluster 1 - Valves) to show active history
    valve_cluster = next((c for c in clusters if "VALVE" in c.canonical_description), None)
    if valve_cluster:
        issued_cnmc = REGISTRY.harmonize_cluster(valve_cluster, approved_by="DIRECTOR_PROCUREMENT_COMMITTEE")
        AUDIT_LEDGER.append_event(
            actor="DIRECTOR_PROCUREMENT_COMMITTEE (APPROVER)",
            action="APPROVE_CLUSTER",
            cluster_id=valve_cluster.cluster_id,
            assigned_cnmc=issued_cnmc,
            participating_records=[f"{r.cpse_id.value}::{r.local_material_code}" for r in valve_cluster.records]
        )


# Run initialization on import
initialize_sample_data()


# Pydantic schemas for requests
class ApprovalRequest(BaseModel):
    approved_by: str = "EXECUTIVE_REVIEWER"
    role: str = "APPROVER"
    justification: str = "Verified specification equivalency across CPSE master records."


class ManualMapRequest(BaseModel):
    cpse_id: str
    local_material_code: str
    target_cnmc: str
    mapped_by: str = "DATA_STEWARD_OFFICER"
    role: str = "DATA_STEWARD"
    justification: str = "Manual master data harmonization per engineering drawing review."


class RevertMappingRequest(BaseModel):
    cpse_id: str
    local_material_code: str
    reverted_by: str = "LEAD_REVIEWER"
    reason: str = "Discrepancy found in metallurgy grade after physical sample test."


@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "system": "National Material Master Framework (NMIG)",
        "version": "2.0.0",
        "team": "Spartans_1",
        "problem_statement": "SIH26099"
    }


@app.get("/api/team")
def get_team_info():
    """Returns presentation details matching SIH26099."""
    return {
        "problem_statement_id": "SIH26099",
        "problem_statement_title": "AI-Driven Standardization and Harmonization of Material Codes Across CPSEs",
        "theme": "Smart Automation",
        "category": "Software",
        "team_id": "137862",
        "team_name": "Spartans_1",
        "platform_name": "MatSync AI — National Material Intelligence & Harmonization Platform",
        "repository_url": "https://github.com/shindesiddhant-415/SIH-2026-PSS26263-"
    }


@app.get("/api/analytics/kpis")
def get_national_kpis():
    """Returns top-level executive metrics for dashboard."""
    total_records = len(NORMALIZED_STORE)
    total_clusters = len(CLUSTER_STORE)
    approved_clusters = sum(1 for c in CLUSTER_STORE.values() if c.status == "APPROVED")
    pending_clusters = total_clusters - approved_clusters

    potential_savings = sum(c.potential_savings_inr for c in CLUSTER_STORE.values())
    realized_savings = sum(c.potential_savings_inr for c in CLUSTER_STORE.values() if c.status == "APPROVED")

    cpse_breakdown = {}
    for r in NORMALIZED_STORE:
        cpse_breakdown[r.cpse_id.value] = cpse_breakdown.get(r.cpse_id.value, 0) + 1

    return {
        "total_material_records": total_records,
        "total_duplicate_clusters": total_clusters,
        "approved_clusters": approved_clusters,
        "pending_review_clusters": pending_clusters,
        "harmonization_progress_pct": round((approved_clusters / max(total_clusters, 1)) * 100, 1),
        "total_potential_savings_inr": potential_savings,
        "realized_savings_inr": realized_savings,
        "active_cpses_count": len(cpse_breakdown),
        "cpse_distribution": cpse_breakdown,
        "team_info": {
            "team_name": "Spartans_1",
            "team_id": "137862",
            "problem_statement": "SIH26099"
        }
    }


@app.get("/api/clusters")
def list_clusters(status: Optional[str] = Query(None)):
    """Returns candidate duplicate clusters."""
    results = list(CLUSTER_STORE.values())
    if status:
        results = [c for c in results if c.status.upper() == status.upper()]
    return results


@app.get("/api/clusters/{cluster_id}")
def get_cluster(cluster_id: str):
    cluster = CLUSTER_STORE.get(cluster_id)
    if not cluster:
        raise HTTPException(status_code=404, detail="Cluster not found")
    return cluster


@app.get("/api/pipeline/outputs")
def get_core_ai_pipeline_outputs():
    """
    Requirement 11: Most Important AI Output.
    Produces for every existing material the canonical 8-tuple:
    CPSE Code -> Standardized Description -> Standard Specifications -> Classification ->
    Similar/Equivalent Materials -> Confidence Score -> Common National Material Code -> Approval Status
    """
    outputs = generate_all_core_ai_outputs(NORMALIZED_STORE, list(CLUSTER_STORE.values()), REGISTRY)
    return outputs


@app.post("/api/materials/manual-map")
@app.post("/api/mappings/manual")
def manual_mapping(req: ManualMapRequest):
    """
    Requirement 5: Manual Mapping by Data Steward / Domain Expert.
    """
    target_record = next(
        (r for r in NORMALIZED_STORE if r.cpse_id.value == req.cpse_id.upper() and r.local_material_code == req.local_material_code),
        None
    )
    if not target_record:
        raise HTTPException(status_code=404, detail="Material code not found for specified CPSE")

    mapping_record = REGISTRY.manual_map_material(
        item=target_record,
        target_cnmc=req.target_cnmc,
        mapped_by=req.mapped_by,
        role=req.role,
        justification=req.justification
    )

    AUDIT_LEDGER.append_event(
        actor=f"{req.mapped_by} ({req.role})",
        action="MANUAL_MAP_OVERRIDE",
        cluster_id=target_record.cluster_id,
        assigned_cnmc=req.target_cnmc,
        participating_records=[f"{target_record.cpse_id.value}::{target_record.local_material_code}"]
    )

    return {
        "status": "SUCCESS",
        "message": f"Successfully mapped {target_record.local_material_code} to {req.target_cnmc}",
        "record": mapping_record.model_dump()
    }


@app.post("/api/mappings/revert")
def revert_mapping(req: RevertMappingRequest):
    """
    Requirement 7: Mapping Reversal and Version Incrementing.
    """
    reverted = REGISTRY.revert_mapping(
        cpse_id=req.cpse_id,
        local_code=req.local_material_code,
        reverted_by=req.reverted_by,
        reason=req.reason
    )
    if not reverted:
        raise HTTPException(status_code=404, detail="Active mapping not found to revert")

    target_record = next(
        (r for r in NORMALIZED_STORE if r.cpse_id.value == req.cpse_id.upper() and r.local_material_code == req.local_material_code),
        None
    )
    if target_record:
        target_record.assigned_cnmc = None
        target_record.match_status = MatchStatus.MANUAL_REVIEW
        target_record.justification = f"REVERTED: {req.reason}"

    AUDIT_LEDGER.append_event(
        actor=req.reverted_by,
        action="REVERT_MAPPING",
        cluster_id=None,
        assigned_cnmc=reverted.assigned_cnmc,
        participating_records=[f"{req.cpse_id}::{req.local_material_code}"]
    )

    return {"status": "SUCCESS", "message": "Mapping reverted and deactivated", "reverted_record": reverted.model_dump()}


@app.post("/api/clusters/{cluster_id}/approve")
def approve_cluster(cluster_id: str, req: ApprovalRequest):
    """Approves duplicate cluster and issues Common National Material Code with justification."""
    cluster = CLUSTER_STORE.get(cluster_id)
    if not cluster:
        raise HTTPException(status_code=404, detail="Cluster not found")

    issued_cnmc = REGISTRY.harmonize_cluster(
        cluster=cluster,
        approved_by=req.approved_by,
        approved_by_role=req.role,
        justification_comment=req.justification
    )

    AUDIT_LEDGER.append_event(
        actor=f"{req.approved_by} ({req.role})",
        action="APPROVE_CLUSTER",
        cluster_id=cluster_id,
        assigned_cnmc=issued_cnmc,
        participating_records=[f"{r.cpse_id.value}::{r.local_material_code}" for r in cluster.records]
    )

    return {
        "status": "SUCCESS",
        "cluster_id": cluster_id,
        "assigned_cnmc": issued_cnmc,
        "canonical_description": cluster.canonical_description,
        "mapped_records_count": len(cluster.records),
        "approved_by": req.approved_by,
        "role": req.role,
        "justification": req.justification
    }


@app.get("/api/governance/ledger")
def get_governance_ledger():
    """
    Requirement 7 & 9: Tamper-evident cryptographically chained audit ledger.
    """
    is_valid = AUDIT_LEDGER.verify_integrity()
    return {
        "integrity_verified": is_valid,
        "total_blocks": len(AUDIT_LEDGER.chain),
        "chain": [tx.model_dump() for tx in reversed(AUDIT_LEDGER.chain)]
    }


@app.post("/api/clusters/{cluster_id}/reject")
def reject_cluster(cluster_id: str):
    cluster = CLUSTER_STORE.get(cluster_id)
    if not cluster:
        raise HTTPException(status_code=404, detail="Cluster not found")
    cluster.status = "REJECTED"
    for r in cluster.records:
        r.match_status = MatchStatus.REJECTED

    AUDIT_LEDGER.append_event(
        actor="REVIEWER",
        action="REJECT_CLUSTER",
        cluster_id=cluster_id,
        assigned_cnmc=None,
        participating_records=[f"{r.cpse_id.value}::{r.local_material_code}" for r in cluster.records]
    )

    return {"status": "REJECTED", "cluster_id": cluster_id}


@app.get("/api/catalog")
def search_catalog(
    query: Optional[str] = Query(None),
    cpse: Optional[str] = Query(None),
    item_type: Optional[str] = Query(None)
):
    """Cross-CPSE unified material search."""
    results = []
    q = (query or "").upper().strip()

    for item in NORMALIZED_STORE:
        if cpse and item.cpse_id.value != cpse.upper():
            continue
        if item_type and (item.attributes.item_type or "") != item_type.upper():
            continue

        if q:
            match_in_desc = q in item.cleaned_description or q in item.standard_description
            match_in_code = q in item.local_material_code or (item.assigned_cnmc and q in item.assigned_cnmc)
            match_in_type = q in (item.attributes.item_type or "")
            if not (match_in_desc or match_in_code or match_in_type):
                continue

        # Look up taxonomy
        tax_code, tax_path = lookup_taxonomy_for_item_type(item.attributes.item_type)

        results.append({
            "record_id": item.record_id,
            "cpse_id": item.cpse_id.value,
            "local_material_code": item.local_material_code,
            "assigned_cnmc": item.assigned_cnmc,
            "standard_description": item.standard_description,
            "raw_description": item.raw_description,
            "standard_uom": item.standard_uom,
            "item_type": item.attributes.item_type,
            "size_dimension": item.attributes.size_dimension,
            "material_grade": item.attributes.material_grade,
            "pressure_rating": item.attributes.pressure_rating,
            "standard_norm": item.attributes.standard_norm,
            "taxonomy_code": tax_code,
            "taxonomy_path": tax_path,
            "match_status": item.match_status.value
        })

    return results


@app.get("/api/mappings/export")
def export_mappings_csv():
    """Generates downloadable CSV cross-reference table."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "CPSE_ID", "LOCAL_MATERIAL_CODE", "COMMON_NATIONAL_CODE_CNMC",
        "STANDARD_DESCRIPTION", "STANDARD_UOM", "RAW_DESCRIPTION",
        "APPROVED_BY", "APPROVED_AT"
    ])

    for row in REGISTRY.export_as_csv_rows():
        writer.writerow([
            row["CPSE"], row["Local_Material_Code"], row["Common_National_Material_Code"],
            row["Standard_Description"], row["Standard_UOM"], row["Raw_Description"],
            row["Approved_By"], row["Approved_At"]
        ])

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=CPSE_CNMC_Mapping_Matrix.csv"}
    )


@app.post("/api/upload-catalog")
async def upload_catalog(file: UploadFile = File(...)):
    """
    Ingests and normalizes an uploaded CSV material catalog in real-time.
    Re-clusters items and logs to audit ledger.
    """
    global NORMALIZED_STORE, CLUSTER_STORE
    try:
        content_bytes = await file.read()
        try:
            content_str = content_bytes.decode('utf-8')
        except UnicodeDecodeError:
            content_str = content_bytes.decode('latin-1')

        raw_records = parse_csv_catalog(content_str)
        if not raw_records:
            raise HTTPException(status_code=400, detail="No valid material records parsed from CSV.")

        new_normalized = ingest_and_normalize_records(raw_records)

        # Merge with existing store (avoid duplicates by CPSE + code)
        existing_keys = {f"{r.cpse_id.value}::{r.local_material_code}" for r in NORMALIZED_STORE}
        added_count = 0
        for item in new_normalized:
            key = f"{item.cpse_id.value}::{item.local_material_code}"
            if key not in existing_keys:
                NORMALIZED_STORE.append(item)
                existing_keys.add(key)
                added_count += 1

        # Re-cluster materials
        clusters = cluster_materials_by_similarity(NORMALIZED_STORE, confidence_threshold=75.0)
        CLUSTER_STORE = {c.cluster_id: c for c in clusters}

        # Log event in audit ledger
        AUDIT_LEDGER.append_event(
            actor="SYSTEM_INGESTION_SERVICE",
            action="CSV_CATALOG_UPLOAD",
            cluster_id=None,
            assigned_cnmc=None,
            participating_records=[f"{r.cpse_id.value}::{r.local_material_code}" for r in new_normalized[:10]]
        )

        return {
            "status": "SUCCESS",
            "filename": file.filename,
            "parsed_records": len(raw_records),
            "newly_added_records": added_count,
            "total_material_records": len(NORMALIZED_STORE),
            "total_duplicate_clusters": len(CLUSTER_STORE)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ingest catalog: {str(e)}")


@app.get("/api/sample-csv")
def download_sample_csv():
    """Returns a ready-to-use sample CSV template for live demonstration."""
    sample_content = (
        "CPSE_ID,Material_Code,Description,UoM,Unit_Price_INR\n"
        "ONGC,ONGC-VLV-4491,BALL VALVE 2 INCH 150# SS316 FLANGED RF ASME B16.34,NOS,14800.0\n"
        "GAIL,GAIL-GAS-PIPE-201,SEAMLESS PIPE CS ASTM A106 GR.B 4 INCH SCH 40,MTR,3200.0\n"
        "BHEL,BHEL-TURB-0988,HEX HEAD BOLT M16 X 65MM GRADE 8.8 HIGH TENSILE,NOS,45.0\n"
        "IOCL,IOC-GKT-7712,SPIRAL WOUND GASKET 3 INCH 300# SS316 WITH GRAPHITE FILLER,NOS,650.0\n"
        "SAIL,SAIL-DSP-BRG-102,DEEP GROOVE BALL BEARING 6205 2RS C3 SKF,NOS,1150.0\n"
    )
    return Response(
        content=sample_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sample_cpse_catalog_template.csv"}
    )


# Serve Static Assets & UI
STATIC_DIR = Path(__file__).parent / "static"
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.get("/", response_class=HTMLResponse)
def index_page():
    index_file = STATIC_DIR / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return HTMLResponse("<h1>National Material Master Harmonization Platform (NMIG)</h1>")
