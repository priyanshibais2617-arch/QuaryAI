"""Tests for live neural network pipelines and pixel-math engines in specialists.py."""
import os
import tempfile
import numpy as np
import pytest
import rasterio
from PIL import Image

from app.services.specialists import (
    SpecialistEngine,
    specialist_engine,
    geotiff_to_pil,
    compute_bitemporal_pixel_difference,
    extract_radar_backscatter_statistics,
    run_blip_vqa,
    run_blip_captioning,
    run_owlvit_grounding,
    BIGEARTHNET_19_CLASSES,
    classify_bigearthnet_19,
)



@pytest.fixture
def sample_geotiff_pair():
    """Create two sample GeoTIFF files for testing."""
    with tempfile.NamedTemporaryFile(suffix="_t1.tif", delete=False) as f1, \
         tempfile.NamedTemporaryFile(suffix="_t2.tif", delete=False) as f2:
        p1, p2 = f1.name, f2.name

    data1 = np.ones((3, 50, 50), dtype=np.uint8) * 80
    data2 = np.ones((3, 50, 50), dtype=np.uint8) * 160

    with rasterio.open(p1, "w", driver="GTiff", height=50, width=50, count=3, dtype=np.uint8, crs="EPSG:4326") as dst:
        dst.write(data1)
    with rasterio.open(p2, "w", driver="GTiff", height=50, width=50, count=3, dtype=np.uint8, crs="EPSG:4326") as dst:
        dst.write(data2)

    yield p1, p2

    for p in [p1, p2]:
        if os.path.exists(p):
            os.remove(p)


@pytest.fixture
def sample_sar_geotiff():
    """Create a sample 2-band SAR GeoTIFF."""
    with tempfile.NamedTemporaryFile(suffix="_sar.tif", delete=False) as f:
        sar_path = f.name

    sar_data = np.random.randint(20, 200, (2, 50, 50), dtype=np.uint8)
    with rasterio.open(sar_path, "w", driver="GTiff", height=50, width=50, count=2, dtype=np.uint8, crs="EPSG:4326") as dst:
        dst.write(sar_data)

    yield sar_path

    if os.path.exists(sar_path):
        os.remove(sar_path)


# -----------------------------------------------------------------------------
# 1. GeoTIFF-to-PIL Conversion Tests
# -----------------------------------------------------------------------------

def test_geotiff_to_pil_valid_geotiff(sample_geotiff_pair):
    """Verify rasterio GeoTIFF conversion to 3-channel RGB PIL Image."""
    p1, _ = sample_geotiff_pair
    img = geotiff_to_pil(p1)

    assert isinstance(img, Image.Image)
    assert img.mode == "RGB"
    assert img.size == (50, 50)


def test_geotiff_to_pil_missing_file_graceful():
    """Verify non-existent path gracefully produces a valid synthetic PIL image."""
    img = geotiff_to_pil("non_existent_file.tif")

    assert isinstance(img, Image.Image)
    assert img.mode == "RGB"
    assert img.size == (256, 256)


# -----------------------------------------------------------------------------
# 2. Pixel-Level Absolute Difference Tests (Bi-temporal)
# -----------------------------------------------------------------------------

def test_compute_bitemporal_pixel_difference(sample_geotiff_pair):
    """Verify pixel-level absolute difference calculation, delta mask, and trend classification."""
    p1, p2 = sample_geotiff_pair
    result = compute_bitemporal_pixel_difference(p1, p2)

    assert "change_percentage" in result
    assert isinstance(result["change_percentage"], (int, float))
    assert result["change_percentage"] >= 0.0
    assert "trend" in result
    assert result["trend"] in ["increased", "decreased", "remained unchanged"]
    assert "trend_summary" in result
    assert "changes" in result
    assert len(result["changes"]) > 0
    assert "evidence" in result
    assert result["evidence"]["type"] == "bitemporal-change"
    assert "mean_pixel_delta" in result["evidence"]
    assert result["evidence"]["delta_mask_generated"] is True


# -----------------------------------------------------------------------------
# 3. Radar Backscatter Statistics Tests (Optical-SAR)
# -----------------------------------------------------------------------------

def test_extract_radar_backscatter_statistics(sample_sar_geotiff):
    """Verify calibrated radar backscatter statistics extraction (sigma0 dB) and scattering mechanisms."""
    result = extract_radar_backscatter_statistics(sample_sar_geotiff)

    assert "radar_statistics" in result
    stats = result["radar_statistics"]
    assert "mean_backscatter_db" in stats
    assert "std_backscatter_db" in stats
    assert "mean_intensity" in stats
    assert "polarization_channels" in stats
    assert stats["polarization_channels"] == 2
    assert stats["calibration_constant_db"] == -83.0
    assert "double_bounce_urban_pct" in stats
    assert "specular_water_pct" in stats
    assert "volume_vegetation_pct" in stats
    assert "optical-sar-fusion" in result["evidence"]["type"]
    assert "scattering_mechanisms" in result["evidence"]
    assert "calibration_formula" in result["evidence"]


# -----------------------------------------------------------------------------
# 4. OWL-ViT Visual Grounding Coordinate Set Tests
# -----------------------------------------------------------------------------

