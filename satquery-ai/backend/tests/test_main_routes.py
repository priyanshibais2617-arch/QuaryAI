"""Tests for main application REST endpoints: upload, execute, and report export."""
import io
import os
import tempfile
import numpy as np
import pytest
import rasterio


@pytest.fixture
def sample_test_raster():
    """Create a temporary GeoTIFF raster for testing execution and upload."""
    with tempfile.NamedTemporaryFile(suffix=".tif", delete=False) as f:
        file_path = f.name

    data = np.ones((1, 50, 50), dtype=np.uint8) * 128
    with rasterio.open(
        file_path,
        "w",
        driver="GTiff",
        height=50,
        width=50,
        count=1,
        dtype=np.uint8,
        crs="EPSG:4326",
    ) as dst:
        dst.write(data)

    yield file_path

    if os.path.exists(file_path):
        os.remove(file_path)


# -----------------------------------------------------------------------------
# 1. POST /api/v1/analysis/upload (Form / Multipart)
# -----------------------------------------------------------------------------

def test_upload_raster_file_geotiff_success(client):
    """Test uploading a valid GeoTIFF file via multipart form-data."""
    fake_geotiff_bytes = b"II*\x00" + b"\x00" * 100  # Minimal TIFF header simulation
    response = client.post(
        "/api/v1/analysis/upload",
        files={"file": ("test_mumbai.tif", io.BytesIO(fake_geotiff_bytes), "image/tiff")},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "staged"
    assert data["filename"] == "test_mumbai.tif"
    assert "file_path" in data
    assert "metadata" in data
    assert "crs" in data["metadata"]
    assert "bounds" in data["metadata"]


def test_upload_raster_file_benchmark_png_success(client):
    """Test uploading a benchmark PNG file with valid benchmark tag."""
    fake_png_bytes = b"\x89PNG\r\n\x1a\n" + b"\x00" * 50
    response = client.post(
        "/api/v1/analysis/upload",
        files={"file": ("sample_tile.png", io.BytesIO(fake_png_bytes), "image/png")},
        data={"benchmark": "BigEarthNet"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "staged"
    assert data["filename"] == "sample_tile.png"
    assert "metadata" in data
    assert data["metadata"]["crs"] == "EPSG:4326"


def test_upload_raster_file_invalid_format_rejected(client):
    """Test that invalid file extension raises 400 Bad Request."""
    response = client.post(
        "/api/v1/analysis/upload",
        files={"file": ("invalid_notes.txt", io.BytesIO(b"plain text content"), "text/plain")},
    )
    assert response.status_code == 400
    assert "Unsupported or invalid raster file format" in response.json()["detail"]


def test_upload_raster_png_without_benchmark_rejected(client):
    """Test that PNG without approved benchmark tag raises 400 Bad Request."""
    response = client.post(
        "/api/v1/analysis/upload",
        files={"file": ("unapproved.png", io.BytesIO(b"fake png"), "image/png")},
    )
    assert response.status_code == 400


# -----------------------------------------------------------------------------
# 2. POST /api/v1/analysis/execute (Form)
# -----------------------------------------------------------------------------

def test_execute_analysis_form_flow(client, sample_test_raster):
    """Test executing analysis using Form data (query, file_paths, modalities)."""
    response = client.post(
        "/api/v1/analysis/execute",
        data={
            "query": "What is the land cover in this scene?",
            "file_paths": [sample_test_raster],
            "modalities": ["Optical"],
        },
    )

    assert response.status_code == 200
    data = response.json()

    # Verify specialist response contract
    assert data["task"] == "Single Image VQA"
    assert data["workflow"] == "Remote-Sensing VQA"
    assert data["specialist"] == "Remote-Sensing VQA Engine"
    assert "answer" in data
    assert "confidence" in data
    assert "evidence" in data
    assert "executionTrace" in data
    assert len(data["executionTrace"]) == 10
    assert data["prototype"] is True


def test_execute_analysis_empty_file_paths_raises_400(client):
    """Test that empty file_paths raises 400 Bad Request."""
    response = client.post(
        "/api/v1/analysis/execute",
        data={
            "query": "Where is the reservoir?",
            "file_paths": [],
        },
    )
    assert response.status_code == 400
    assert "file_paths cannot be empty" in response.json()["detail"]


# -----------------------------------------------------------------------------
# 3. POST /api/v1/export/report
# -----------------------------------------------------------------------------

def test_export_report_pdf_generation(client):
    """Test exporting executive PDF dossier from analysis payload."""
    payload = {
        "task": "Single Image VQA",
        "workflow": "Remote-Sensing VQA",
        "specialist": "Remote-Sensing VQA Engine",
        "query": "Describe scene land cover.",
        "answer": "The scene displays agricultural cropland and water features.",
        "confidence": 0.92,
        "executionTrace": [
            "Step 1: Input received - Staged 1 file.",
            "Step 2: Input validated - Verified headers.",
        ],
    }

    response = client.post("/api/v1/export/report", json=payload)

    assert response.status_code == 200
    assert response.headers.get("content-type") == "application/pdf"
    assert "attachment; filename=satquery_dossier.pdf" in response.headers.get("content-disposition", "")
    assert response.content.startswith(b"%PDF-")
    assert len(response.content) > 1000
