"""SatQuery AI - Deterministic Workflow Router (Ported from src/ai/workflowRouter.js)"""
from typing import Dict, Any, List

def select_workflow(classification: Dict[str, Any] = None, input_info: Dict[str, Any] = None, options: Dict[str, Any] = None) -> Dict[str, Any]:
    if classification is None:
        classification = {}
    if input_info is None:
        input_info = {}
    if options is None:
        options = {}

    task = classification.get("task", "VQA")
    image_count = input_info.get("imageCount", 0)

    validation_warnings: List[str] = []

    # Check 1: Bi-temporal change requested with insufficient images
    if (task == "CHANGE_ANALYSIS" or task == "CHANGE_VQA") and image_count < 2:
        validation_warnings.append("Bi-temporal analysis requires two spatially corresponding images (Baseline and Target).")

    # Check 2: Optical + SAR requested without both modalities
    if task == "OPTICAL_SAR_ANALYSIS":
        if image_count < 2:
            validation_warnings.append("Optical + SAR analysis requires both optical and SAR inputs.")
        elif not input_info.get("crossModal") and not input_info.get("hasSAR"):
            validation_warnings.append("SAR microwave imagery is missing. Both optical and SAR modalities are required for cross-modal fusion.")

    # Check 3: Grounding without image
    if task == "GROUNDING" and image_count == 0:
        validation_warnings.append("An image is required for visual grounding.")

    # Wrong Workflow Prevention Rule:
    # If user provided two optical images, but asked a single-image question like "Describe the land cover",
    # do NOT route to Optical-SAR. Route to Single-Image VQA and use the primary scene.
    resolved_task = task
    resolved_reason = ""

    if image_count == 2 and not input_info.get("crossModal") and (task in ("VQA", "CAPTIONING", "GROUNDING")):
        resolved_reason = "Single-image query detected with 2 optical scenes staged. Agent intelligently directed analysis to the primary target scene without misrouting to cross-modal fusion."

    if resolved_task == "GROUNDING":
        return {
            "task": "Visual Grounding",
            "taskKey": "GROUNDING",
            "workflow": "Text-Guided Grounding",
            "specialistId": "grounding_engine",
            "specialistName": "Visual Grounding Engine",
            "reason": resolved_reason or "Feature localization query detected; isolating target feature coordinates via spatial bounding envelope.",
            "warnings": validation_warnings,
            "requiresDualImages": False,
        }

    if resolved_task == "CAPTIONING":
        return {
            "task": "Scene Description",
            "taskKey": "CAPTIONING",
            "workflow": "Remote-Sensing Captioning",
            "specialistId": "captioning_engine",
            "specialistName": "Remote-Sensing Captioning Engine",
            "reason": resolved_reason or "Global scene description query detected; initiating multi-scale geospatial captioner.",
            "warnings": validation_warnings,
            "requiresDualImages": False,
        }

    if resolved_task == "CHANGE_VQA":
        return {
            "task": "Change VQA",
            "taskKey": "CHANGE_VQA",
            "workflow": "Change VQA Reasoning",
            "specialistId": "change_vqa_engine",
            "specialistName": "Change VQA Engine",
            "reason": "Polar/specific change query detected over bi-temporal timeline.",
            "warnings": validation_warnings,
            "requiresDualImages": True,
        }

    if resolved_task == "CHANGE_ANALYSIS":
        return {
            "task": "Bi-Temporal Change Analysis",
            "taskKey": "CHANGE_ANALYSIS",
            "workflow": "Change Understanding",
            "specialistId": "change_engine",
            "specialistName": "Change Understanding Engine",
            "reason": "Two related images and a change-oriented query were detected.",
            "warnings": validation_warnings,
            "requiresDualImages": True,
        }

    if resolved_task == "OPTICAL_SAR_ANALYSIS":
        return {
            "task": "Optical-SAR Cross-Modal Analysis",
            "taskKey": "OPTICAL_SAR_ANALYSIS",
            "workflow": "Cross-Modal Information Extraction",
            "specialistId": "optical_sar_engine",
            "specialistName": "Optical-SAR Analysis Engine",
            "reason": "Cross-modal query and complementary sensor pair (Optical + SAR) detected.",
            "warnings": validation_warnings,
            "requiresDualImages": True,
        }

    # Default VQA
    return {
        "task": "Single Image VQA",
        "taskKey": "VQA",
        "workflow": "Remote-Sensing VQA",
        "specialistId": "vqa_engine",
        "specialistName": "Remote-Sensing VQA Engine",
        "reason": resolved_reason or "Single scene visual inquiry detected; selecting domain-adapted vision-language VQA engine.",
        "warnings": validation_warnings,
        "requiresDualImages": False,
    }
