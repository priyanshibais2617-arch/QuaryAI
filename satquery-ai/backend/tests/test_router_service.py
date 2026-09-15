"""Tests for backend/app/services/router.py intent routing and agent dispatch."""
import json
from unittest.mock import MagicMock, patch
import pytest

from app.services.router import (
    Router,
    AgentRouter,
    router,
    agent_router,
    VALID_TASKS,
    SINGLE_FILE_TASKS,
    DUAL_FILE_TASKS,
)


def test_router_exports_and_aliases():
    """Verify Router and AgentRouter aliases and singletons."""
    assert Router is AgentRouter
    assert router is agent_router
    assert isinstance(router, Router)
    assert len(VALID_TASKS) == 5
    assert len(SINGLE_FILE_TASKS) == 3
    assert len(DUAL_FILE_TASKS) == 2


# -----------------------------------------------------------------------------
# Single-File Payload Logic (file_count == 1)
# -----------------------------------------------------------------------------

def test_single_file_vqa_routing():
    """Verify single-file queries asking for terrain or features route to single_vqa."""
    queries = [
        "What is the dominant land cover in this area?",
        "How many water bodies are visible in this scene?",
        "Assess the spectral characteristics of the vegetation.",
    ]
    for q in queries:
        res = router.route_query(q, file_count=1, modalities=["Optical"])
        assert res["task"] == "single_vqa"
        assert res["workflow"] == "Remote-Sensing VQA"
        assert res["confidence"] >= 0.90


def test_single_file_captioning_routing():
    """Verify single-file captioning queries route to captioning."""
    queries = [
        "Describe the scene and generate a caption.",
        "Provide a comprehensive descriptive caption of this remote sensing imagery.",
        "Summarize the scene layout and terrain.",
    ]
    for q in queries:
        res = router.route_query(q, file_count=1, modalities=["Optical"])
        assert res["task"] == "captioning"
        assert res["workflow"] == "Remote-Sensing Captioning"
        assert res["confidence"] >= 0.90


def test_single_file_grounding_routing():
    """Verify single-file localization queries route to grounding."""
    queries = [
        "Where is the primary water body or reservoir in this scene?",
        "Locate the industrial facility and provide bounding box coordinates.",
        "Pinpoint the transportation junction.",
        "Show me where the coastal boundary is demarcated.",
    ]
    for q in queries:
        res = router.route_query(q, file_count=1, modalities=["Multispectral"])
        assert res["task"] == "grounding"
        assert res["workflow"] == "Text-Guided Grounding"
        assert res["confidence"] >= 0.90


def test_single_file_change_query_handles_single_file_gracefully():
    """Verify a change query with only 1 file staged gracefully falls back to single-image analysis."""
    res = router.route_query("What changed in this area?", file_count=1, modalities=["Optical"])
    # Single file cannot do bi-temporal change without a second temporal scene
    assert res["task"] in SINGLE_FILE_TASKS


# -----------------------------------------------------------------------------
# Dual-File Payload Logic (file_count >= 2)
# -----------------------------------------------------------------------------

def test_dual_file_bitemporal_change_routing():
    """Verify dual-file temporal queries route to bitemporal_change."""
    queries = [
        "What spatial changes or urban expansion occurred between these two dates?",
        "Analyze the difference between before and after scenes.",
        "Has the built-up area increased over the timeline?",
    ]
    for q in queries:
        res = router.route_query(q, file_count=2, modalities=["Optical", "Optical"])
        assert res["task"] == "bitemporal_change"
        assert res["workflow"] == "Change Understanding"
        assert res["confidence"] >= 0.90


def test_dual_file_optical_default_without_keywords():
    """Verify 2 optical files without explicit keywords default to bi-temporal change."""
    res = router.route_query("Inspect these two satellite acquisitions.", file_count=2, modalities=["Optical", "Optical"])
    assert res["task"] == "bitemporal_change"
    assert res["workflow"] == "Change Understanding"


