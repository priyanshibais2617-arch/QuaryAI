def test_execute_single_image_vqa(client, auth_headers):
    payload = {
        "query": "Describe the land cover in this image.",
        "inputs": [{"name": "Mumbai_Optical.tif", "modality": "Optical"}],
    }
    response = client.post("/api/v1/analysis/execute", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()

    # Unified contract verification
    assert data["task"] == "Single Image VQA"
    assert data["taskKey"] == "VQA"
    assert data["workflow"] == "Remote-Sensing VQA"
    assert data["specialist"] == "Remote-Sensing VQA Engine"
    assert data["specialistId"] == "vqa_engine"
    assert data["confidence"]["percentage"] == 91
    assert data["confidence"]["type"] == "prototype"
    assert len(data["categories"]) == 4
    assert len(data["executionTrace"]) == 10
    assert data["prototype"] is True
    assert "analysis_id" in data
    assert data["analysis_id"].startswith("ana-")
    assert "timestamp" in data

def test_execute_visual_grounding(client, auth_headers):
    payload = {
        "query": "Where is the water body?",
        "inputs": [{"name": "Bengaluru_Landsat.tif", "modality": "Multispectral"}],
    }
    response = client.post("/api/v1/analysis/execute", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()

    assert data["task"] == "Visual Grounding"
    assert data["workflow"] == "Text-Guided Grounding"
    assert data["specialist"] == "Visual Grounding Engine"
    assert data["confidence"]["percentage"] == 94
    assert data["boundingBox"] is not None
    assert data["boundingBox"]["width"] > 0
    assert data["evidence"]["type"] == "bounding-box"

def test_execute_bitemporal_change_analysis(client, auth_headers):
    payload = {
        "query": "What changed between these two dates?",
        "inputs": [
            {"name": "Delhi_NCR_2024.tif", "modality": "Optical"},
            {"name": "Delhi_NCR_2026.tif", "modality": "Optical"},
        ],
        "configuration": {"temporal": True},
    }
    response = client.post("/api/v1/analysis/execute", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()

    assert data["task"] == "Bi-Temporal Change Analysis"
    assert data["workflow"] == "Change Understanding"
    assert data["specialist"] == "Change Understanding Engine"
    assert data["confidence"]["percentage"] == 91
    assert len(data["changes"]) > 0
    assert data["evidence"]["type"] == "bitemporal-change"

def test_execute_change_vqa(client, auth_headers):
    payload = {
        "query": "Has the built-up area increased?",
        "inputs": [
            {"name": "Delhi_NCR_2024.tif", "modality": "Optical"},
            {"name": "Delhi_NCR_2026.tif", "modality": "Optical"},
        ],
        "configuration": {"temporal": True},
    }
    response = client.post("/api/v1/analysis/execute", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()

    assert data["task"] == "Change VQA"
    assert data["specialist"] == "Change VQA Engine"
    assert data["answer"].startswith("Yes")
    assert data["confidence"]["percentage"] == 92

def test_execute_optical_sar_cross_modal(client, auth_headers):
    payload = {
        "query": "Use the optical and SAR images together to identify built-up and water-covered regions.",
        "inputs": [
            {"name": "Kolkata_Optical.tif", "modality": "Optical"},
            {"name": "Kolkata_SAR.tif", "modality": "SAR"},
        ],
    }
    response = client.post("/api/v1/analysis/execute", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()

    assert data["task"] == "Optical-SAR Cross-Modal Analysis"
    assert data["workflow"] == "Cross-Modal Information Extraction"
    assert data["specialist"] == "Optical-SAR Analysis Engine"
    assert data["confidence"]["percentage"] == 89
    assert len(data["findings"]) > 0
    assert data["evidence"]["type"] == "cross-modal-fusion"

def test_wrong_workflow_prevention(client, auth_headers):
    # Two optical images with single-image VQA query: should NOT choose Optical-SAR
    payload = {
        "query": "Describe the land cover in this scene.",
        "inputs": [
            {"name": "SceneA.tif", "modality": "Optical"},
            {"name": "SceneB.tif", "modality": "Optical"},
        ],
    }
    response = client.post("/api/v1/analysis/execute", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()

    assert data["taskKey"] != "OPTICAL_SAR_ANALYSIS"
    assert data["taskKey"] == "VQA"
    assert "primary target scene" in data["reason"]

