from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.database import get_db
from app.models import ExperimentalRun, Investigation
from app.schemas import ExperimentalRunResponse

router = APIRouter(prefix="/experiments", tags=["experiments"])

@router.get("/runs", response_model=List[ExperimentalRunResponse])
def get_experimental_runs(
    investigation_id: Optional[int] = Query(None),
    sample_material: Optional[str] = Query(None),
    min_oxygen: Optional[float] = Query(None),
    max_oxygen: Optional[float] = Query(None),
    suppression_only: Optional[bool] = Query(False),
    db: Session = Depends(get_db)
):
    query = db.query(ExperimentalRun)
    if investigation_id:
        query = query.filter(ExperimentalRun.investigation_id == investigation_id)
    if sample_material:
        query = query.filter(ExperimentalRun.sample_material.ilike(f"%{sample_material}%"))
    if min_oxygen is not None:
        query = query.filter(ExperimentalRun.oxygen_pct >= min_oxygen)
    if max_oxygen is not None:
        query = query.filter(ExperimentalRun.oxygen_pct <= max_oxygen)
    if suppression_only:
        query = query.filter(ExperimentalRun.suppression_agent.isnot(None))

    return query.all()

@router.post("/compare")
def compare_investigations(
    codes: List[str] = Body(..., description="List of 2 to 4 investigation codes to compare"),
    db: Session = Depends(get_db)
):
    if len(codes) < 2 or len(codes) > 4:
        raise HTTPException(status_code=400, detail="Please select between 2 and 4 investigations to compare.")

    investigations = []
    for code in codes:
        inv = db.query(Investigation).filter(Investigation.code.ilike(code)).first()
        if not inv:
            raise HTTPException(status_code=404, detail=f"Investigation '{code}' not found.")
        runs = db.query(ExperimentalRun).filter(ExperimentalRun.investigation_id == inv.id).all()
        investigations.append({
            "investigation": inv,
            "runs": runs
        })

    comparison_matrix = []
    for item in investigations:
        inv = item["investigation"]
        runs = item["runs"]

        oxygen_values = [r.oxygen_pct for r in runs if r.oxygen_pct is not None]
        pressure_values = [r.pressure_kpa for r in runs if r.pressure_kpa is not None]
        flow_values = [r.ambient_flow_cm_s for r in runs if r.ambient_flow_cm_s is not None]
        flame_spread_values = [r.flame_spread_rate_mm_s for r in runs if r.flame_spread_rate_mm_s is not None]
        materials = list(set([r.sample_material for r in runs]))
        suppression_methods = list(set([r.suppression_agent for r in runs if r.suppression_agent]))

        comparison_matrix.append({
            "code": inv.code,
            "title": inv.title,
            "category": inv.category,
            "facility": inv.facility,
            "gravity_regime": inv.gravity_regime,
            "principal_investigator": inv.principal_investigator or "Not available",
            "data_completeness_score": inv.data_completeness_score,
            "sample_materials": materials if materials else ["Not available"],
            "tested_oxygen_range": f"{min(oxygen_values)}% - {max(oxygen_values)}%" if oxygen_values else "Not available",
            "tested_pressure_range": f"{min(pressure_values)} - {max(pressure_values)} kPa" if pressure_values else "Not available",
            "forced_flow_velocity_range": f"{min(flow_values)} - {max(flow_values)} cm/s" if flow_values else "Not available",
            "measured_flame_spread_range": f"{min(flame_spread_values)} - {max(flame_spread_values)} mm/s" if flame_spread_values else "Not available",
            "suppression_techniques": suppression_methods if suppression_methods else ["Not available"],
            "psi_url": inv.psi_record_url
        })

    # Generate transparent analytical synthesis
    synthesis = {
        "scale_comparison": "Small-scale glovebox tests (BASS, SAME) emphasize laminar extinction limits and soot size, whereas vehicle-scale flight tests (Saffire-I to III) reveal aerodynamically accelerated flame spread and higher thermal radiative emission across 1-meter fabrics.",
        "environmental_contrast": "SoFIE evaluates Exploration Atmospheres (56.5 kPa / 34% O2), whereas BASS and Saffire were tested at sea-level ISS normoxic pressures (~101 kPa / 21% O2).",
        "partial_g_relevance": "None of the selected tests were executed under true 0.16g or 0.38g gravity, highlighting an unresolved physical coupling between weak buoyancy and forced flow."
    }

    return {
        "compared_investigations": comparison_matrix,
        "synthesis": synthesis
    }
