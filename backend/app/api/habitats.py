from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.database import get_db
from app.models import Investigation, ExperimentalRun, HabitatRanking
from app.schemas import HabitatRankingResponse, HabitatWeightConfig
from app.ingestion.seed_data import TARGET_HABITATS, calculate_habitat_score

router = APIRouter(prefix="/habitats", tags=["habitats"])

@router.get("/target-habitats")
def get_target_habitats():
    return TARGET_HABITATS

@router.get("/rankings", response_model=List[HabitatRankingResponse])
def get_rankings(
    habitat: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(HabitatRanking)
    if habitat and habitat != "All":
        query = query.filter(HabitatRanking.target_habitat.ilike(f"%{habitat}%"))

    rankings = query.order_by(HabitatRanking.relevance_score.desc()).all()
    results = []
    for r in rankings:
        inv = db.query(Investigation).filter(Investigation.id == r.investigation_id).first()
        results.append({
            "id": r.id,
            "investigation_id": r.investigation_id,
            "investigation_code": inv.code if inv else "Unknown",
            "investigation_title": inv.title if inv else "Unknown",
            "target_habitat": r.target_habitat,
            "relevance_score": r.relevance_score,
            "scoring_breakdown_json": r.scoring_breakdown_json,
            "justification": r.justification,
            "is_ai_estimated": r.is_ai_estimated
        })
    return results

@router.post("/recalculate")
def recalculate_rankings(
    config: HabitatWeightConfig,
    db: Session = Depends(get_db)
):
    # Verify weights sum roughly to 1.0
    total_w = config.weight_atmospheric + config.weight_gravity + config.weight_material + config.weight_scale
    if total_w <= 0:
        raise HTTPException(status_code=400, detail="Weights must sum to greater than 0.")

    # Normalize weights
    norm_weights = {
        "weight_atmospheric": config.weight_atmospheric / total_w,
        "weight_gravity": config.weight_gravity / total_w,
        "weight_material": config.weight_material / total_w,
        "weight_scale": config.weight_scale / total_w
    }

    # Find target habitat metadata
    target_hab = next((h for h in TARGET_HABITATS if config.target_habitat.lower() in h["name"].lower()), None)
    if not target_hab:
        target_hab = {
            "name": config.target_habitat,
            "pressure_kpa": 56.5,
            "oxygen_pct": 34.0,
            "gravity_g": 0.16,
            "type": "Custom Target Habitat"
        }

    investigations = db.query(Investigation).all()
    recalculated = []

    for inv in investigations:
        runs = db.query(ExperimentalRun).filter(ExperimentalRun.investigation_id == inv.id).all()
        result = calculate_habitat_score(inv, runs, target_hab, weights=norm_weights)

        recalculated.append({
            "investigation_id": inv.id,
            "investigation_code": inv.code,
            "investigation_title": inv.title,
            "category": inv.category,
            "facility": inv.facility,
            "target_habitat": target_hab["name"],
            "relevance_score": result["score"],
            "scoring_breakdown_json": result["breakdown"],
            "justification": result["justification"],
            "is_ai_estimated": False
        })

    recalculated.sort(key=lambda x: x["relevance_score"], reverse=True)
    return {
        "target_habitat": target_hab,
        "active_weights": norm_weights,
        "rankings": recalculated
    }
