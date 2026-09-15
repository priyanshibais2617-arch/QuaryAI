"""SatQuery AI - Mock Grounding Specialist (Ported from src/ai/mockSpecialists/mockGrounding.js)"""
from typing import Dict, Any

def run_mock_grounding(query: str = "", input_info: Dict[str, Any] = None) -> Dict[str, Any]:
    q = (query or "").lower()

    target_name = "water body"
    bounding_box = {
        "x": 34,
        "y": 38,
        "width": 40,
        "height": 36,
        "label": "Demo Grounding Region: Water Body",
    }

    if "junction" in q or "road" in q or "transport" in q:
        target_name = "transport junction"
        bounding_box = {
            "x": 18,
            "y": 45,
            "width": 32,
            "height": 28,
            "label": "Demo Grounding Region: Transport Arterial Junction",
        }
    elif "building" in q or "built-up" in q or "industrial" in q:
        target_name = "industrial facility"
        bounding_box = {
            "x": 55,
            "y": 15,
            "width": 35,
            "height": 30,
            "label": "Demo Grounding Region: Structural Complex",
        }

    answer = f"A {target_name} is located in the demarcated coordinates with high spectral absorption and localized spatial boundaries."

    evidence = {
        "type": "bounding-box",
        **bounding_box,
        "coordinates": '12°58\'23"N, 77°35\'45"E',
        "estimatedArea": "2.34 km²",
    }

    return {
        "answer": answer,
        "confidence": 0.94,
        "confidenceLabel": "Prototype Confidence",
        "groundingLabel": "Demo Grounding Region",
        "evidence": evidence,
        "boundingBox": bounding_box,
        "summaryCards": [
            {"label": "Target Feature", "value": target_name.upper(), "icon": "Crosshair"},
            {"label": "Spatial Bounding", "value": f"X:{bounding_box['x']}%, Y:{bounding_box['y']}%", "icon": "Maximize2"},
            {"label": "Surface Extent", "value": "2.34 km²", "icon": "Layers"},
            {"label": "Prototype Confidence", "value": "94%", "icon": "ShieldCheck"},
        ],
        "prototype": True,
    }
