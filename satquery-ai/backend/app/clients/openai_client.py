"""OpenAI Client Wrapper for SatQuery AI.

Scaffolding wrapper around the official OpenAI Python SDK.
Reads configuration from app.config.settings and lazily initializes client.
Raises a descriptive ValueError if accessed without an API key configured.
"""
from typing import Optional, Any
from app.config import settings


class OpenAIClientWrapper:
    """Thin wrapper around OpenAI Python SDK."""

    def __init__(self, api_key: Optional[str] = None):
        self._api_key = api_key or settings.OPENAI_API_KEY
        self._client: Optional[Any] = None

    @property
    def is_configured(self) -> bool:
        """Returns True if an API key is present."""
        return bool(self._api_key)

    def get_client(self) -> Any:
        """Return initialized OpenAI client instance.
        
        Raises:
            ValueError: If OPENAI_API_KEY is unset or empty.
        """
        if not self._api_key:
            raise ValueError(
                "OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable."
            )

        if self._client is None:
            # Lazy import so module can be loaded even if openai package is not yet invoked
            from openai import OpenAI
            self._client = OpenAI(api_key=self._api_key)

        return self._client


def get_openai_client(api_key: Optional[str] = None) -> Any:
    """Convenience accessor to instantiate and return OpenAI client."""
    wrapper = OpenAIClientWrapper(api_key=api_key)
    return wrapper.get_client()