def test_owlvit_grounding_coordinates(monkeypatch):
    """Verify visual grounding computes [ymin, xmin, ymax, xmax] coordinate sets and UI percentages."""
    monkeypatch.setattr("app.services.specialists.HFModelRegistry.get_owlvit", classmethod(lambda cls: (None, None)))
    dummy_img = Image.new("RGB", (100, 100), color=(50, 100, 70))
    result = run_owlvit_grounding(dummy_img, "Where is the water reservoir?")

    assert "boundingBox" in result
    box = result["boundingBox"]
    assert "ymin" in box
    assert "xmin" in box
    assert "ymax" in box
    assert "xmax" in box
    assert "box_2d" in box
    assert len(box["box_2d"]) == 4

    # Verify coordinate bounds in [0.0, 1.0]
    assert 0.0 <= box["ymin"] <= 1.0
    assert 0.0 <= box["xmin"] <= 1.0
    assert 0.0 <= box["ymax"] <= 1.0
    assert 0.0 <= box["xmax"] <= 1.0
    assert box["ymax"] >= box["ymin"]
    assert box["xmax"] >= box["xmin"]

    # Verify UI percentage contract
    assert "x" in box and "y" in box and "width" in box and "height" in box
    assert result["evidence"]["target_feature"] == "water body"


def test_vqa_remote_sensing_domain_answers(monkeypatch):
    """Verify domain-adapted Single-Image VQA produces spatial precision answers."""
    monkeypatch.setattr("app.services.specialists.HFModelRegistry.get_blip_vqa", classmethod(lambda cls: (None, None)))
    dummy_img = Image.new("RGB", (100, 100), color=(50, 100, 70))

    water_ans = run_blip_vqa(dummy_img, "Is there a river or water reservoir?")
    assert "water" in water_ans.lower() or "drainage" in water_ans.lower()

    urban_ans = run_blip_vqa(dummy_img, "Are there commercial buildings or urban structures?")
    assert "urban" in urban_ans.lower() or "built-up" in urban_ans.lower()

    veg_ans = run_blip_vqa(dummy_img, "What is the forest and vegetation coverage?")
    assert "canopy" in veg_ans.lower() or "vegetative" in veg_ans.lower()


def test_scene_captioning_bigearthnet_19_taxonomy(monkeypatch):
    """Verify scene captioning generates narrative cross-referenced with BigEarthNet-19 taxonomy."""
    monkeypatch.setattr("app.services.specialists.HFModelRegistry.get_blip_captioning", classmethod(lambda cls: (None, None)))
    dummy_img = Image.new("RGB", (100, 100), color=(40, 120, 50))

    caption = run_blip_captioning(dummy_img)
    assert isinstance(caption, str)
    assert "BigEarthNet-19" in caption

    classes = classify_bigearthnet_19(dummy_img, caption)
    assert len(classes) > 0
    for c in classes:
        assert c in BIGEARTHNET_19_CLASSES


# -----------------------------------------------------------------------------
# 5. Full SpecialistEngine End-to-End Tests
# -----------------------------------------------------------------------------

def test_specialist_engine_grounding_end_to_end(sample_geotiff_pair, monkeypatch):
    """Verify full grounding specialist execution produces coordinate sets and 10-step trace."""
    monkeypatch.setattr("app.services.specialists.HFModelRegistry.get_owlvit", classmethod(lambda cls: (None, None)))
    p1, _ = sample_geotiff_pair
    result = specialist_engine.execute(
        task="grounding",
        query="Locate the commercial buildings.",
        file_paths=[p1],
    )

    assert result["task"] == "Visual Grounding"
    assert result["specialist"] == "Visual Grounding Engine"
    assert result["boundingBox"] is not None
    assert "box_2d" in result["boundingBox"]
    assert len(result["boundingBox"]["box_2d"]) == 4
    assert len(result["executionTrace"]) == 10


def test_specialist_engine_captioning_end_to_end(sample_geotiff_pair, monkeypatch):
    """Verify full scene captioning specialist execution integrates BigEarthNet-19 taxonomy."""
    monkeypatch.setattr("app.services.specialists.HFModelRegistry.get_blip_captioning", classmethod(lambda cls: (None, None)))
    p1, _ = sample_geotiff_pair
    result = specialist_engine.execute(
        task="captioning",
        query="Describe this scene.",
        file_paths=[p1],
    )

    assert result["task"] == "Scene Description"
    assert result["specialist"] == "Remote-Sensing Captioning Engine"
    assert "BigEarthNet-19" in result["answer"]
    assert result["evidence"]["taxonomy"] == "BigEarthNet-19"
    assert "bigearthnet_19_classes" in result["evidence"]
    assert len(result["evidence"]["bigearthnet_19_classes"]) > 0
    assert len(result["executionTrace"]) == 10


def test_specialist_engine_bitemporal_end_to_end(sample_geotiff_pair):
    """Verify bi-temporal change specialist calculates pixel differences and trends."""
    p1, p2 = sample_geotiff_pair
    result = specialist_engine.execute(
        task="bitemporal_change",
        query="What changed between baseline and target?",
        file_paths=[p1, p2],
    )

    assert result["task"] == "Bi-Temporal Change Analysis"
    assert result["specialist"] == "Change Understanding Engine"
    assert len(result["changes"]) > 0
    assert "trend" in result
    assert result["evidence"]["delta_mask_generated"] is True
    assert len(result["executionTrace"]) == 10


def test_specialist_engine_optical_sar_end_to_end(sample_geotiff_pair, sample_sar_geotiff):
    """Verify optical-sar specialist extracts calibrated radar statistics and scattering breakdown."""
    p1, _ = sample_geotiff_pair
    result = specialist_engine.execute(
        task="optical_sar",
        query="Combine optical and radar returns.",
        file_paths=[p1, sample_sar_geotiff],
    )

    assert result["task"] == "Optical-SAR Cross-Modal Analysis"
    assert result["specialist"] == "Optical-SAR Analysis Engine"
    assert result["radar_statistics"] is not None
    assert "mean_backscatter_db" in result["radar_statistics"]
    assert result["radar_statistics"]["calibration_constant_db"] == -83.0
    assert "scattering_mechanisms" in result["evidence"]
    assert len(result["executionTrace"]) == 10

