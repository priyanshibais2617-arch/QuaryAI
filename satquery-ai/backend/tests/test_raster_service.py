"""Tests for RasterService: validation, geospatial metadata extraction, and bitemporal change detection."""
import os
import tempfile
import numpy as np
import pytest
import rasterio

from app.services.raster_service import (
    RasterService,
    raster_service,
    BoundsDict,
    apply_radiometric_stretch,
)


@pytest.fixture
def sample_geotiff():
    """Create a temporary GeoTIFF raster for testing."""
    with tempfile.NamedTemporaryFile(suffix=".tif", delete=False) as f:
        file_path = f.name

    data = np.ones((1, 50, 50), dtype=np.uint8) * 100
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


@pytest.fixture
def bitemporal_geotiffs():
    """Create a pair of temporary GeoTIFF rasters with known localized difference."""
    with tempfile.NamedTemporaryFile(suffix=".tif", delete=False) as f1:
        t1_path = f1.name
    with tempfile.NamedTemporaryFile(suffix=".tif", delete=False) as f2:
        t2_path = f2.name

    # Baseline: all zeros
    data1 = np.zeros((1, 100, 100), dtype=np.float32)
    # T2: patch of change in upper-left quadrant (20x20 = 400 pixels out of 10,000 = 4%)
    data2 = np.zeros((1, 100, 100), dtype=np.float32)
    data2[0, 10:30, 10:30] = 1.0

    for path, data in [(t1_path, data1), (t2_path, data2)]:
        with rasterio.open(
            path,
            "w",
            driver="GTiff",
            height=100,
            width=100,
            count=1,
            dtype=np.float32,
            crs="EPSG:4326",
        ) as dst:
            dst.write(data)

    yield t1_path, t2_path

    for path in [t1_path, t2_path]:
        if os.path.exists(path):
            os.remove(path)


# -----------------------------------------------------------------------------
# 1. validate_file Tests
# -----------------------------------------------------------------------------

def test_validate_file_default_geotiff():
    """Accepts .tif and .tiff by default, case-insensitively and without benchmark tags."""
    assert RasterService.validate_file("sentinel2_scene.tif") is True
    assert RasterService.validate_file("landsat_scene.tiff") is True
    assert RasterService.validate_file("SCENE.TIF") is True
    assert RasterService.validate_file("SCENE.TIFF") is True
    assert RasterService.validate_file("imagery.tif", benchmark_tag=None) is True
    assert RasterService.validate_file("imagery.tif", benchmark_tag="BigEarthNet") is True


def test_validate_file_benchmark_images():
    """Accepts .png and .jpg only with approved benchmark tags."""
    valid_tags = ["BigEarthNet", "VRSBench", "RSVQA", "CDVQA"]
    for tag in valid_tags:
        assert RasterService.validate_file("tile.png", benchmark_tag=tag) is True
        assert RasterService.validate_file("tile.jpg", benchmark_tag=tag) is True
        assert RasterService.validate_file("tile.jpeg", benchmark_tag=tag) is True
        assert RasterService.validate_file("TILE.PNG", benchmark_tag=tag) is True

    # Missing benchmark tag
    assert RasterService.validate_file("tile.png") is False
    assert RasterService.validate_file("tile.jpg") is False
    assert RasterService.validate_file("tile.png", benchmark_tag=None) is False

    # Invalid benchmark tag
    assert RasterService.validate_file("tile.png", benchmark_tag="RandomDataset") is False
    assert RasterService.validate_file("tile.jpg", benchmark_tag="ImageNet") is False


def test_validate_file_unsupported_extensions():
    """Rejects unsupported extensions and empty input."""
    assert RasterService.validate_file("metadata.json") is False
    assert RasterService.validate_file("archive.zip") is False
    assert RasterService.validate_file("image.gif") is False
    assert RasterService.validate_file("") is False
    assert RasterService.validate_file(None) is False  # type: ignore


# -----------------------------------------------------------------------------
# 2. extract_geospatial_metadata Tests
# -----------------------------------------------------------------------------

def test_extract_geospatial_metadata_geotiff(sample_geotiff):
    """Extracts valid geospatial metadata from GeoTIFF file."""
    meta = RasterService.extract_geospatial_metadata(sample_geotiff)

    assert "crs" in meta
    assert meta["crs"] == "EPSG:4326"
    assert meta["width"] == 50
    assert meta["height"] == 50
    assert meta["band_count"] == 1
    assert meta["channel_count"] == 1
    assert "transform" in meta
    assert "affine_transform" in meta
    assert len(meta["transform"]) >= 6
    assert meta["dtype"] == "uint8"

    bounds = meta["bounds"]
    assert isinstance(bounds, BoundsDict)
    # Test dict-style access
    assert "left" in bounds
    assert "bottom" in bounds
    assert "right" in bounds
    assert "top" in bounds
    # Test attribute access
    assert isinstance(bounds.left, float)
    assert isinstance(bounds.top, float)
    # Test index access
    assert bounds[0] == bounds["left"]


