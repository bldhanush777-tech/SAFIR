from sqlalchemy import Column, Integer, String, Float, Text, Boolean, JSON, ForeignKey, DateTime, TypeDecorator
from sqlalchemy.orm import relationship
from datetime import datetime
import json
from app.database import Base, is_sqlite
from app.config import settings

class VectorType(TypeDecorator):
    impl = Text
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            try:
                from pgvector.sqlalchemy import Vector
                return dialect.type_descriptor(Vector(settings.EMBEDDING_DIM))
            except Exception:
                return dialect.type_descriptor(Text())
        return dialect.type_descriptor(Text())

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, (list, tuple)):
            if dialect.name == 'postgresql':
                return value
            return json.dumps(list(value))
        return value

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, str):
            try:
                clean = value.strip("[]")
                if not clean:
                    return []
                return [float(x.strip()) for x in clean.split(",") if x.strip()]
            except Exception:
                try:
                    return json.loads(value)
                except Exception:
                    return []
        if hasattr(value, "tolist"):
            return value.tolist()
        return list(value) if isinstance(value, (list, tuple)) else value

class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(64), unique=True, index=True, nullable=False)  # e.g., "Saffire-I", "BASS-II"
    title = Column(String(255), nullable=False)
    category = Column(String(64), index=True, nullable=False)  # Prevention, Detection, Suppression
    facility = Column(String(128), nullable=False)  # ISS MSG, Cygnus Vehicle, CIR
    gravity_regime = Column(String(64), index=True, nullable=False)  # Microgravity (0g), Lunar (0.16g), etc.
    principal_investigator = Column(String(128), nullable=True)
    status = Column(String(64), default="Completed")
    psi_record_url = Column(String(512), nullable=True)
    summary = Column(Text, nullable=False)
    data_completeness_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    runs = relationship("ExperimentalRun", back_populates="investigation", cascade="all, delete-orphan")
    rankings = relationship("HabitatRanking", back_populates="investigation", cascade="all, delete-orphan")
    chunks = relationship("DocumentChunk", back_populates="investigation", cascade="all, delete-orphan")

class ExperimentalRun(Base):
    __tablename__ = "experimental_runs"

    id = Column(Integer, primary_key=True, index=True)
    investigation_id = Column(Integer, ForeignKey("investigations.id"), nullable=False, index=True)
    sample_material = Column(String(128), nullable=False)  # e.g., PMMA, Cotton-Fiberglass SIBAL
    oxygen_pct = Column(Float, nullable=True)  # NULL if not recorded
    pressure_kpa = Column(Float, nullable=True)  # NULL if not recorded
    ambient_flow_cm_s = Column(Float, nullable=True)  # NULL if not recorded
    gravity_g = Column(Float, nullable=True)  # 0.0, 0.16, 0.38, 1.0
    ignition_method = Column(String(128), nullable=True)
    flame_spread_rate_mm_s = Column(Float, nullable=True)  # NULL if not measured
    limiting_oxygen_index = Column(Float, nullable=True)  # NULL if not tested
    suppression_agent = Column(String(128), nullable=True)  # CO2, N2, Vacuum extinction, Water mist
    verified_source_doc = Column(String(255), nullable=False)

    investigation = relationship("Investigation", back_populates="runs")

class HabitatRanking(Base):
    __tablename__ = "habitat_rankings"

    id = Column(Integer, primary_key=True, index=True)
    investigation_id = Column(Integer, ForeignKey("investigations.id"), nullable=False, index=True)
    target_habitat = Column(String(128), nullable=False, index=True)  # Artemis Lunar Surface, ISS, Mars, Gateway
    relevance_score = Column(Float, nullable=False)  # 0-100
    scoring_breakdown_json = Column(JSON, nullable=False)  # { atmospheric_match, gravity_match, material_match, scale_match }
    justification = Column(Text, nullable=False)
    is_ai_estimated = Column(Boolean, default=False)

    investigation = relationship("Investigation", back_populates="rankings")

class ResearchGap(Base):
    __tablename__ = "research_gaps"

    id = Column(Integer, primary_key=True, index=True)
    gap_title = Column(String(255), nullable=False)
    severity = Column(String(64), nullable=False)  # Critical, High, Moderate
    missing_regime = Column(String(128), nullable=False)  # e.g. "Partial Gravity (0.16g - 0.38g)"
    missing_parameters = Column(JSON, nullable=False)  # List of parameter names
    physical_explanation = Column(Text, nullable=False)
    recommended_experiments = Column(Text, nullable=False)

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    investigation_id = Column(Integer, ForeignKey("investigations.id"), nullable=True, index=True)
    source_filename = Column(String(255), nullable=False)
    page_number = Column(Integer, nullable=False)
    section_title = Column(String(255), nullable=False)
    chunk_text = Column(Text, nullable=False)
    embedding = Column(VectorType, nullable=True)
    citation_str = Column(String(512), nullable=False)

    investigation = relationship("Investigation", back_populates="chunks")
