"""SatQuery AI - FastAPI Application Entrypoint.

Provides REST APIs for:
- Spatial raster uploading and metadata extraction
- Autonomous query routing and specialist execution
- Executive PDF audit dossier generation
- Catalog and configuration inspection
"""
from __future__ import annotations

from contextlib import asynccontextmanager
import logging
from pathlib import Path
import tempfile
from typing import Any, Dict, List, Optional
import uuid

from fastapi import (
    Body,
    Depends,
    FastAPI,
    File,
    Form,
    HTTPException,
    Request,
    Response,
    Security,
    UploadFile,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from pydantic import ValidationError

from app.config import settings
from app.api.v1.router import api_v1_router
from app.api.v1.analysis import (
    upload_file_metadata as legacy_upload_metadata,
    execute_analysis as legacy_execute_analysis,
)
from app.core.auth import security, get_current_user
from app.db.base import Base
from app.db.session import async_engine, async_session_factory, get_db
from app.db.seed import seed_catalog_images
from app.models.analysis import UploadRequest, ExecuteRequest
from app.services import (
    RasterService,
    Router,
    AgentRouter,
    SpecialistEngine,
    ReportService,
)

logger = logging.getLogger(__name__)

# Temporary directory for uploaded rasters
UPLOAD_DIR = Path("/tmp/satquery_uploads")
try:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
except Exception:
    UPLOAD_DIR = Path(tempfile.gettempdir()) / "satquery_uploads"
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        async with async_session_factory() as session:
            await seed_catalog_images(session)
    except Exception as exc:
        logger.warning("Database initialization during startup skipped or failed: %s", exc)
    yield
    await async_engine.dispose()


app = FastAPI(
    title="SatQuery AI Backend",
    description="Autonomous remote sensing agent pipeline and spatial intelligence API.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from any origin, including Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------------------------------------------------
# Core Service Endpoints
# -----------------------------------------------------------------------------

@app.post(
    "/api/v1/analysis/upload",
    summary="Upload satellite raster file or metadata",
    tags=["Analysis"],
)
async def upload_raster(
    request: Request,
    response: Response,
    file: Optional[UploadFile] = File(None),
    benchmark: Optional[str] = Form(None),
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Accept raster file upload (UploadFile) and optional benchmark tag (Form).
    Validates file format with RasterService.validate_file (raising 400 on error),
    saves to temporary directory, extracts geospatial metadata with RasterService,
    and returns status, file_path, filename, and metadata.
    Also supports authenticated JSON metadata uploads for backward compatibility.
    """
    content_type = request.headers.get("content-type", "")

    # Multipart Form File Upload
    if "multipart/form-data" in content_type or file is not None:
        if not file or not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A valid file is required for upload.",
            )

        # 1. Validate file format using RasterService
        is_valid = RasterService.validate_file(file.filename, benchmark_tag=benchmark)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Unsupported or invalid raster file format '{file.filename}'. "
                    "Accepted formats are GeoTIFF (.tif/.tiff) or approved benchmark images "
                    "(.png/.jpg/.jpeg from BigEarthNet, VRSBench, RSVQA, CDVQA)."
                ),
            )

        # 2. Save file to temporary directory
        safe_name = f"{uuid.uuid4().hex[:8]}_{Path(file.filename).name}"
        saved_path = UPLOAD_DIR / safe_name
        try:
            content = await file.read()
            with open(saved_path, "wb") as f:
                f.write(content)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save uploaded file: {exc}",
            )

        # 3. Extract geospatial metadata
        metadata = RasterService.extract_geospatial_metadata(str(saved_path))

        preview_url = f"/api/v1/analysis/preview?file_path={saved_path}"
        response.status_code = status.HTTP_200_OK
        return {
            "status": "staged",
            "file_path": str(saved_path),
            "filename": file.filename,
            "metadata": metadata,
            "preview_url": preview_url,
        }

    # Authenticated JSON metadata upload fallback
    user = await get_current_user(credentials=credentials, db=db)
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid JSON body",
        )
    try:
        payload = UploadRequest(**body)
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=exc.errors(),
        )

    response.status_code = status.HTTP_201_CREATED
    return await legacy_upload_metadata(payload=payload, current_user=user, db=db)


@app.get(
    "/api/v1/analysis/preview",
    summary="Get RGB image preview of staged raster",
    tags=["Analysis"],
)
async def get_raster_preview(file_path: str) -> Response:
    """
    Renders an uploaded GeoTIFF or image file as an RGB JPEG for web browser viewing.
    Uses radiometric percentile scaling to normalize multi-band 16-bit rasters.
    """
    import io
    from app.services.specialists import geotiff_to_pil

    try:
        pil_img = geotiff_to_pil(file_path)
        buffer = io.BytesIO()
        pil_img.save(buffer, format="JPEG", quality=85)
        return Response(content=buffer.getvalue(), media_type="image/jpeg")
    except Exception as exc:
        logger.warning("Preview generation failed for %s: %s", file_path, exc)
        from PIL import Image
        fallback = Image.new("RGB", (256, 256), color=(40, 70, 60))
        buffer = io.BytesIO()
        fallback.save(buffer, format="JPEG")
        return Response(content=buffer.getvalue(), media_type="image/jpeg")


@app.post(
    "/api/v1/analysis/execute",
    summary="Execute remote sensing analysis workflow",
    tags=["Analysis"],
)
async def execute_analysis_route(
    request: Request,
    query: Optional[str] = Form(None),
    file_paths: Optional[List[str]] = Form(None),
    modalities: Optional[List[str]] = Form(None),
    task: Optional[str] = Form(None),
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Execute analysis using AgentRouter, RasterService, and SpecialistEngine.
    Accepts query (Form), file_paths (Form), modalities (Form), and optional task (Form).
    Raises HTTPException(400) if file_paths is empty.
    Also supports authenticated JSON payloads for backward compatibility.
    """
    content_type = request.headers.get("content-type", "")

    # Form / Multipart execution flow
    if (
        "multipart/form-data" in content_type
        or "application/x-www-form-urlencoded" in content_type
        or (query is not None and "application/json" not in content_type)
    ):
        if not file_paths:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="file_paths cannot be empty.",
            )

        q_str = query or ""
        mods = modalities or []

        # 1. Route query via AgentRouter
        routing = AgentRouter().route_query(
            query=q_str,
            file_count=len(file_paths),
            modalities=mods,
        )

        assigned_task = task or routing.get("task", "single_vqa")

        # 2. Extract geospatial metadata from primary raster
        primary_file = file_paths[0]
        meta = RasterService.extract_geospatial_metadata(primary_file)
        meta["task"] = assigned_task
        meta["workflow"] = routing.get("workflow")
        meta["translated_query"] = routing.get("translated_query")
        meta["confidence"] = routing.get("confidence")
        if mods:
            meta["modality"] = " + ".join(mods)

        # 3. Execute specialist engine
        result = SpecialistEngine().execute(
            task=assigned_task,
            query=routing.get("translated_query", q_str),
            file_paths=file_paths,
            meta=meta,
        )
        global LATEST_ANALYSIS_RESULT
        LATEST_ANALYSIS_RESULT = result
        return result

    # Authenticated JSON execute fallback
    user = await get_current_user(credentials=credentials, db=db)
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid JSON body",
        )
    try:
        payload = ExecuteRequest(**body)
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=exc.errors(),
        )
    return await legacy_execute_analysis(payload=payload, current_user=user, db=db)


