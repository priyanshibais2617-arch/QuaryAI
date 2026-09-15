"""SatQuery AI - Mock Captioning Specialist (Ported from src/ai/mockSpecialists/mockCaptioning.js)"""
from typing import Dict, Any

def run_mock_captioning(query: str = "", input_info: Dict[str, Any] = None) -> Dict[str, Any]:
    answer = "A mixed landscape containing vegetation, open terrain, built-up areas and a water feature."

    detected_categories = [
        {"label": "Vegetation Canopy", "confidence": 0.95},
        {"label": "Built-Up Infrastructure", "confidence": 0.92},
        {"label": "Open / Fallow Land", "confidence": 0.88},
        {"label": "Hydrological Feature", "confidence": 0.94},
        {"label": "Paved Arterial Network", "confidence": 0.91},
    ]

    return {
        "answer": answer,
        "confidence": 0.93,
        "confidenceLabel": "Prototype Confidence",
        "detectedCategories": detected_categories,
        "evidence": {
            "type": "scene-captioning",
            "summary": "Caption synthesizes dual-scale spatial patch embeddings with cross-attentive token vocabularies.",
            "categories": detected_categories,
        },
        "summaryCards": [
            {"label": "Scene Profile", "value": "Peri-Urban Mosaic", "icon": "Grid"},
            {"label": "Detected Classes", "value": "5 Major Categories", "icon": "Layers"},
            {"label": "Semantic Coherence", "value": "High (0.93 BLEU-4)", "icon": "FileText"},
            {"label": "Prototype Confidence", "value": "93%", "icon": "ShieldCheck"},
        ],
        "prototype": True,
    }
