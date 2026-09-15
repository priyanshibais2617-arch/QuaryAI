from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Union, Optional
import json

class Settings(BaseSettings):
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/satquery"
    SUPABASE_JWT_SECRET: str = "satquery-super-secret-jwt-key-minimum-32-chars"

    # External API Scaffolding
    OPENAI_API_KEY: Optional[str] = None
    PLANETARY_COMPUTER_SUBSCRIPTION_KEY: Optional[str] = None
    SATELLITE_API_PROVIDER: str = "planetary_computer"


    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    def get_cors_origins(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, str):
            try:
                parsed = json.loads(self.CORS_ORIGINS)
                if isinstance(parsed, list):
                    return parsed
            except Exception:
                return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
        return self.CORS_ORIGINS

settings = Settings()
