def test_get_status_for_executed_analysis(client, auth_headers):
    # Execute analysis first
    exec_res = client.post("/api/v1/analysis/execute", json={
        "query": "Where is the water reservoir?",
        "inputs": [{"name": "Lake.tif", "modality": "Optical"}]
    }, headers=auth_headers)
    assert exec_res.status_code == 200
    analysis_id = exec_res.json()["analysis_id"]

    # Now check status
    status_res = client.get(f"/api/v1/analysis/status/{analysis_id}")
    assert status_res.status_code == 200
    data = status_res.json()
    assert data["id"] == analysis_id
    assert data["status"] == "completed"
    assert data["progress"] == 100
    assert data["result"] is not None
    assert data["result"]["task"] == "Visual Grounding"

def test_get_status_for_upload(client, auth_headers):
    upload_res = client.post("/api/v1/analysis/upload", json={
        "filename": "RawScene.tif"
    }, headers=auth_headers)
    assert upload_res.status_code == 201
    upload_id = upload_res.json()["id"]

    status_res = client.get(f"/api/v1/analysis/status/{upload_id}")
    assert status_res.status_code == 200
    data = status_res.json()
    assert data["id"] == upload_id
    assert data["status"] == "staged"
    assert data["progress"] == 100

def test_get_status_not_found(client):
    response = client.get("/api/v1/analysis/status/non-existent-id-999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

