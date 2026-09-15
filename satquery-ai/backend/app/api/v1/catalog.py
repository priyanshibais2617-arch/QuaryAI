from fastapi import APIRouter, status, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.models.catalog import CatalogImage
from app.models.catalog import CatalogResponse, CatalogImage as CatalogImageSchema

router = APIRouter(prefix="/catalog", tags=["Catalog"])

@router.get(
    "/images",
    response_model=CatalogResponse,
    status_code=status.HTTP_200_OK,
    summary="Get curated mock satellite image catalog from database",
)
async def get_catalog_images(
    db: AsyncSession = Depends(get_db),
) -> CatalogResponse:
    result = await db.execute(select(CatalogImage).order_by(CatalogImage.id))
    db_images = result.scalars().all()

    images_payload = [
        CatalogImageSchema(
            id=img.id,
            filename=img.filename,
            fileType=img.file_type,
            modality=img.modality,
            sensor=img.sensor,
            date=img.date,
            size=img.size,
            dimensions=img.dimensions,
            bands=img.bands,
            status=img.status,
            scenarioKey=img.scenario_key,
        )
        for img in db_images
    ]

    return CatalogResponse(
        images=images_payload,
        total=len(images_payload),
    )
