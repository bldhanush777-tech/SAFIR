from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import ResearchGap
from app.schemas import ResearchGapResponse

router = APIRouter(prefix="/gaps", tags=["research-gaps"])

@router.get("", response_model=List[ResearchGapResponse])
def get_research_gaps(db: Session = Depends(get_db)):
    return db.query(ResearchGap).all()

@router.get("/radar")
def get_radar_scan_data(db: Session = Depends(get_db)):
    """Provides coordinates, angles, and telemetry for the concentric-ring animated SVG radar visual."""
    gaps = db.query(ResearchGap).all()

    blips = [
        {
            "id": 1,
            "label": "Lunar 0.16g Flammability",
            "angle_deg": 45,
            "distance_pct": 78,
            "severity": "Critical",
            "gravity": "0.16g",
            "status": "UNMAPPED",
            "details": "Opposed flow flame spread rate across SIBAL at 0.16g has never been measured in flight."
        },
        {
            "id": 2,
            "label": "Martian 0.38g Weak Convection",
            "angle_deg": 130,
            "distance_pct": 65,
            "severity": "Critical",
            "gravity": "0.38g",
            "status": "UNMAPPED",
            "details": "Weak buoyant plume retention maximizes flame spread beyond microgravity and terrestrial limits."
        },
        {
            "id": 3,
            "label": "Hypobaric 56.5 kPa Extinction",
            "angle_deg": 215,
            "distance_pct": 52,
            "severity": "High",
            "gravity": "0g - 0.16g",
            "status": "PARTIALLY MAPPED (SoFIE)",
            "details": "SoFIE active tests providing initial baseline, full material matrix incomplete."
        },
        {
            "id": 4,
            "label": "Supermicron Smoke Coagulation",
            "angle_deg": 310,
            "distance_pct": 85,
            "severity": "Critical",
            "gravity": "0g",
            "status": "DETECTED IN SAME",
            "details": "Terrestrial smoke detectors blind to microgravity particles > 2.0 um."
        },
        {
            "id": 5,
            "label": "Cool Flame Secondary Ignition",
            "angle_deg": 280,
            "distance_pct": 42,
            "severity": "Moderate",
            "gravity": "0g",
            "status": "VERIFIED (FLEX)",
            "details": "CO2/N2 suppression leaves invisible 500K reaction zone prone to re-ignition upon repressurization."
        }
    ]

    return {
        "radar_sweep_speed_rpm": 6,
        "concentric_rings": [
            {"label": "Terrestrial Standard (1g)", "radius_pct": 25},
            {"label": "Hypobaric Exploration (56.5 kPa)", "radius_pct": 50},
            {"label": "Partial-G Peak Hazard (0.16g - 0.38g)", "radius_pct": 75},
            {"label": "Deep Space / Unmapped Regimes", "radius_pct": 100}
        ],
        "blips": blips,
        "critical_gaps_count": sum(1 for b in blips if b["severity"] == "Critical"),
        "total_gaps_tracked": len(blips)
    }
