"""SatQuery AI - Mock VQA Specialist (Ported from src/ai/mockSpecialists/mockVQA.js)"""
from typing import Dict, Any

def run_mock_vqa(query: str = "", input_info: Dict[str, Any] = None) -> Dict[str, Any]:
    q = (query or "").lower()

    answer = "The scene contains a mixture of vegetation, open land, and built-up regions."
    if "vegetation" in q or "canopy" in q or "green" in q:
        answer = "Dense vegetative canopy and agricultural corridors occupy approximately 28% of the scene, predominantly concentrated along the western and southern quadrants."
    elif "objects" in q or "built-up" in q or "urban" in q or "infrastructure" in q:
        answer = "Multiple built-up structural clusters and dual-arterial transport corridors are prominently visible, with commercial logistics warehouses in the upper sector."
    elif "water" in q or "river" in q or "lake" in q:
        answer = "A prominent hydrological feature bisects the scene, displaying characteristic absorption in infrared spectra and meandering south-eastwards."
    elif "describe" in q or "land cover" in q:
        answer = "The scene contains a mixture of vegetation (28%), open land (20%), built-up urban infrastructure (42%), and surface water features (10%)."

    categories = [
        {"name": "Built-up Area", "percentage": 42, "color": "#f59e0b", "description": "Impervious surfaces, roofs, paved transit"},
        {"name": "Vegetation", "percentage": 28, "color": "#10b981", "description": "Canopy cover, active cropland parcels"},
        {"name": "Open Land", "percentage": 20, "color": "#8b5cf6", "description": "Scrubland, unpaved soil, fallow ground"},
        {"name": "Water Body", "percentage": 10, "color": "#06b6d4", "description": "Reservoir basin and natural drainage channels"},
    ]

    return {
        "answer": answer,
        "confidence": 0.91,
        "confidenceLabel": "Prototype Confidence",
        "categories": categories,
        "primaryFeatures": ["Dense Built-Up Core", "Mixed Agricultural Plots", "River Drainage Channel", "Scrubland Buffer"],
        "evidence": {
            "type": "categorical-distribution",
            "categories": categories,
            "explanation": "Categorical distribution derived via multi-scale patch token alignment from fine-tuned remote sensing encoders.",
        },
        "summaryCards": [
            {"label": "Dominant Cover", "value": "Built-up (42%)", "icon": "Building"},
            {"label": "Vegetation Canopy", "value": "28% Surface", "icon": "Trees"},
            {"label": "Water Features", "value": "10% Delineated", "icon": "Droplets"},
            {"label": "Prototype Confidence", "value": "91%", "icon": "ShieldCheck"},
        ],
        "prototype": True,
    }
