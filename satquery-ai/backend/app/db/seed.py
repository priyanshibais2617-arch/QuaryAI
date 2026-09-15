import asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.data.mock_data import MOCK_IMAGES_GALLERY
from app.db.models.catalog import CatalogImage
from app.db.session import async_session_factory

async def seed_catalog_images(session: AsyncSession) -> int:
    """Seed catalog_images table from MOCK_IMAGES_GALLERY if not already seeded."""
    inserted_count = 0
    for item in MOCK_IMAGES_GALLERY:
        result = await session.execute(
            select(CatalogImage).where(CatalogImage.id == item["id"])
        )
        if result.scalar_one_or_none() is None:
            catalog_img = CatalogImage(
                id=item["id"],
                filename=item["filename"],
                file_type=item["fileType"],
                modality=item["modality"],
                sensor=item["sensor"],
                date=item["date"],
                size=item["size"],
                dimensions=item["dimensions"],
                bands=item["bands"],
                status=item["status"],
                scenario_key=item.get("scenarioKey"),
            )
            session.add(catalog_img)
            inserted_count += 1
    if inserted_count > 0:
        await session.commit()
    return inserted_count

async def main():
    async with async_session_factory() as session:
        count = await seed_catalog_images(session)
        print(f"Catalog seeding complete. Inserted {count} new image(s).")

if __name__ == "__main__":
    asyncio.run(main())
