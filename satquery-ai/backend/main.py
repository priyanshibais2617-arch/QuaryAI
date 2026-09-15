"""Entrypoint proxy for SatQuery AI backend deployments."""
import sys
from pathlib import Path

# Ensure backend root is in sys.path so 'app' package imports work cleanly
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.main import app

# Enable CORS for requests from any origin, including Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from any origin, including Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

__all__ = ["app"]
