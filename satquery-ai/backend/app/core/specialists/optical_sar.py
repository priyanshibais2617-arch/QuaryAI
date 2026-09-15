"""SatQuery AI - Mock Optical + SAR Specialist (Ported from src/ai/mockSpecialists/mockOpticalSAR.js)"""
from typing import Dict, Any

def run_mock_optical_sar(query: str = "", input_info: Dict[str, Any] = None) -> Dict[str, Any]:
    answer = "The combined analysis indicates built-up areas and water-covered regions."

    findings = [
        {
            "title": "Built-up regions detected",
            "description": "Intense double-bounce corner reflection in SAR VV/VH polarization matches high optical surface reflectance, confirming high-density concrete and metallic infrastructure.",
            "icon": "Building2",
            "badge": "High SAR Backscatter",
        },
        {
            "title": "Water-covered regions identified",
            "description": "Zero specular backscatter in microwave radar combined with high near-infrared absorption in optical Sentinel-2 cleanly isolates all surface water channels.",
            "icon": "Droplets",
            "badge": "Specular Non-Return",
        },
        {
            "title": "Structural information visible in SAR",
            "description": "Radar penetration resolved building geometry and structural orientations unaffected by atmospheric moisture, cloud shadows, or haze.",
            "icon": "Radio",
            "badge": "All-Weather Penetration",
        },
        {
            "title": "Vegetation canopy delineated",
            "description": "Optical Red-Edge and NIR reflectance provided clear chlorophyll distinction where volume scattering occurred in radar returns.",
            "icon": "Trees",
            "badge": "Spectral Vegetation Ratio",
        },
    ]

    return {
        "answer": answer,
        "confidence": 0.89,
        "confidenceLabel": "Prototype Confidence",
        "analysisLabel": "Prototype Cross-Modal Analysis",
        "findings": findings,
        "modalitiesUsed": ["Optical Multi-Band (Sentinel-2)", "SAR C-Band GRD (Sentinel-1)"],
        "evidence": {
            "type": "cross-modal-fusion",
            "opticalSensors": "Sentinel-2 L2A",
            "sarSensors": "Sentinel-1 C-SAR (VV+VH)",
            "findings": findings,
        },
        "summaryCards": [
            {"label": "Built-up Certainty", "value": "High Confidence", "icon": "Building2"},
            {"label": "Water Delineation", "value": "Specular Confirmed", "icon": "Droplets"},
            {"label": "SAR Structural", "value": "Double-Bounce Matched", "icon": "Radio"},
            {"label": "Prototype Confidence", "value": "89%", "icon": "ShieldCheck"},
        ],
        "prototype": True,
    }
