"""Tests for ReportService PDF dossier generation."""
import pytest

from app.services.report_service import ReportService, report_service


@pytest.fixture
def complete_analysis_payload():
    """Mock analysis response dictionary matching frontend UI contract."""
    return {
        "task": "Single Image VQA",
        "taskKey": "single_vqa",
        "workflow": "Remote-Sensing VQA",
        "specialist": "Remote-Sensing VQA Engine",
        "specialist_name": "Remote-Sensing VQA Engine",
        "specialistId": "vqa_engine",
        "reason": "Single scene visual inquiry detected; selecting domain-adapted VQA engine.",
        "query": "Describe the land cover and vegetation distribution in this scene.",
        "translated_query": "Describe the land cover and vegetation distribution in this scene.",
        "answer": "The scene contains a mixture of vegetation (28%), open land (20%), built-up urban infrastructure (42%), and surface water features (10%).",
        "confidence": {
            "value": 0.92,
            "percentage": 92,
            "type": "prototype",
            "label": "Prototype Confidence",
            "disclaimer": "Simulated prototype confidence metric for algorithmic evaluation.",
        },
        "evidence": {
            "type": "categorical-distribution",
            "explanation": "Categorical distribution derived via multi-scale patch token alignment.",
        },
        "categories": [
            {"name": "Built-up Area", "percentage": 42, "description": "Impervious surfaces, roofs, transit"},
            {"name": "Vegetation", "percentage": 28, "description": "Canopy cover, active cropland parcels"},
            {"name": "Open Land", "percentage": 20, "description": "Scrubland, unpaved soil"},
            {"name": "Water Body", "percentage": 10, "description": "Reservoir basin and natural drainage"},
        ],
        "inputInfo": {
            "imageCount": 1,
            "modalitySummary": "Optical Sentinel-2 L2A",
            "temporal": False,
            "crossModal": False,
            "filePaths": ["scene_01.tif"],
        },
        "executionTrace": [
            "Step 1: Input received - Staged 1 satellite raster file(s).",
            "Step 2: Input validated - Raster format, spatial headers, and GSD verified.",
            "Step 3: Modality identified - Sensor modality recognized as [Optical].",
            "Step 4: Query understood - Semantic intention mapped for query.",
            "Step 5: Task classified - Classified task domain as [single_vqa] with 92% confidence.",
            "Step 6: Workflow selected - Autonomous execution pipeline mapped to [Remote-Sensing VQA].",
            "Step 7: Specialist selected - Assigned execution to [Remote-Sensing VQA Engine].",
            "Step 8: Specialist executed - Specialist completed inference successfully.",
            "Step 9: Evidence prepared - Spatial annotations and spectral masks synthesized.",
            "Step 10: Result integrated - Telemetry integrated into unified contract.",
        ],
        "summaryCards": [
            {"label": "Dominant Cover", "value": "Built-up (42%)", "icon": "Building"},
            {"label": "Vegetation Canopy", "value": "28% Surface", "icon": "Trees"},
            {"label": "Prototype Confidence", "value": "92%", "icon": "ShieldCheck"},
        ],
        "prototype": True,
        "timestamp": "2026-09-08T02:00:00Z",
    }


# -----------------------------------------------------------------------------
# ReportService Unit Tests
# -----------------------------------------------------------------------------

def test_generate_pdf_complete_payload(complete_analysis_payload):
    """Test generating PDF with a complete mock analysis payload."""
    pdf_bytes = ReportService.generate_pdf(complete_analysis_payload)

    # Output must be raw bytes
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 1000

    # Magic header for valid PDF document
    assert pdf_bytes.startswith(b"%PDF-")


def test_generate_pdf_empty_dict():
    """Test resilience with an empty dictionary input without crashing."""
    pdf_bytes = ReportService.generate_pdf({})

    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 500
    assert pdf_bytes.startswith(b"%PDF-")


def test_generate_pdf_none_input():
    """Test resilience when None is passed instead of a dict."""
    pdf_bytes = ReportService.generate_pdf(None)

    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 500
    assert pdf_bytes.startswith(b"%PDF-")


def test_generate_pdf_sparse_dict_missing_fields():
    """Test resilience with sparse dictionary missing most fields."""
    sparse_data = {
        "query": "Where is the reservoir?",
        "answer": "Reservoir localized in central basin.",
        "confidence": 0.88,
    }
    pdf_bytes = ReportService.generate_pdf(sparse_data)

    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 500
    assert pdf_bytes.startswith(b"%PDF-")


def test_generate_pdf_grounding_payload():
    """Test PDF generation for visual grounding task with bounding box."""
    grounding_data = {
        "task": "Visual Grounding",
        "workflow": "Text-Guided Grounding",
        "specialist": "Visual Grounding Engine",
        "query": "Locate the industrial complex.",
        "answer": "An industrial facility is located in the demarcated coordinates.",
        "confidence": 0.94,
        "boundingBox": {
            "x": 55,
            "y": 15,
            "width": 35,
            "height": 30,
            "label": "Demo Grounding Region: Structural Complex",
        },
        "evidence": {
            "type": "bounding-box",
            "coordinates": "12°58'23\"N, 77°35'45\"E",
            "estimatedArea": "2.34 km²",
        },
        "executionTrace": [
            {"title": "Input received", "detail": "1 file", "timestamp": "01:00:00"},
            {"title": "Input validated", "detail": "Verified", "timestamp": "01:00:01"},
        ],
    }
    pdf_bytes = ReportService.generate_pdf(grounding_data)

    assert isinstance(pdf_bytes, bytes)
    assert pdf_bytes.startswith(b"%PDF-")


def test_generate_pdf_bitemporal_change_payload():
    """Test PDF generation for bi-temporal change analysis."""
    change_data = {
        "task": "Bi-Temporal Change Analysis",
        "workflow": "Change Understanding",
        "specialist": "Change Understanding Engine",
        "query": "What changed between baseline and target?",
        "answer": "The built-up area expanded significantly in the northern sector.",
        "confidence": 0.91,
        "changes": [
            {"region": "Northern Sector", "label": "Built-up Expansion", "estimatedArea": "+14.8 ha", "confidence": 0.91},
            {"region": "Eastern Flank", "label": "Arterial Grading", "estimatedArea": "+3.2 km", "confidence": 0.88},
        ],
    }
    pdf_bytes = ReportService.generate_pdf(change_data)

    assert isinstance(pdf_bytes, bytes)
    assert pdf_bytes.startswith(b"%PDF-")


def test_generate_pdf_optical_sar_payload():
    """Test PDF generation for cross-modal optical + SAR analysis."""
    sar_data = {
        "task": "Optical-SAR Cross-Modal Analysis",
        "workflow": "Cross-Modal Information Extraction",
        "specialist": "Optical-SAR Analysis Engine",
        "query": "Combine optical and radar data.",
        "answer": "The combined analysis isolates impervious structures and surface water.",
        "confidence": 0.89,
        "findings": [
            {"title": "High Backscatter", "badge": "SAR Double-Bounce", "description": "High returns in VV/VH channel."},
            {"title": "Specular Non-Return", "badge": "Water Body", "description": "Zero radar reflectance."},
        ],
    }
    pdf_bytes = ReportService.generate_pdf(sar_data)

    assert isinstance(pdf_bytes, bytes)
    assert pdf_bytes.startswith(b"%PDF-")


def test_singleton_report_service():
    """Test that the singleton instance is functional."""
    pdf_bytes = report_service.generate_pdf({"query": "Test singleton"})
    assert isinstance(pdf_bytes, bytes)
    assert pdf_bytes.startswith(b"%PDF-")
