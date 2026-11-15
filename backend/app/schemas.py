from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Experimental Runs ---
class ExperimentalRunBase(BaseModel):
    sample_material: str
    oxygen_pct: Optional[float] = None
    pressure_kpa: Optional[float] = None
    ambient_flow_cm_s: Optional[float] = None
    gravity_g: Optional[float] = None
    ignition_method: Optional[str] = None
    flame_spread_rate_mm_s: Optional[float] = None
    limiting_oxygen_index: Optional[float] = None
    suppression_agent: Optional[str] = None
    verified_source_doc: str

class ExperimentalRunResponse(ExperimentalRunBase):
    id: int
    investigation_id: int

    class Config:
        from_attributes = True

# --- Document Chunks ---
class DocumentChunkResponse(BaseModel):
    id: int
    investigation_id: Optional[int] = None
    source_filename: str
    page_number: int
    section_title: str
    chunk_text: str
    citation_str: str

    class Config:
        from_attributes = True

# --- Habitat Rankings ---
class ScoringBreakdown(BaseModel):
    atmospheric_match: float
    gravity_match: float
    material_match: float
    scale_match: float

class HabitatRankingBase(BaseModel):
    target_habitat: str
    relevance_score: float
    scoring_breakdown_json: Dict[str, Any]
    justification: str
    is_ai_estimated: bool = False

class HabitatRankingResponse(HabitatRankingBase):
    id: int
    investigation_id: int
    investigation_code: Optional[str] = None
    investigation_title: Optional[str] = None

    class Config:
        from_attributes = True

class HabitatWeightConfig(BaseModel):
    target_habitat: str = "Artemis Lunar Surface (0.16g)"
    weight_atmospheric: float = 0.35
    weight_gravity: float = 0.35
    weight_material: float = 0.15
    weight_scale: float = 0.15

# --- Research Gaps ---
class ResearchGapResponse(BaseModel):
    id: int
    gap_title: str
    severity: str
    missing_regime: str
    missing_parameters: List[str]
    physical_explanation: str
    recommended_experiments: str

    class Config:
        from_attributes = True

# --- Investigations ---
class InvestigationBase(BaseModel):
    code: str
    title: str
    category: str
    facility: str
    gravity_regime: str
    principal_investigator: Optional[str] = None
    status: str = "Completed"
    psi_record_url: Optional[str] = None
    summary: str
    data_completeness_score: float = 0.0

class InvestigationResponse(InvestigationBase):
    id: int
    created_at: Optional[datetime] = None
    runs_count: int = 0

    class Config:
        from_attributes = True

class InvestigationDetailResponse(InvestigationBase):
    id: int
    runs: List[ExperimentalRunResponse] = []
    rankings: List[HabitatRankingResponse] = []
    chunks: List[DocumentChunkResponse] = []

    class Config:
        from_attributes = True

# --- 6-Part Scientific RAG Card ---
class SourceDocumentReference(BaseModel):
    source_filename: str
    page_number: int
    citation_str: str
    retrieved_passage: str

class ExperimentalConditionsData(BaseModel):
    sample_material: Optional[str] = "Not available"
    oxygen_pct: Optional[str] = "Not available"
    pressure_kpa: Optional[str] = "Not available"
    ambient_flow_cm_s: Optional[str] = "Not available"
    gravity_g: Optional[str] = "Not available"
    flame_spread_rate_mm_s: Optional[str] = "Not available"

class ScientificRAGCardResponse(BaseModel):
    answer: str
    relevant_investigations: List[str]
    experimental_conditions: Dict[str, Any]
    source_document: SourceDocumentReference
    limitations: str
    missing_information: str
    confidence_score: float
    is_verified_psi: bool = True
    query: str

class ChatQueryRequest(BaseModel):
    query: str
    investigation_filter: Optional[str] = None
    category_filter: Optional[str] = None

# --- Visualization Datasets ---
class FlammabilityDataPoint(BaseModel):
    material: str
    oxygen_pct: float
    pressure_kpa: float
    regime: str
    flammable: bool
    source: str

class FlameSpreadDataPoint(BaseModel):
    flow_velocity_cm_s: float
    flame_spread_rate_mm_s: Optional[float]
    gravity_regime: str
    material: str
    is_peak_hazard_zone: bool = False

class SmokeDistributionDataPoint(BaseModel):
    particle_diameter_nm: float
    relative_concentration_microgravity: float
    relative_concentration_terrestrial: float
    experiment: str
