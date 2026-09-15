"""SatQuery AI - Mock Change VQA Specialist (Ported from src/ai/mockSpecialists/mockChangeVQA.js)"""
from typing import Dict, Any

def run_mock_change_vqa(query: str = "", input_info: Dict[str, Any] = None) -> Dict[str, Any]:
    q = (query or "").lower()

    answer = "Yes. The built-up area appears to have increased."
    if "vegetation" in q or "forest" in q or "crop" in q:
        answer = "Vegetative cover in the northern scrubland sector has decreased by approximately 14.8 hectares due to new construction."
    elif "water" in q or "lake" in q or "reservoir" in q:
        answer = "The surface area of the primary water body remained stable across both dates with less than 1.5% boundary variance."
    elif "decreased" in q:
        answer = "Natural scrubland and unpaved soil decreased, while impervious surfaces increased."

    return {
        "answer": answer,
        "confidence": 0.92,
        "confidenceLabel": "Prototype Confidence",
        "evidence": {
            "type": "bitemporal-change",
            "queryAffirmation": True,
            "baselineDate": "2024-03-15",
            "targetDate": "2026-02-28",
            "boundingHighlight": {
                "x": 52,
                "y": 6,
                "width": 44,
                "height": 38,
                "label": "Demo Change Evidence: Detected Built-Up Expansion",
            },
        },
        "summaryCards": [
            {"label": "Temporal Verdict", "value": "Confirmed Increase", "icon": "CheckCircle2"},
            {"label": "Observed Trajectory", "value": "Scrubland to Urban", "icon": "TrendingUp"},
            {"label": "Baseline -> Target", "value": "2024 -> 2026 (23 Mo)", "icon": "Calendar"},
            {"label": "Prototype Confidence", "value": "92%", "icon": "ShieldCheck"},
        ],
        "prototype": True,
    }