def test_dual_file_optical_sar_routing():
    """Verify dual-file cross-modal queries route to optical_sar."""
    queries = [
        "Combine optical and SAR radar returns for flood delineation.",
        "Correlate optical reflectance with SAR microwave backscatter.",
        "Cross-modal sensor fusion to penetrate cloud occlusions.",
    ]
    for q in queries:
        res = router.route_query(q, file_count=2, modalities=["Optical", "SAR"])
        assert res["task"] == "optical_sar"
        assert res["workflow"] == "Cross-Modal Information Extraction"
        assert res["confidence"] >= 0.90


def test_dual_file_sar_modality_triggers_optical_sar():
    """Verify that having both Optical and SAR modalities triggers optical_sar even with generic query."""
    res = router.route_query("Analyze both sensors together.", file_count=2, modalities=["Optical", "SAR"])
    assert res["task"] == "optical_sar"
    assert res["workflow"] == "Cross-Modal Information Extraction"


# -----------------------------------------------------------------------------
# LLM Integration & Mocked Testing
# -----------------------------------------------------------------------------

def test_router_llm_json_mode_mocked():
    """Verify Router calls OpenAI with response_format={'type': 'json_object'}."""
    mock_payload = {
        "translated_query": "Identify and ground the water reservoir.",
        "task": "grounding",
        "workflow": "Text-Guided Grounding",
        "confidence": 0.96,
    }

    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(message=MagicMock(content=json.dumps(mock_payload)))
    ]

    mock_client = MagicMock()
    mock_client.chat.completions.create.return_value = mock_response

    with patch("openai.OpenAI", return_value=mock_client):
        custom_router = Router(api_key="sk-test-key")
        result = custom_router.route_query(
            "जलाशय कहाँ स्थित है?",
            file_count=1,
            modalities=["Optical"],
        )

        assert result["task"] == "grounding"
        assert result["workflow"] == "Text-Guided Grounding"
        assert result["translated_query"] == "Identify and ground the water reservoir."
        assert result["confidence"] == 0.96
        mock_client.chat.completions.create.assert_called_once()
        kwargs = mock_client.chat.completions.create.call_args.kwargs
        assert kwargs["response_format"] == {"type": "json_object"}


def test_benchmark_representative_queries_autonomous_routing():
    """Verify autonomous routing and 10-step execution trace for competition benchmark representative queries."""
    benchmark_cases = [
        {
            "query": "Describe the land-cover and major objects visible in this image.",
            "file_count": 1,
            "modalities": ["Optical"],
            "expected_task": "captioning",
        },
        {
            "query": "Highlight the water body referred to in the query.",
            "file_count": 1,
            "modalities": ["Optical"],
            "expected_task": "grounding",
        },
        {
            "query": "What changed between these two dates, and where did the change occur?",
            "file_count": 2,
            "modalities": ["Optical", "Optical"],
            "expected_task": "bitemporal_change",
        },
        {
            "query": "Has the built-up area increased, decreased, or remained unchanged?",
            "file_count": 2,
            "modalities": ["Optical", "Optical"],
            "expected_task": "bitemporal_change",
        },
        {
            "query": "Use the optical and SAR images together to identify built-up and water-covered regions.",
            "file_count": 2,
            "modalities": ["Optical", "SAR"],
            "expected_task": "optical_sar",
        },
    ]

    for case in benchmark_cases:
        res = router.route_query(
            case["query"],
            file_count=case["file_count"],
            modalities=case["modalities"],
        )
        assert res["task"] == case["expected_task"], f"Query '{case['query']}' failed to route to {case['expected_task']}, got {res['task']}"
        assert "executionTrace" in res
        assert isinstance(res["executionTrace"], list)
        assert len(res["executionTrace"]) == 10, f"Expected 10-step execution trace, got {len(res['executionTrace'])}"

