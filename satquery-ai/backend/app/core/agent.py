"""SatQuery AI - Deterministic Agent Controller (Ported from src/ai/mockAgent.js)
Orchestrates autonomous decision-making:
Input Analysis -> Query Classification -> Workflow Selection -> Specialist Execution -> Result Integration
"""
from datetime import datetime
from typing import Dict, Any, List

from .analyzer import analyze_input
from .classifier import classify_query
from .router import select_workflow
from .integrator import integrate_result
from .specialists import (
    run_mock_vqa,
    run_mock_grounding,
    run_mock_captioning,
    run_mock_change,
    run_mock_change_vqa,
    run_mock_optical_sar,
)

def run_agent(query: str = "", inputs: List[Any] = None, configuration: Dict[str, Any] = None, task_override: str = None) -> Dict[str, Any]:
    if inputs is None:
        inputs = []
    if configuration is None:
        configuration = {}

    trace: List[Dict[str, Any]] = []

    def record_step(step_id: str, title: str, detail: str, status: str = "completed"):
        trace.append({
            "id": step_id,
            "title": title,
            "detail": detail,
            "status": status,
            "timestamp": datetime.now().strftime("%H:%M:%S"),
        })

    # Step 1: Input Received
    staged_count = len(inputs) if isinstance(inputs, list) else 0
    record_step(
        "input_received",
        "Input received",
        f"Staged {staged_count} satellite raster file(s)."
    )

    # Step 2: Input Validation & Metadata Extraction
    input_info = analyze_input(inputs, configuration)
    record_step(
        "input_validated",
        "Input validated",
        "Raster format, spatial headers, and ground sampling distance (GSD) verified."
    )

    # Step 3: Modality Identified
    record_step(
        "modality_identified",
        "Modality identified",
        f"Identified sensor modality: {input_info['modalitySummary']} ({input_info['inputType'].replace('_', ' ')})."
    )

    # Step 4: Query Understood
    classification = classify_query(query, input_info)
    if task_override:
        classification["task"] = task_override
    record_step(
        "query_understood",
        "Query understood",
        f'Semantic intention parsed: "{classification["intent"]}". Key tokens mapped.'
    )

    # Step 5: Task Classified
    conf_pct = int(round(classification["confidence"] * 100))
    record_step(
        "task_classified",
        "Task classified",
        f"Classified task domain as [{classification['task']}] with {conf_pct}% algorithmic confidence."
    )

    # Step 6: Workflow Selected & Specialist Assigned
    routing = select_workflow(classification, input_info, configuration)
    record_step(
        "workflow_selected",
        "Workflow selected",
        f"Autonomous pipeline mapped to [{routing['workflow']}]. Reason: {routing['reason']}"
    )

    record_step(
        "specialist_selected",
        "Specialist selected",
        f"Assigned execution to specialized engine: [{routing['specialistName']}]."
    )

    # Step 7: Specialist Executed
    task_key = routing.get("taskKey", "VQA")
    if task_key == "GROUNDING":
        specialist_result = run_mock_grounding(query, input_info)
    elif task_key == "CAPTIONING":
        specialist_result = run_mock_captioning(query, input_info)
    elif task_key == "CHANGE_VQA":
        specialist_result = run_mock_change_vqa(query, input_info)
    elif task_key == "CHANGE_ANALYSIS":
        specialist_result = run_mock_change(query, input_info)
    elif task_key == "OPTICAL_SAR_ANALYSIS":
        specialist_result = run_mock_optical_sar(query, input_info)
    else:
        specialist_result = run_mock_vqa(query, input_info)

    record_step(
        "specialist_executed",
        "Specialist executed",
        f"Specialist [{routing['specialistName']}] execution completed without inference exceptions."
    )

    # Step 8: Evidence Prepared
    record_step(
        "evidence_prepared",
        "Evidence prepared",
        "Spatial annotations, spectral masks, and coordinate overlays synthesized."
    )

    # Step 9: Result Integrated
    record_step(
        "result_integrated",
        "Result integrated",
        "Findings, calibrated confidence, and auditable telemetry integrated into unified contract."
    )

    # Final assembly
    final_result = integrate_result(
        task=routing["task"],
        task_key=routing["taskKey"],
        workflow=routing["workflow"],
        specialist=routing["specialistName"],
        specialist_id=routing["specialistId"],
        reason=routing["reason"],
        query=query,
        input_info=input_info,
        specialist_result=specialist_result,
        execution_trace=trace,
    )

    return final_result