LATEST_ANALYSIS_RESULT: Dict[str, Any] = {}


@app.get(
    "/api/v1/export/report",
    summary="Export executive PDF dossier (GET)",
    tags=["Report"],
)
async def export_report_get() -> Response:
    """
    Generate an executive PDF analysis dossier via GET request using the latest analysis result.
    Returns raw PDF bytes with attachment Content-Disposition.
    """
    try:
        pdf_bytes = ReportService.generate_pdf(LATEST_ANALYSIS_RESULT or {})
    except Exception as exc:
        logger.error("Failed to generate PDF report: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF dossier: {exc}",
        )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=satquery_dossier.pdf"},
    )


@app.post(
    "/api/v1/export/report",
    summary="Export executive PDF dossier",
    tags=["Report"],
)
async def export_report(payload: Dict[str, Any] = Body(default={})) -> Response:
    """
    Generate an executive PDF analysis dossier from analysis data dictionary.
    Returns raw PDF bytes with attachment Content-Disposition.
    """
    global LATEST_ANALYSIS_RESULT
    if payload:
        LATEST_ANALYSIS_RESULT = payload
    try:
        pdf_bytes = ReportService.generate_pdf(payload)
    except Exception as exc:
        logger.error("Failed to generate PDF report: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF dossier: {exc}",
        )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=satquery_dossier.pdf"},
    )


# Mount standard API v1 routes (Catalog, Config, Status, etc.)
app.include_router(api_v1_router)


# -----------------------------------------------------------------------------
# Health Check Endpoints
# -----------------------------------------------------------------------------

@app.get("/", tags=["Health"])
def root_endpoint():
    return {
        "service": "SatQuery AI Backend",
        "version": "0.1.0",
        "status": "operational",
        "docs_url": "/docs",
    }


@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
