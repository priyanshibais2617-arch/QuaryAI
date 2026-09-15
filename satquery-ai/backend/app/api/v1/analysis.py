import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Set
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.models.raster import Raster
from app.db.models.analysis import Analysis
from app.db.models.user import User
from app.core.auth import get_current_user
from app.models.analysis import (
    UploadRequest,
    UploadResponse,
    ExecuteRequest,
    ExecuteResponse,
    StatusResponse,
)
from app.core.agent import run_agent

router = APIRouter(prefix="/analysis", tags=["Analysis"])

ALLOWED_GEOTIFF_EXTENSIONS: Set[str] = {".tif", ".tiff", ".geotiff"}
ALLOWED_BENCHMARK_EXTENSIONS: Set[str] = {".png", ".jpg", ".jpeg"}
ALLOWED_BENCHMARK_SOURCES: Set[str] = {"BigEarthNet", "VRSBench", "RSVQA", "CDVQA"}

@router.post(
    "/upload",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload satellite raster file metadata (Authenticated)",
)
async def upload_file_metadata(
    payload: UploadRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UploadResponse:
    # Strict file format validation policy
    ext = Path(payload.filename).suffix.lower()

    if ext in ALLOWED_GEOTIFF_EXTENSIONS:
        # GeoTIFF is the default geospatial imagery format, always accepted
        pass
    elif ext in ALLOWED_BENCHMARK_EXTENSIONS:
        if not payload.benchmark_source:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=(
                    "PNG and JPEG formats are only accepted when explicitly tagged with a "
                    "prescribed benchmark dataset (BigEarthNet, VRSBench, RSVQA, CDVQA). "
                    "Default supported format for geospatial imagery is GeoTIFF (.tif/.tiff)."
                ),
            )
        if payload.benchmark_source not in ALLOWED_BENCHMARK_SOURCES:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=(
                    f"Invalid benchmark_source '{payload.benchmark_source}'. "
                    f"Allowed benchmark sources: {', '.join(sorted(ALLOWED_BENCHMARK_SOURCES))}."
                ),
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Unsupported file format '{ext}'. Accepted formats are GeoTIFF (.tif/.tiff) "
                f"or benchmark-tagged PNG/JPEG (.png/.jpg/.jpeg from BigEarthNet, VRSBench, RSVQA, CDVQA)."
            ),
        )

    upload_id = f"upl-{uuid.uuid4().hex[:8]}"

    # Determine modality default if not provided
    modality = payload.modality or "Optical"
    if not payload.modality:
        lower_name = payload.filename.lower()
        if "sar" in lower_name or "radar" in lower_name or "sentinel-1" in lower_name:
            modality = "SAR"
        elif "landsat" in lower_name or "multispectral" in lower_name:
            modality = "Multispectral"

    raster_record = Raster(
        id=upload_id,
        filename=payload.filename,
        size=payload.size,
        modality=modality,
        file_type=payload.file_type,
        dimensions=payload.dimensions,
        bands=payload.bands,
        status="staged",
        benchmark_source=payload.benchmark_source,
        user_id=current_user.id,
    )
    db.add(raster_record)
    await db.commit()
    await db.refresh(raster_record)

    created_iso = (
        raster_record.created_at.isoformat()
        if raster_record.created_at
        else datetime.now(timezone.utc).isoformat()
    )

    return UploadResponse(
        id=raster_record.id,
        filename=raster_record.filename,
        modality=raster_record.modality,
        status=raster_record.status,
        benchmark_source=raster_record.benchmark_source,
        created_at=created_iso,
    )


@router.post(
    "/execute",
    response_model=ExecuteResponse,
    status_code=status.HTTP_200_OK,
    summary="Execute deterministic remote sensing analysis workflow (Authenticated)",
)
async def execute_analysis(
    payload: ExecuteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    analysis_id = f"ana-{uuid.uuid4().hex[:8]}"

    # Run deterministic agent reasoning pipeline
    result = run_agent(
        query=payload.query,
        inputs=payload.inputs,
        configuration=payload.configuration,
        task_override=payload.task,
    )

    result["analysis_id"] = analysis_id

    # Persist in database associated with current_user
    analysis_record = Analysis(
        id=analysis_id,
        task=result.get("task", "Satellite Analysis"),
        query=payload.query,
        status="completed",
        progress=100,
        result=result,
        user_id=current_user.id,
        completed_at=datetime.now(timezone.utc),
    )
    db.add(analysis_record)
    await db.commit()

    return result

@router.get(
    "/status/{analysis_id}",
    response_model=StatusResponse,
    summary="Get analysis or upload status by ID",
)
async def get_analysis_status(
    analysis_id: str,
    db: AsyncSession = Depends(get_db),
) -> StatusResponse:
    # 1. Check analyses table
    analysis_res = await db.execute(select(Analysis).where(Analysis.id == analysis_id))
    analysis_record = analysis_res.scalar_one_or_none()
    if analysis_record is not None:
        created_iso = analysis_record.created_at.isoformat() if analysis_record.created_at else None
        completed_iso = analysis_record.completed_at.isoformat() if analysis_record.completed_at else None
        return StatusResponse(
            id=analysis_record.id,
            status=analysis_record.status,
            progress=analysis_record.progress,
            created_at=created_iso,
            completed_at=completed_iso,
            result=analysis_record.result,
        )

    # 2. Check rasters (uploads) table
    raster_res = await db.execute(select(Raster).where(Raster.id == analysis_id))
    raster_record = raster_res.scalar_one_or_none()
    if raster_record is not None:
        created_iso = raster_record.created_at.isoformat() if raster_record.created_at else None
        return StatusResponse(
            id=raster_record.id,
            status=raster_record.status,
            progress=100,
            created_at=created_iso,
            completed_at=created_iso,
            result=None,
        )

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Analysis or staged upload '{analysis_id}' not found",
    )
