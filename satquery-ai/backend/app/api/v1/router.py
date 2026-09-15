from fastapi import APIRouter
from .analysis import router as analysis_router
from .catalog import router as catalog_router
from .config import router as config_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(analysis_router)
api_v1_router.include_router(catalog_router)
api_v1_router.include_router(config_router)

