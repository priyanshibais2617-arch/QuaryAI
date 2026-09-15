"""SatQuery AI - Mock Change Specialist (Ported from src/ai/mockSpecialists/mockChange.js)"""
from typing import Dict, Any

def run_mock_change(query: str = "", input_info: Dict[str, Any] = None) -> Dict[str, Any]:
    answer = "The built-up area appears to have expanded in the northern region."

    changes = [
        {
            "label": "Built-up Expansion",
            "region": "Northern Area",
            "estimatedArea": "+14.8 ha",
            "confidence": 0.91,
            "description": "Scrubland transitioned into structural concrete foundations and transit spurs.",
        },
        {
            "label": "Transit Corridor Grading",
            "region": "North-Eastern Flank",
            "estimatedArea": "+3.2 km",
            "confidence": 0.88,
            "description": "New 4-lane graded transit artery bisecting previously unpaved terrain.",
        },
        {
            "label": "Agricultural Parcel Stability",
            "region": "Central-Western Sector",
            "estimatedArea": "No Change (< 1.2% delta)",
            "confidence": 0.96,
            "description": "Active cropland parcels demonstrated persistent seasonal chlorophyll reflectance.",
        },
    ]

    return {
        "answer": answer,
        "confidence": 0.91,
        "confidenceLabel": "Prototype Confidence",
        "changes": changes,
        "evidence": {
            "type": "bitemporal-change",
            "highlightRegion": "Northern Sector",
            "changeVector": "Scrubland -> Impervious Built-Up",
            "baselineDate": "2024-03-15",
            "targetDate": "2026-02-28",
            "boundingHighlight": {
                "x": 52,
                "y": 6,
                "width": 44,
                "height": 38,
                "label": "Demo Change Region: Built-up Expansion (+14.8 ha)",
            },
        },
        "summaryCards": [
            {"label": "Primary Change", "value": "Built-up Expansion", "icon": "Building"},
            {"label": "Affected Sector", "value": "Northern Area", "icon": "Compass"},
            {"label": "Estimated Delta", "value": "+14.8 Hectares", "icon": "Maximize2"},
            {"label": "Prototype Confidence", "value": "91%", "icon": "ShieldCheck"},
        ],
        "prototype": True,
    }
