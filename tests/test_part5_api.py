"""
Integration tests for Part 5: FastAPI Web API Endpoints.
"""

import io
import pytest
from fastapi.testclient import TestClient
from src.web.app import app


@pytest.fixture
def client():
    return TestClient(app)


def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "HEALTHY"
    assert data["problem_statement"] == "SIH26099"


def test_team_info(client):
    res = client.get("/api/team")
    assert res.status_code == 200
    data = res.json()
    assert data["team_name"] == "Spartans_1"
    assert data["team_id"] == "137862"
    assert data["problem_statement_id"] == "SIH26099"


def test_analytics_kpis(client):
    res = client.get("/api/analytics/kpis")
    assert res.status_code == 200
    data = res.json()
    assert data["total_material_records"] > 0
    assert data["total_duplicate_clusters"] > 0
    assert "cpse_distribution" in data
    assert "IOCL" in data["cpse_distribution"]


def test_list_clusters_and_approval_flow(client):
    # 1. Fetch clusters
    res = client.get("/api/clusters")
    assert res.status_code == 200
    clusters = res.json()
    assert len(clusters) > 0

    # Pick a pending cluster (e.g. Bolts or Pipes)
    pending = next((c for c in clusters if c["status"] == "PENDING_REVIEW"), None)
    if pending:
        cluster_id = pending["cluster_id"]
        # 2. Approve cluster
        approve_res = client.post(
            f"/api/clusters/{cluster_id}/approve",
            json={"approved_by": "TEST_OFFICER"}
        )
        assert approve_res.status_code == 200
        approve_data = approve_res.json()
        assert approve_data["status"] == "SUCCESS"
        assert approve_data["assigned_cnmc"].startswith("CNMC-")

        # 3. Verify status updated
        get_res = client.get(f"/api/clusters/{cluster_id}")
        assert get_res.json()["status"] == "APPROVED"


def test_catalog_search(client):
    # Search by keyword "VALVE"
    res = client.get("/api/catalog?query=VALVE")
    assert res.status_code == 200
    items = res.json()
    assert len(items) > 0
    for item in items:
        assert "VALVE" in item["standard_description"] or "VALVE" in item["raw_description"]


def test_csv_export(client):
    res = client.get("/api/mappings/export")
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    content = res.text
    assert "COMMON_NATIONAL_CODE_CNMC" in content
    assert "LOCAL_MATERIAL_CODE" in content


def test_sample_csv_download(client):
    res = client.get("/api/sample-csv")
    assert res.status_code == 200
    assert "CPSE_ID,Material_Code,Description" in res.text


def test_upload_catalog_csv(client):
    csv_data = (
        "CPSE_ID,Material_Code,Description,UoM,Unit_Price_INR\n"
        "IOCL,IOC-TST-9901,BALL VALVE 2 INCH 150# SS316 RF,NOS,12000.0\n"
    )
    files = {"file": ("test_catalog.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")}
    res = client.post("/api/upload-catalog", files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert data["parsed_records"] == 1


def test_governance_ledger_endpoint(client):
    res = client.get("/api/governance/ledger")
    assert res.status_code == 200
    data = res.json()
    assert data["integrity_verified"] is True
    assert data["total_blocks"] >= 2  # Genesis + initial valve approval
    assert len(data["chain"]) >= 2
    # Verify latest block structure
    latest = data["chain"][0]
    assert "current_hash" in latest
    assert "previous_hash" in latest
    assert "actor" in latest
