# SatQuery AI (QuaryAI)

Autonomous, evidence-based remote-sensing image understanding and satellite geospatial analysis platform.

## Architecture

- **Frontend**: React 19, Vite 8, Tailwind CSS, Three.js / React Three Fiber
- **Backend**: FastAPI, Uvicorn, GDAL/Rasterio geospatial processing, multi-agent AI orchestration
- **Containerization**: Docker, Docker Compose, Nginx

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### Frontend Setup
```bash
npm run dev
```

### Backend Setup
```bash
cd satquery-ai/backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```
