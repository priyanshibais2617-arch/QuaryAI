from datetime import timedelta
import pytest
from app.core.auth import create_access_token

def test_unauthenticated_upload_rejected(client):
    res = client.post("/api/v1/analysis/upload", json={"filename": "Unauth.tif"})
    assert res.status_code == 401
    assert "credentials were not provided" in res.json()["detail"].lower()

def test_unauthenticated_execute_rejected(client):
    res = client.post("/api/v1/analysis/execute", json={"query": "test"})
    assert res.status_code == 401
    assert "credentials were not provided" in res.json()["detail"].lower()

def test_invalid_token_rejected(client):
    headers = {"Authorization": "Bearer not-a-valid-jwt-token"}
    res = client.post("/api/v1/analysis/upload", json={"filename": "BadToken.tif"}, headers=headers)
    assert res.status_code == 401
    assert "invalid authentication token" in res.json()["detail"].lower()

def test_expired_token_rejected(client):
    expired_token = create_access_token(
        {"sub": "expired-user", "email": "expired@satquery.ai"},
        expires_delta=timedelta(seconds=-30),
    )
    headers = {"Authorization": f"Bearer {expired_token}"}
    res = client.post("/api/v1/analysis/upload", json={"filename": "Expired.tif"}, headers=headers)
    assert res.status_code == 401
    assert "expired" in res.json()["detail"].lower()

def test_public_endpoints_accessible_without_auth(client):
    # Catalog is public
    cat_res = client.get("/api/v1/catalog/images")
    assert cat_res.status_code == 200
    assert "images" in cat_res.json()

    # Status check is public (accessible by anyone with the analysis/upload ID)
    status_res = client.get("/api/v1/analysis/status/non-existent-id")
    assert status_res.status_code == 404  # Not 401

def test_authenticated_user_auto_provisioning(client):
    sub = "supabase-user-new-99"
    email = "specialist@satquery.ai"
    token = create_access_token({
        "sub": sub,
        "email": email,
        "user_metadata": {"role": "Lead Scientist"},
    })
    headers = {"Authorization": f"Bearer {token}"}

    upload_res = client.post(
        "/api/v1/analysis/upload",
        json={"filename": "Specialist_Scene.tif", "modality": "Optical"},
        headers=headers,
    )
    assert upload_res.status_code == 201

    exec_res = client.post(
        "/api/v1/analysis/execute",
        json={
            "query": "Describe the scene.",
            "inputs": [{"name": "Specialist_Scene.tif", "modality": "Optical"}],
        },
        headers=headers,
    )
    assert exec_res.status_code == 200
