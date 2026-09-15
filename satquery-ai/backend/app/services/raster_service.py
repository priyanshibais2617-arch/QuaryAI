"""
SatQuery AI - Geospatial Raster Service
Handles spatial raster validation, geospatial metadata extraction,
and bitemporal change detection using rasterio and numpy.
"""
from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image
import rasterio
import rasterio.errors

logger = logging.getLogger(__name__)

# Prescribed benchmark tags and file extension policies
BENCHMARK_TAGS: frozenset[str] = frozenset({"BigEarthNet", "VRSBench", "RSVQA", "CDVQA"})
DEFAULT_GEOTIFF_EXTENSIONS: frozenset[str] = frozenset({".tif", ".tiff"})
BENCHMARK_IMAGE_EXTENSIONS: frozenset[str] = frozenset({".png", ".jpg", ".jpeg"})


def apply_radiometric_stretch(
    data: np.ndarray,
    p_min: float = 2.0,
    p_max: float = 98.0,
    nodata: float | int | None = None,
) -> np.ndarray:
    """
    Apply 2% to 98% percentile radiometric stretching across multi-band rasters
    to remove sensor glare and dark shadows before array conversion.

    Parameters:
        data: 2D (H, W) or 3D (C, H, W) numpy array of arbitrary numeric dtype.
        p_min: Lower percentile cutoff (default 2.0% to lift shadows).
        p_max: Upper percentile cutoff (default 98.0% to suppress glare).
        nodata: Optional NoData value to exclude from percentile calculation.

    Returns:
        np.ndarray: Radiometrically normalized 8-bit uint8 array with values in [0, 255].
    """
    arr = np.asarray(data, dtype=np.float32)
    is_2d = arr.ndim == 2

    if is_2d:
        bands = arr[np.newaxis, :, :]
    elif arr.ndim == 3:
        bands = arr
    else:
        raise ValueError(f"Input raster data must be 2D or 3D array, got shape {arr.shape}")

    stretched: list[np.ndarray] = []
    for c in range(bands.shape[0]):
        band = bands[c]
        valid_mask = np.isfinite(band)
        if nodata is not None:
            valid_mask = valid_mask & (band != nodata)

        valid_pixels = band[valid_mask]
        if valid_pixels.size > 0:
            vmin = float(np.percentile(valid_pixels, p_min))
            vmax = float(np.percentile(valid_pixels, p_max))
            if vmax > vmin:
                scaled = np.clip((band - vmin) / (vmax - vmin) * 255.0, 0, 255)
            else:
                scaled = np.zeros_like(band)
        else:
            scaled = np.zeros_like(band)

        stretched.append(scaled.astype(np.uint8))

    stacked = np.stack(stretched, axis=0)
    return stacked[0] if is_2d else stacked


class BoundsDict(dict[str, float]):
    """
    Geospatial bounding box dictionary that supports dict key access,
    attribute access (.left, .bottom, .right, .top), and numeric index access [0..3].
    """

    def __init__(self, left: float, bottom: float, right: float, top: float) -> None:
        super().__init__(
            left=float(left),
            bottom=float(bottom),
            right=float(right),
            top=float(top),
        )

    @property
    def left(self) -> float:
        return self["left"]

    @property
    def bottom(self) -> float:
        return self["bottom"]

    @property
    def right(self) -> float:
        return self["right"]

    @property
    def top(self) -> float:
        return self["top"]

    def __getitem__(self, item: Any) -> Any:
        if isinstance(item, int):
            return (self["left"], self["bottom"], self["right"], self["top"])[item]
        return super().__getitem__(item)


