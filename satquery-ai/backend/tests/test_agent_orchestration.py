"""Tests for AgentRouter and SpecialistEngine services."""
import json
from unittest.mock import MagicMock, patch
import pytest

from app.services.agent_router import AgentRouter, agent_router
from app.services.specialists import SpecialistEngine, specialist_engine


# -----------------------------------------------------------------------------
# 1. AgentRouter Tests
# -----------------------------------------------------------------------------

def test_agent_router_fallback_vqa():
    """Verify deterministic fallback for single VQA queries."""
    result = agent_router.route_query("What is the dominant land cover in this area?", file_count=1, modalities=["Optical"])

    assert result["task"] == "single_vqa"
    assert result["workflow"] == "Remote-Sensing VQA"
    assert isinstance(result["confidence"], float)
    assert result["confidence"] > 0.0
    assert result["translated_query"] == "What is the dominant land cover in this area?"


def test_agent_router_fallback_grounding():
    """Verify deterministic fallback for grounding queries."""
    result = agent_router.route_query("Where is the reservoir? Highlight the bounding box.", file_count=1, modalities=["Optical"])

    assert result["task"] == "grounding"
    assert result["workflow"] == "Text-Guided Grounding"
    assert result["confidence"] >= 0.90


def test_agent_router_fallback_captioning():
    """Verify deterministic fallback for captioning queries."""
    result = agent_router.route_query("Describe the scene and generate a caption.", file_count=1, modalities=["Optical"])

    assert result["task"] == "captioning"
    assert result["workflow"] == "Remote-Sensing Captioning"
    assert result["confidence"] >= 0.90


def test_agent_router_fallback_bitemporal_change():
    """Verify deterministic fallback for bi-temporal change queries."""
    result = agent_router.route_query("What changed between these two dates?", file_count=2, modalities=["Optical", "Optical"])

    assert result["task"] == "bitemporal_change"
    assert result["workflow"] == "Change Understanding"
    assert result["confidence"] >= 0.90


def test_agent_router_fallback_optical_sar():
    """Verify deterministic fallback for optical + SAR cross-modal queries."""
    result = agent_router.route_query("Combine optical and SAR radar returns for flood delineation.", file_count=2, modalities=["Optical", "SAR"])

    assert result["task"] == "optical_sar"
    assert result["workflow"] == "Cross-Modal Information Extraction"
    assert result["confidence"] >= 0.90


def test_agent_router_openai_path_mocked():
    """Verify AgentRouter correctly invokes OpenAI SDK with json_object mode."""
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(
            message=MagicMock(
                content=json.dumps({
                    "translated_query": "Is there structural growth in the northern sector?",
                    "task": "bitemporal_change",
                    "workflow": "Change Understanding",
                    "confidence": 0.97,
                })
            )
        )
    ]

    mock_client = MagicMock()
    mock_client.chat.completions.create.return_value = mock_response

    with patch("openai.OpenAI", return_value=mock_client):
        router = AgentRouter(api_key="sk-mock-test-key")
        result = router.route_query(
            "क्या उत्तरी क्षेत्र में संरचनात्मक विकास हुआ है?",
            file_count=2,
            modalities=["Optical", "Optical"],
        )

        assert result["task"] == "bitemporal_change"
        assert result["workflow"] == "Change Understanding"
        assert result["translated_query"] == "Is there structural growth in the northern sector?"
        assert result["confidence"] == 0.97

        # Verify OpenAI called with json_object response format
        mock_client.chat.completions.create.assert_called_once()
        call_kwargs = mock_client.chat.completions.create.call_args.kwargs
        assert call_kwargs["response_format"] == {"type": "json_object"}
        assert call_kwargs["model"] == "gpt-4o-mini"


def test_agent_router_openai_failure_falls_back():
    """Verify that any OpenAI API failure gracefully falls back to deterministic keyword routing."""
    mock_client = MagicMock()
    mock_client.chat.completions.create.side_effect = RuntimeError("OpenAI API rate limit exceeded")

    with patch("openai.OpenAI", return_value=mock_client):
        router = AgentRouter(api_key="sk-mock-test-key")
        result = router.route_query("Where is the water body?", file_count=1, modalities=["Optical"])

        # Successfully falls back
        assert result["task"] == "grounding"
        assert result["workflow"] == "Text-Guided Grounding"


# -----------------------------------------------------------------------------
# 2. SpecialistEngine Tests
# -----------------------------------------------------------------------------

@pytest.mark.parametrize(
    "task_input,expected_specialist,expected_workflow",
    [
        ("single_vqa", "Remote-Sensing VQA Engine", "Remote-Sensing VQA"),
        ("grounding", "Visual Grounding Engine", "Text-Guided Grounding"),
        ("captioning", "Remote-Sensing Captioning Engine", "Remote-Sensing Captioning"),
        ("bitemporal_change", "Change Understanding Engine", "Change Understanding"),
        ("optical_sar", "Optical-SAR Analysis Engine", "Cross-Modal Information Extraction"),
    ],
)
def test_specialist_engine_execution_all_tasks(task_input, expected_specialist, expected_workflow):
    """Verify SpecialistEngine execution across all 5 tasks."""
    engine = SpecialistEngine()
    result = engine.execute(
        task=task_input,
        query="Analyze the staged imagery features.",
        file_paths=["raster_01.tif"],
        meta={"modality": "Optical", "imageCount": 1},
    )

    # 1. Verification of return payload structure
    assert "answer" in result
    assert isinstance(result["answer"], str)
    assert len(result["answer"]) > 0

    assert "evidence" in result
    assert isinstance(result["evidence"], dict)

    assert result["specialist"] == expected_specialist
    assert result["specialist_name"] == expected_specialist
    assert result["workflow"] == expected_workflow

    # 2. 10-step list of strings execution trace verification
    assert "execution_trace" in result
    assert "executionTrace" in result
    trace = result["execution_trace"]
    assert isinstance(trace, list)
    assert len(trace) == 10
    assert all(isinstance(step, str) for step in trace)
    assert result["executionTrace"] == trace

    # Check that trace steps start with Step numbering
    assert trace[0].startswith("Step 1: Input received")
    assert trace[9].startswith("Step 10: Result integrated")

    # 3. Frontend UI contract fields verification
    assert "task" in result
    assert "taskKey" in result
    assert "confidence" in result
    assert isinstance(result["confidence"], dict)
    assert "value" in result["confidence"]
    assert "percentage" in result["confidence"]
    assert "summaryCards" in result
    assert isinstance(result["summaryCards"], list)
    assert len(result["summaryCards"]) > 0
    assert result["prototype"] is True
    assert "timestamp" in result


def test_specialist_engine_grounding_bounding_box():
    """Verify grounding task returns bounding box information."""
    result = specialist_engine.execute(
        task="grounding",
        query="Locate the industrial building complex.",
        file_paths=["sample.tif"],
    )

    assert result["boundingBox"] is not None
    assert "x" in result["boundingBox"]
    assert "y" in result["boundingBox"]
    assert "width" in result["boundingBox"]
    assert "height" in result["boundingBox"]
    assert "Structural Complex" in result["boundingBox"]["label"]


def test_specialist_engine_bitemporal_change_payload():
    """Verify change specialist returns differential changes."""
    result = specialist_engine.execute(
        task="bitemporal_change",
        query="What changed between baseline and target?",
        file_paths=["t1.tif", "t2.tif"],
        meta={"imageCount": 2},
    )

    assert len(result["changes"]) > 0
    assert result["changes"][0]["label"] == "Built-up Expansion"
    assert result["inputInfo"]["temporal"] is True
    assert len(result["execution_trace"]) == 10
