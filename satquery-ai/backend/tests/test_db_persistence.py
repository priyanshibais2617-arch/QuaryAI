import pytest
from sqlalchemy import select
from app.db.models.raster import Raster
from app.db.models.analysis import Analysis
from app.db.models.catalog import CatalogImage
from app.db.models.user import User

def test_db_raster_persistence(client, auth_headers):
    upload_res = client.post("/api/v1/analysis/upload", json={
        "filename": "Persisted_Scene.tif",
        "size": 42000000,
        "modality": "Optical",
        "file_type": "GeoTIFF",
    }, headers=auth_headers)
    assert upload_res.status_code == 201
    upload_id = upload_res.json()["id"]

    # Verify query status endpoint retrieves from database
    status_res = client.get(f"/api/v1/analysis/status/{upload_id}")
    assert status_res.status_code == 200
    assert status_res.json()["id"] == upload_id
    assert status_res.json()["status"] == "staged"

def test_db_analysis_persistence(client, auth_headers):
    exec_res = client.post("/api/v1/analysis/execute", json={
        "query": "Describe the land cover in this scene.",
        "inputs": [{"name": "Persisted_Scene.tif", "modality": "Optical"}],
    }, headers=auth_headers)
    assert exec_res.status_code == 200
    analysis_id = exec_res.json()["analysis_id"]

    # Verify status retrieved from database
    status_res = client.get(f"/api/v1/analysis/status/{analysis_id}")
    assert status_res.status_code == 200
    data = status_res.json()
    assert data["id"] == analysis_id
    assert data["status"] == "completed"
    assert data["result"]["task"] == "Single Image VQA"
    assert data["result"]["confidence"]["percentage"] == 91

def test_db_catalog_seeding(client):
    cat_res = client.get("/api/v1/catalog/images")
    assert cat_res.status_code == 200
    data = cat_res.json()
    assert data["total"] == 6
    assert len(data["images"]) == 6