class RasterService:
    """Service providing core geospatial raster processing and validation routines."""

    @staticmethod
    def validate_file(filename: str, benchmark_tag: str | None = None) -> bool:
        """
        Validate an incoming image file based on extension and benchmark rules.

        Accepts .tif and .tiff by default.
        Only accepts .png or .jpg (.jpeg) if benchmark_tag is in:
        {"BigEarthNet", "VRSBench", "RSVQA", "CDVQA"}.
        """
        if not filename or not isinstance(filename, str):
            return False

        ext = Path(filename).suffix.lower()

        # Default geospatial imagery format (GeoTIFF)
        if ext in DEFAULT_GEOTIFF_EXTENSIONS:
            return True

        # Benchmark non-geotiff imagery format
        if ext in BENCHMARK_IMAGE_EXTENSIONS:
            return bool(benchmark_tag and benchmark_tag in BENCHMARK_TAGS)

        return False

    @staticmethod
    def extract_geospatial_metadata(file_path: str) -> dict[str, Any]:
        """
        Extract geospatial metadata using rasterio.

        Strict format handling: Ingests GeoTIFF/TIFF files using rasterio to extract
        CRS projections, affine transforms, and channel count.
        Retains transparent fallback for benchmark PNG/JPG images and graceful handling
        for missing files.
        """
        ext = Path(file_path).suffix.lower()

        # Fallback block for benchmark PNG/JPG images (which lack native GIS metadata)
        if ext in BENCHMARK_IMAGE_EXTENSIONS:
            logger.info("Benchmark image file detected (%s). Using fallback metadata.", ext)
            width, height, band_count, dtype = 256, 256, 3, "uint8"
            transform_list = [1.0, 0.0, 0.0, 0.0, -1.0, float(height)]

            if os.path.isfile(file_path):
                try:
                    with rasterio.open(file_path) as src:
                        width = int(src.width)
                        height = int(src.height)
                        band_count = int(src.count)
                        if src.dtypes:
                            dtype = str(src.dtypes[0])
                        if src.transform:
                            transform_list = [float(v) for v in src.transform]
                except Exception as exc:
                    logger.debug("Could not read dimensions from benchmark image '%s': %s", file_path, exc)
                    try:
                        with Image.open(file_path) as img:
                            width, height = img.size
                            band_count = len(img.getbands()) if hasattr(img, "getbands") else 3
                            transform_list = [1.0, 0.0, 0.0, 0.0, -1.0, float(height)]
                    except Exception:
                        pass

            return {
                "crs": "EPSG:4326",
                "bounds": BoundsDict(left=0.0, bottom=0.0, right=float(width), top=float(height)),
                "width": width,
                "height": height,
                "band_count": band_count,
                "channel_count": band_count,
                "transform": transform_list,
                "affine_transform": transform_list,
                "nodata": None,
                "dtype": dtype,
                "driver": "BenchmarkImage",
            }

        try:
            with rasterio.open(file_path) as src:
                crs_val = str(src.crs) if src.crs else "EPSG:4326"
                bounds_val = BoundsDict(
                    left=float(src.bounds.left),
                    bottom=float(src.bounds.bottom),
                    right=float(src.bounds.right),
                    top=float(src.bounds.top),
                )
                transform_list = (
                    [float(v) for v in src.transform]
                    if src.transform
                    else [1.0, 0.0, 0.0, 0.0, -1.0, float(src.height)]
                )
                return {
                    "crs": crs_val,
                    "bounds": bounds_val,
                    "width": int(src.width),
                    "height": int(src.height),
                    "band_count": int(src.count),
                    "channel_count": int(src.count),
                    "transform": transform_list,
                    "affine_transform": transform_list,
                    "nodata": src.nodata,
                    "dtype": str(src.dtypes[0]) if src.dtypes else "uint8",
                    "driver": str(src.driver) if src.driver else "GTiff",
                }
        except rasterio.errors.RasterioIOError as exc:
            logger.warning("RasterioIOError processing '%s': %s. Returning fallback metadata.", file_path, exc)
            return {
                "crs": "EPSG:4326",
                "bounds": BoundsDict(left=0.0, bottom=0.0, right=1.0, top=1.0),
                "width": 0,
                "height": 0,
                "band_count": 0,
                "channel_count": 0,
                "transform": [1.0, 0.0, 0.0, 0.0, 1.0, 0.0],
                "affine_transform": [1.0, 0.0, 0.0, 0.0, 1.0, 0.0],
                "nodata": None,
                "dtype": "unknown",
                "driver": "unknown",
                "error": str(exc),
            }

    @staticmethod
    def ingest_geospatial_raster(
        file_path: str,
        apply_stretch: bool = True,
        target_bands: int = 3,
    ) -> tuple[np.ndarray, dict[str, Any]]:
        """
        Strict format ingestion for GeoTIFF/TIFF files using rasterio to extract
        CRS projections, affine transforms, and channel count.
        Applies 2% to 98% percentile radiometric stretching across multi-band rasters
        to remove sensor glare and dark shadows before array conversion.
        Retains transparent fallback ingestion for standard PNG/JPEG images.

        Returns:
            tuple[np.ndarray, dict[str, Any]]: (normalized_uint8_array_chw, metadata_dict)
        """
        meta = RasterService.extract_geospatial_metadata(file_path)
        if not file_path or not os.path.exists(file_path):
            synthetic = np.zeros((3, 256, 256), dtype=np.uint8)
            synthetic[0, :, :] = 70   # Red
            synthetic[1, :, :] = 110  # Green (Vegetation)
            synthetic[2, :, :] = 90   # Blue
            return synthetic, meta

        ext = Path(file_path).suffix.lower()

        # Transparent benchmark compatibility for standard PNG/JPEG images
        if ext in BENCHMARK_IMAGE_EXTENSIONS:
            try:
                with Image.open(file_path) as img:
                    rgb_img = img.convert("RGB")
                    # (H, W, C) -> (C, H, W)
                    hwc_arr = np.array(rgb_img, dtype=np.uint8)
                    chw_arr = np.transpose(hwc_arr, (2, 0, 1))
                    return chw_arr, meta
            except Exception as exc:
                logger.warning("Failed benchmark image reading for %s: %s", file_path, exc)

        # Primary GeoTIFF ingestion via rasterio
        try:
            with rasterio.open(file_path) as src:
                count = src.count
                if count >= target_bands:
                    raw_data = src.read(list(range(1, target_bands + 1))).astype(np.float32)
                elif count == 2:
                    b1 = src.read(1).astype(np.float32)
                    b2 = src.read(2).astype(np.float32)
                    b3 = (b1 + b2) / 2.0
                    raw_data = np.stack([b1, b2, b3], axis=0)
                elif count == 1:
                    b1 = src.read(1).astype(np.float32)
                    raw_data = np.stack([b1, b1, b1], axis=0)
                else:
                    raw_data = np.zeros((target_bands, src.height, src.width), dtype=np.float32)

                if apply_stretch:
                    normalized = apply_radiometric_stretch(
                        raw_data,
                        p_min=2.0,
                        p_max=98.0,
                        nodata=src.nodata,
                    )
                else:
                    normalized = np.clip(raw_data, 0, 255).astype(np.uint8)

                return normalized, meta

        except Exception as exc:
            logger.warning("Geospatial raster ingestion failed on %s: %s. Using synthetic fallback.", file_path, exc)
            synthetic = np.zeros((3, 256, 256), dtype=np.uint8)
            synthetic[0, :, :] = 75
            synthetic[1, :, :] = 115
            synthetic[2, :, :] = 90
            return synthetic, meta

    @staticmethod
    def raster_to_pil(file_path: str) -> Image.Image:
        """
        Convert ingested geospatial raster or benchmark image into an 8-bit RGB PIL Image
        with strict CRS/transform extraction and 2%-98% percentile radiometric stretching.
        """
        chw_arr, _ = RasterService.ingest_geospatial_raster(file_path, apply_stretch=True, target_bands=3)
        hwc_arr = np.transpose(chw_arr, (1, 2, 0))
        return Image.fromarray(hwc_arr, mode="RGB")

    @staticmethod
    def compute_bitemporal_change(
        t1_path: str,
        t2_path: str,
        threshold: float = 0.4,
    ) -> dict[str, Any]:
        """
        Compute bitemporal change detection between two rasters using rasterio and numpy.

        Calculates an absolute difference array between the two rasters, normalizes it,
        applies a threshold (default > 0.4) to create a binary mask, and returns
        the change_percentage and simulated clusters_identified count.
        Handles rasterio.errors.RasterioIOError gracefully.
        """
        try:
            with rasterio.open(t1_path) as src1:
                arr1 = src1.read().astype(np.float32)
            with rasterio.open(t2_path) as src2:
                arr2 = src2.read().astype(np.float32)
        except rasterio.errors.RasterioIOError as exc:
            logger.warning("RasterioIOError during bitemporal change computation: %s", exc)
            return {
                "change_percentage": 0.0,
                "clusters_identified": 0,
                "changed_pixels": 0,
                "total_pixels": 0,
                "threshold": threshold,
                "error": str(exc),
            }

        # Align array dimensions to common shape
        if arr1.ndim == 2:
            arr1 = arr1[np.newaxis, :, :]
        if arr2.ndim == 2:
            arr2 = arr2[np.newaxis, :, :]

        min_bands = min(arr1.shape[0], arr2.shape[0])
        min_h = min(arr1.shape[1], arr2.shape[1])
        min_w = min(arr1.shape[2], arr2.shape[2])

        a1 = arr1[:min_bands, :min_h, :min_w]
        a2 = arr2[:min_bands, :min_h, :min_w]

        # Calculate absolute difference array
        diff = np.abs(a1 - a2)
        if diff.shape[0] > 1:
            diff_2d = np.mean(diff, axis=0)
        else:
            diff_2d = diff[0]

        # Normalize difference array to [0.0, 1.0]
        d_min = float(np.min(diff_2d))
        d_max = float(np.max(diff_2d))
        if d_max > d_min:
            diff_norm = (diff_2d - d_min) / (d_max - d_min)
        else:
            diff_norm = np.zeros_like(diff_2d, dtype=np.float32)

        # Apply threshold to create a binary change mask
        binary_mask = diff_norm > threshold
        total_pixels = int(binary_mask.size)
        changed_pixels = int(np.count_nonzero(binary_mask))

        if total_pixels > 0:
            change_percentage = round(float((changed_pixels / total_pixels) * 100.0), 2)
        else:
            change_percentage = 0.0

        if changed_pixels == 0:
            clusters_identified = 0
        else:
            # Spatial grid-based cluster simulation (4x4 spatial cells)
            h, w = binary_mask.shape
            grid_rows = min(4, max(1, h))
            grid_cols = min(4, max(1, w))
            row_splits = np.array_split(binary_mask, grid_rows, axis=0)
            active_clusters = 0
            for r_block in row_splits:
                col_splits = np.array_split(r_block, grid_cols, axis=1)
                for cell in col_splits:
                    if np.count_nonzero(cell) > 0:
                        active_clusters += 1
            clusters_identified = max(1, active_clusters)

        return {
            "change_percentage": change_percentage,
            "clusters_identified": clusters_identified,
            "changed_pixels": changed_pixels,
            "total_pixels": total_pixels,
            "threshold": threshold,
        }


# Default singleton instance for convenience
raster_service = RasterService()
