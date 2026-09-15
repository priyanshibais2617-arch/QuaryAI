from pydantic import BaseModel, Field
from typing import List, Optional

class CatalogImage(BaseModel):
    id: str
    filename: str
    fileType: str
    modality: str
    sensor: str
    date: str
    size: str
    dimensions: str
    bands: str
    status: str
    scenarioKey: Optional[str] = None

class CatalogResponse(BaseModel):
    images: List[CatalogImage] = Field(default_factory=list)
    total: int = 0
