"""SatQuery AI - Deterministic Query Classifier (Ported from src/ai/queryClassifier.js)"""
from typing import Dict, Any, List

def classify_query(query: str = "", input_info: Dict[str, Any] = None) -> Dict[str, Any]:
    if input_info is None:
        input_info = {}

    q = (query or "").lower().strip()

    def matches(*keywords: str) -> bool:
        return any(k.lower() in q for k in keywords)

    # 1. Cross-Modal Optical + SAR Analysis patterns
    cross_modal_keywords = [
        "optical and sar",
        "sar and optical",
        "combine optical",
        "both images",
        "both sensors",
        "cross-modal",
        "cross modal",
        "radar and optical",
        "fusion",
        "microwave",
        "backscatter and spectral",
    ]
    if matches(*cross_modal_keywords):
        return {
            "task": "OPTICAL_SAR_ANALYSIS",
            "confidence": 0.96,
            "intent": "Cross-modal Optical and SAR sensor interpretation",
            "detectedKeywords": [k for k in cross_modal_keywords if k in q],
        }

    # 2. Change VQA Pattern (Polar or quantitative change question)
    change_vqa_keywords = [
        "has the built-up area increased",
        "has the built up area increased",
        "has vegetation decreased",
        "did the water body shrink",
        "did the built-up area expand",
        "has there been deforestation",
        "increased, decreased, or remained unchanged",
        "increased or decreased",
        "has it changed",
    ]
    if matches(*change_vqa_keywords):
        return {
            "task": "CHANGE_VQA",
            "confidence": 0.95,
            "intent": "Polar / quantitative change question over bi-temporal series",
            "detectedKeywords": [k for k in change_vqa_keywords if k in q],
        }

    # 3. Bi-Temporal Change Analysis patterns
    change_keywords = [
        "what changed",
        "change between",
        "changes between",
        "difference between",
        "before and after",
        "expansion",
        "deforestation",
        "new construction",
        "urban growth",
        "encroachment",
        "timeline",
        "decreased",
        "increased",
        "two dates",
    ]
    if matches(*change_keywords):
        return {
            "task": "CHANGE_ANALYSIS",
            "confidence": 0.94,
            "intent": "Bi-temporal differential change detection and spatial localization",
            "detectedKeywords": [k for k in change_keywords if k in q],
        }

    # 4. Visual Grounding / Localization patterns
    grounding_keywords = [
        "where is",
        "where are",
        "locate",
        "pinpoint",
        "highlight",
        "identify the water body",
        "identify the water",
        "bounding box",
        "find the water",
        "find the reservoir",
        "isolate the",
        "show me where",
        "demarcate",
        "coordinates of",
    ]
    if matches(*grounding_keywords):
        return {
            "task": "GROUNDING",
            "confidence": 0.95,
            "intent": "Text-guided visual grounding and spatial feature localization",
            "detectedKeywords": [k for k in grounding_keywords if k in q],
        }

    # 5. Scene Captioning / High-level scene description
    captioning_keywords = [
        "describe the scene",
        "generate caption",
        "summarize the scene",
        "scene caption",
        "caption this image",
        "overall scene",
    ]
    if matches(*captioning_keywords):
        return {
            "task": "CAPTIONING",
            "confidence": 0.92,
            "intent": "Dense remote-sensing scene captioning and categorization",
            "detectedKeywords": [k for k in captioning_keywords if k in q],
        }

    # 6. Visual Question Answering (VQA) / General Scene Understanding
    vqa_keywords = [
        "describe",
        "what is visible",
        "what is in this image",
        "what objects",
        "land cover",
        "is there vegetation",
        "are there",
        "what type of terrain",
        "estimate the percentage",
        "classify",
        "how many",
        "what sensor",
    ]
    if matches(*vqa_keywords):
        return {
            "task": "VQA",
            "confidence": 0.91,
            "intent": "Open-ended remote-sensing visual question answering",
            "detectedKeywords": [k for k in vqa_keywords if k in q],
        }

    # 7. Contextual Fallback based on input type
    if input_info.get("crossModal") or (input_info.get("hasOptical") and input_info.get("hasSAR")):
        return {
            "task": "OPTICAL_SAR_ANALYSIS",
            "confidence": 0.85,
            "intent": "Inferred cross-modal analysis from optical + SAR input pair",
            "detectedKeywords": ["cross_modal_input_inferred"],
        }

    if input_info.get("temporal") or input_info.get("imageCount") == 2:
        return {
            "task": "CHANGE_ANALYSIS",
            "confidence": 0.85,
            "intent": "Inferred change analysis from bi-temporal image pair",
            "detectedKeywords": ["temporal_pair_inferred"],
        }

    # Fallback: General VQA or general query
    return {
        "task": "VQA",
        "confidence": 0.80,
        "intent": "General remote-sensing scene understanding query",
        "detectedKeywords": ["default_fallback"],
    }
