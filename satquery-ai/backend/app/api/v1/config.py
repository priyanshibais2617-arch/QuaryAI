from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.config import settings

router = APIRouter(prefix="/config", tags=["Configuration"])


class ConfigStatusResponse(BaseModel):
    openai_configured: bool = Field(..., description="Whether OPENAI_API_KEY is configured")
    planetary_computer_configured: bool = Field(..., description="Whether PLANETARY_COMPUTER_SUBSCRIPTION_KEY is configured")
    satellite_provider: str = Field(..., description="Active satellite imagery API provider")


@router.get(
    "/status",
    response_model=ConfigStatusResponse,
    summary="Get external API configuration status",
)
def get_config_status() -> ConfigStatusResponse:
    """Return external API configuration presence flags.
    
    Security Guarantee:
    Returns ONLY booleans and provider identifiers.
    Never returns, leaks, or logs secret key values or partial keys.
    """
    return ConfigStatusResponse(
        openai_configured=bool(settings.OPENAI_API_KEY),
        planetary_computer_configured=bool(settings.PLANETARY_COMPUTER_SUBSCRIPTION_KEY),
        satellite_provider=settings.SATELLITE_API_PROVIDER,
    )
