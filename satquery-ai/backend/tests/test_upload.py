def test_upload_file_metadata_success(client, auth_headers):
    payload = {
        "filename": "Mumbai_Optical.tif",
        "size": 32000000,
        "modality": "Optical",
        "file_type": "GeoTIFF",
        "dimensions": "2048 x 2048",
        "bands": "RGB + NIR",
    }
    response = client.post("/api/v1/analysis/upload", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["id"].startswith("upl-")
    assert data["filename"] == "Mumbai_Optical.tif"
    assert data["modality"] == "Optical"
    assert data["status"] == "staged"
    assert "created_at" in data

def test_upload_inferred_sar_modality(client, auth_headers):
    payload = {
        "filename": "Sentinel1_Radar_Scene.tif",
        "size": 50000000,
    }
    response = client.post("/api/v1/analysis/upload", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["modality"] == "SAR"
    assert data["status"] == "staged"

def test_upload_missing_filename_fails(client, auth_headers):
    response = client.post("/api/v1/analysis/upload", json={"size": 1000}, headers=auth_headers)
    assert response.status_code == 422

def test_upload_geotiff_accepted_no_tag(client, auth_headers):
    # GeoTIFF (.tif / .tiff) is always accepted without any benchmark tag
    for fname in ["scene1.tif", "scene2.tiff"]:
        response = client.post("/api/v1/analysis/upload", json={"filename": fname}, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["filename"] == fname
        assert data["benchmark_source"] is None

def test_upload_png_rejected_no_tag(client, auth_headers):
    # PNG without benchmark tag must be rejected with 422
    response = client.post("/api/v1/analysis/upload", json={"filename": "benchmark_scene.png"}, headers=auth_headers)
    assert response.status_code == 422
    err_detail = response.json()["detail"].lower()
    assert "png and jpeg formats are only accepted" in err_detail
    assert "bigearthnet" in err_detail

def test_upload_png_accepted_with_bigearthnet(client, auth_headers):
    # PNG with valid benchmark_source="BigEarthNet" accepted with 201
    payload = {
        "filename": "benchmark_scene.png",
        "benchmark_source": "BigEarthNet",
    }
    response = client.post("/api/v1/analysis/upload", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["filename"] == "benchmark_scene.png"
    assert data["benchmark_source"] == "BigEarthNet"

def test_upload_png_rejected_with_invalid_benchmark_source(client, auth_headers):
    # PNG with unlisted/invalid benchmark_source must be rejected with 422
    payload = {
        "filename": "benchmark_scene.png",
        "benchmark_source": "CustomDataset123",
    }
    response = client.post("/api/v1/analysis/upload", json=payload, headers=auth_headers)
    assert response.status_code == 422
    err_detail = response.json()["detail"].lower()
    assert "invalid benchmark_source" in err_detail
    assert "customdataset123" in err_detail

def test_upload_jpeg_accepted_with_allowed_benchmarks(client, auth_headers):
    # Test remaining allowed benchmarks with .jpg and .jpeg
    for b_source in ["VRSBench", "RSVQA", "CDVQA"]:
        payload = {
            "filename": f"scene_{b_source.lower()}.jpg",
            "benchmark_source": b_source,
        }
        response = client.post("/api/v1/analysis/upload", json=payload, headers=auth_headers)
        assert response.status_code == 201
        assert response.json()["benchmark_source"] == b_source

def test_upload_unsupported_format_rejected(client, auth_headers):
    # Files with unapproved extensions (e.g. .pdf, .txt, .zip) must be rejected with 422
    for bad_name in ["doc.pdf", "data.txt", "archive.zip"]:
        response = client.post("/api/v1/analysis/upload", json={"filename": bad_name}, headers=auth_headers)
        assert response.status_code == 422
        assert "unsupported file format" in response.json()["detail"].lower()


