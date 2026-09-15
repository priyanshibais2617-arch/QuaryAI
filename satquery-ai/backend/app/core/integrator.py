"""SatQuery AI - Deterministic Result Integrator (Ported from src/ai/resultIntegrator.js)"""
from datetime import datetime, timezone
from typing import Dict, Any, List

def integrate_result(
    task: str = "Single Image VQA",
    task_key: str = "VQA",
    workflow: str = "Remote-Sensing VQA",
    specialist: str = "Remote-Sensing VQA Engine",
    specialist_id: str = "vqa_engine",
    reason: str = "",
    query: str = "",
    input_info: Dict[str, Any] = None,
    specialist_result: Dict[str, Any] = None,
    execution_trace: List[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    if input_info is None:
        input_info = {}
    if specialist_result is None:
        specialist_result = {}
    if execution_trace is None:
        execution_trace = []

    raw_confidence = specialist_result.get("confidence", 0.90)
    percentage = round(raw_confidence * 100)

    default_summary_cards = [
        {"label": "Task Domain", "value": task, "icon": "Layers"},
        {"label": "Specialist Engine", "value": specialist, "icon": "Cpu"},
        {"label": "Sensor Input", "value": input_info.get("modalitySummary") or "Optical", "icon": "Satellite"},
        {"label": "Prototype Confidence", "value": f"{percentage}%", "icon": "ShieldCheck"},
    ]

    summary_cards = specialist_result.get("summaryCards") or default_summary_cards

    return {
        "task": task,
        "taskKey": task_key,
        "workflow": workflow,
        "specialist": specialist,
        "specialistId": specialist_id,
        "reason": reason,
        "query": query,

        # Core answer
        "answer": specialist_result.get("answer", "Analysis completed successfully."),

        # Calibrated prototype confidence
        "confidence": {
            "value": raw_confidence,
            "percentage": percentage,
            "type": "prototype",
            "label": "Prototype Confidence",
            "disclaimer": "Simulated prototype confidence metric for algorithmic evaluation.",
        },

        # Task-specific structured evidence
        "evidence": specialist_result.get("evidence", {}),
        "categories": specialist_result.get("categories", []),
        "changes": specialist_result.get("changes", []),
        "findings": specialist_result.get("findings", []),
        "boundingBox": specialist_result.get("boundingBox", None),
        "analysisLabel": specialist_result.get("analysisLabel") or specialist_result.get("confidenceLabel") or "Prototype Evaluation",

        # Summary metadata
        "summaryCards": summary_cards,
        "inputInfo": {
            "imageCount": input_info.get("imageCount", 1),
            "modalitySummary": input_info.get("modalitySummary", "Optical"),
            "temporal": input_info.get("temporal", False),
            "crossModal": input_info.get("crossModal", False),
        },

        # Full step-by-step execution trace
        "executionTrace": execution_trace,

        # Prototype flag
        "prototype": True,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
