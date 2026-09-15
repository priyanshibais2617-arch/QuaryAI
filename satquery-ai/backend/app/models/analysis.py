from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class UploadRequest(BaseModel):
    filename: str = Field(..., description="Name or relative path of the staged satellite raster file")
    size: Optional[int] = Field(None, description="Size of file in bytes")
    modality: Optional[str] = Field(None, description="Modality if known (Optical, Multispectral, SAR)")
    file_type: Optional[str] = Field(None, description="File format (e.g. GeoTIFF, PNG)")
    dimensions: Optional[str] = Field(None, description="Spatial pixel dimensions")
    bands: Optional[str] = Field(None, description="Sensor spectral bands")
    benchmark_source: Optional[str] = Field(None, description="Required benchmark dataset tag for PNG/JPEG (BigEarthNet, VRSBench, RSVQA, CDVQA)")

class UploadResponse(BaseModel):
    id: str
    filename: str
    modality: str = "Optical"
    status: str = "staged"
    benchmark_source: Optional[str] = None
    created_at: str


class ExecuteRequest(BaseModel):
    query: str = Field("", description="Natural language question or instruction")
    inputs: List[Dict[str, Any]] = Field(default_factory=list, description="Staged satellite raster input metadata")
    configuration: Dict[str, Any] = Field(default_factory=dict, description="Execution parameters, e.g. temporal, pairType")
    task: Optional[str] = Field(None, description="Optional explicit task override")

class ConfidenceModel(BaseModel):
    value: float
    percentage: int
    type: str = "prototype"
    label: str = "Prototype Confidence"
    disclaimer: str = "Simulated prototype confidence metric for algorithmic evaluation."

class SummaryCard(BaseModel):
    label: str
    value: str
    icon: Optional[str] = None

class ExecutionStep(BaseModel):
    id: str
    title: str
    detail: str
    status: str = "completed"
    timestamp: str

class InputInfoModel(BaseModel):
    imageCount: int = 1
    modalitySummary: str = "Optical"
    temporal: bool = False
    crossModal: bool = False

class ExecuteResponse(BaseModel):
    task: str
    taskKey: str
    workflow: str
    specialist: str
    specialistId: str
    reason: str
    query: str
    answer: str
    confidence: ConfidenceModel
    evidence: Dict[str, Any] = Field(default_factory=dict)
    categories: List[Dict[str, Any]] = Field(default_factory=list)
    changes: List[Dict[str, Any]] = Field(default_factory=list)
    findings: List[Dict[str, Any]] = Field(default_factory=list)
    boundingBox: Optional[Dict[str, Any]] = None
    analysisLabel: str = "Prototype Evaluation"
    summaryCards: List[SummaryCard] = Field(default_factory=list)
    inputInfo: InputInfoModel
    executionTrace: List[ExecutionStep] = Field(default_factory=list)
    prototype: bool = True
    timestamp: str
    analysis_id: Optional[str] = None

class StatusResponse(BaseModel):
    id: str
    status: str = "completed"
    progress: int = 100
    created_at: Optional[str] = None
    completed_at: Optional[str] = None
    result: Optional[ExecuteResponse] = None
