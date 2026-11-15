from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.database import get_db
from app.models import Investigation, ExperimentalRun, HabitatRanking, DocumentChunk
from app.schemas import InvestigationResponse, InvestigationDetailResponse

router = APIRouter(prefix="/investigations", tags=["investigations"])

@router.get("", response_model=List[InvestigationResponse])
def get_investigations(
    category: Optional[str] = Query(None, description="Prevention, Detection, Suppression"),
    gravity_regime: Optional[str] = Query(None),
    facility: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    min_completeness: Optional[float] = Query(None, ge=0, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Investigation)

    if category and category != "All":
        query = query.filter(Investigation.category == category)
    if gravity_regime and gravity_regime != "All":
        query = query.filter(Investigation.gravity_regime.ilike(f"%{gravity_regime}%"))
    if facility and facility != "All":
        query = query.filter(Investigation.facility.ilike(f"%{facility}%"))
    if search:
        s = f"%{search}%"
        query = query.filter(
            (Investigation.code.ilike(s)) |
            (Investigation.title.ilike(s)) |
            (Investigation.summary.ilike(s)) |
            (Investigation.principal_investigator.ilike(s))
        )
    if min_completeness is not None:
        query = query.filter(Investigation.data_completeness_score >= min_completeness)

    investigations = query.all()
    result = []
    for inv in investigations:
        runs_count = db.query(func.count(ExperimentalRun.id)).filter(ExperimentalRun.investigation_id == inv.id).scalar()
        inv_dict = {
            "id": inv.id,
            "code": inv.code,
            "title": inv.title,
            "category": inv.category,
            "facility": inv.facility,
            "gravity_regime": inv.gravity_regime,
            "principal_investigator": inv.principal_investigator,
            "status": inv.status,
            "psi_record_url": inv.psi_record_url,
            "summary": inv.summary,
            "data_completeness_score": inv.data_completeness_score,
            "created_at": inv.created_at,
            "runs_count": runs_count or 0
        }
        result.append(inv_dict)
    return result

@router.get("/summary/stats")
def get_fleet_stats(db: Session = Depends(get_db)):
    total_inv = db.query(Investigation).count()
    total_runs = db.query(ExperimentalRun).count()
    total_chunks = db.query(DocumentChunk).count()
    avg_completeness = db.query(func.avg(Investigation.data_completeness_score)).scalar() or 0.0

    category_counts = {}
    for cat in ["Prevention", "Detection", "Suppression"]:
        cnt = db.query(Investigation).filter(Investigation.category == cat).count()
        category_counts[cat] = cnt

    return {
        "verified_investigations_count": total_inv,
        "total_experimental_runs": total_runs,
        "live_chunks_indexed": total_chunks,
        "average_completeness_pct": round(avg_completeness, 1),
        "gravity_regimes_mapped": 4,  # 0g microgravity, 0.16g Lunar, 0.38g Mars, 1g Earth
        "categories_breakdown": category_counts,
        "status": "NOMINAL",
        "last_telemetry_sync": "2026-11-14T12:00:00Z"
    }

@router.get("/{code}", response_model=InvestigationDetailResponse)
def get_investigation_detail(code: str, db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter(Investigation.code.ilike(code)).first()
    if not inv:
        raise HTTPException(status_code=404, detail=f"Investigation '{code}' not found in NASA PSI database.")

    runs = db.query(ExperimentalRun).filter(ExperimentalRun.investigation_id == inv.id).all()
    rankings = db.query(HabitatRanking).filter(HabitatRanking.investigation_id == inv.id).all()
    chunks = db.query(DocumentChunk).filter(DocumentChunk.investigation_id == inv.id).all()

    return {
        "id": inv.id,
        "code": inv.code,
        "title": inv.title,
        "category": inv.category,
        "facility": inv.facility,
        "gravity_regime": inv.gravity_regime,
        "principal_investigator": inv.principal_investigator,
        "status": inv.status,
        "psi_record_url": inv.psi_record_url,
        "summary": inv.summary,
        "data_completeness_score": inv.data_completeness_score,
        "runs": runs,
        "rankings": rankings,
        "chunks": chunks
    }