def test_extract_geospatial_metadata_png_fallback():
    """Provides fallback dummy metadata for benchmark PNGs."""
    meta = RasterService.extract_geospatial_metadata("dummy_sample.png")

    assert meta["crs"] == "EPSG:4326"
    assert meta["width"] == 256
    assert meta["height"] == 256
    assert meta["band_count"] == 3
    assert meta["channel_count"] == 3
    assert "transform" in meta
    assert "affine_transform" in meta
    assert meta["dtype"] == "uint8"
    assert "bounds" in meta
    assert meta["bounds"]["left"] == 0.0
    assert meta["bounds"]["right"] == 256.0


def test_extract_geospatial_metadata_missing_file_graceful():
    """Gracefully handles missing or unreadable GeoTIFFs without crashing."""
    meta = RasterService.extract_geospatial_metadata("non_existent_raster.tif")

    assert "crs" in meta
    assert "bounds" in meta
    assert meta["width"] == 0
    assert meta["height"] == 0
    assert meta["band_count"] == 0
    assert meta["channel_count"] == 0
    assert "transform" in meta
    assert "affine_transform" in meta
    assert "error" in meta


def test_apply_radiometric_stretch_removes_glare_and_shadows():
    """
    Verifies that 2% to 98% radiometric stretching normalizes multi-band rasters,
    clipping specular sensor glare outliers to 255 and dark shadow noise to 0.
    """
    # Create synthetic multi-band data with extreme glare and dark shadow outliers
    data = np.linspace(100.0, 3000.0, 10000, dtype=np.float32).reshape((2, 50, 100))
    # Inject extreme glare (>99th percentile)
    data[0, 0, 0] = 65535.0
    data[1, 0, 0] = 50000.0
    # Inject dark shadow noise (<1st percentile)
    data[0, 49, 99] = -50.0
    data[1, 49, 99] = 0.0

    stretched = apply_radiometric_stretch(data, p_min=2.0, p_max=98.0)

    assert stretched.dtype == np.uint8
    assert stretched.shape == (2, 50, 100)
    assert stretched.min() == 0
    assert stretched.max() == 255
    # Extreme glare must be clipped to 255
    assert stretched[0, 0, 0] == 255
    assert stretched[1, 0, 0] == 255
    # Extreme shadows must be lifted/clipped to 0
    assert stretched[0, 49, 99] == 0
    assert stretched[1, 49, 99] == 0


def test_ingest_geospatial_raster_and_benchmark(sample_geotiff):
    """
    Verifies strict GeoTIFF ingestion with transform extraction and radiometric stretch,
    as well as transparent fallback ingestion for benchmark images.
    """
    # 1. GeoTIFF ingestion
    arr, meta = RasterService.ingest_geospatial_raster(sample_geotiff, apply_stretch=True, target_bands=3)
    assert arr.shape == (3, 50, 50)
    assert arr.dtype == np.uint8
    assert meta["crs"] == "EPSG:4326"
    assert "transform" in meta
    assert meta["channel_count"] == 1

    # 2. Benchmark PNG transparent fallback
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as f:
        png_path = f.name
    try:
        from PIL import Image
        img = Image.new("RGB", (64, 64), color=(100, 150, 200))
        img.save(png_path)

        png_arr, png_meta = RasterService.ingest_geospatial_raster(png_path)
        assert png_arr.shape == (3, 64, 64)
        assert png_arr.dtype == np.uint8
        assert png_meta["channel_count"] == 3
        assert "transform" in png_meta

        # 3. raster_to_pil conversion
        pil_img = RasterService.raster_to_pil(sample_geotiff)
        assert pil_img.size == (50, 50)
        assert pil_img.mode == "RGB"
    finally:
        if os.path.exists(png_path):
            os.remove(png_path)



# -----------------------------------------------------------------------------
# 3. compute_bitemporal_change Tests
# -----------------------------------------------------------------------------

def test_compute_bitemporal_change_identical(sample_geotiff):
    """Zero change detected between identical rasters."""
    result = RasterService.compute_bitemporal_change(sample_geotiff, sample_geotiff)

    assert result["change_percentage"] == 0.0
    assert result["clusters_identified"] == 0
    assert result["changed_pixels"] == 0
    assert result["total_pixels"] == 2500


def test_compute_bitemporal_change_with_difference(bitemporal_geotiffs):
    """Detects change percentage and clusters on different rasters."""
    t1_path, t2_path = bitemporal_geotiffs
    result = RasterService.compute_bitemporal_change(t1_path, t2_path, threshold=0.4)

    # 400 pixels changed out of 10000 = 4.0%
    assert result["change_percentage"] == 4.0
    assert result["clusters_identified"] >= 1
    assert result["changed_pixels"] == 400
    assert result["total_pixels"] == 10000


def test_compute_bitemporal_change_missing_file_graceful():
    """Handles RasterioIOError gracefully when one or both files are missing."""
    result = RasterService.compute_bitemporal_change("missing_t1.tif", "missing_t2.tif")

    assert result["change_percentage"] == 0.0
    assert result["clusters_identified"] == 0
    assert "error" in result


def test_singleton_raster_service_instance():
    """Verifies default singleton instance is functional."""
    assert raster_service.validate_file("scene.tif") is True
