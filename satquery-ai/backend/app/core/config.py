"""Centralized core configuration module.

Re-exports configuration settings to follow the app.core.config pattern.
"""
from app.config import settings, Settings

__all__ = ["settings", "Settings"]
