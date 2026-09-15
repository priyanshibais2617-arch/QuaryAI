# SatQuery AI - Backend Skeleton (Phase 1)

FastAPI-powered deterministic backend service for SatQuery AI.
This Phase 1 skeleton mirrors the unified agent result contract and autonomous remote sensing routing pipeline.

---

## Features
- **Deterministic Agent Pipeline**: Ported from `src/ai/mockAgent.js`, `queryClassifier.js`, `workflowRouter.js`, and specialized engines.
- **REST Endpoints**:
  - `POST /api/v1/analysis/upload`: Accepts raster/file metadata and returns an upload ID.
  - `POST /api/v1/analysis/execute`: Orchestrates deterministic query classification, workflow selection, specialist execution, and returns a 10-step auditable execution trace and unified result contract.
  - `GET /api/v1/analysis/status/{id}`: Inspects execution status and retrieved findings by analysis ID.
  - `GET /api/v1/catalog/images`: Returns curated remote sensing images from the mock catalog.
- **Interactive Documentation**: Auto-generated Swagger UI at `/docs` and ReDoc at `/redoc`.
- **Full Pytest Suite**: Contract validation across VQA, Visual Grounding, Bi-Temporal Change, Change VQA, and Optical+SAR fusion.

---

## Setup Instructions

### 1. Prerequisites
- Python 3.10+ (tested on Python 3.14)

### 2. Installation
Navigate into the `backend/` directory and install the dependencies:
```bash
pip install -r requirements.txt
```

*(Optional) Create a virtual environment first:*
```bash
python -m venv .venv
# On Windows PowerShell:
.venv\Scripts\Activate.ps1
# On Linux / macOS:
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Environment Variables
Copy the example environment configuration:
```bash
cp .env.example .env
```

---

## Running the Server Locally

Start the development server with hot-reload enabled via Uvicorn:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Once running, access:
- **API Base**: `http://localhost:8000`
- **Swagger UI**: `http://localhost:8000/docs`
- **OpenAPI Schema**: `http://localhost:8000/openapi.json`

---

## Running Tests

Run the backend test suite using `pytest`:
```bash
pytest tests/ -v
```
