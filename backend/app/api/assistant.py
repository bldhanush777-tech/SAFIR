from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ChatQueryRequest, ScientificRAGCardResponse
from app.ingestion.rag_engine import RAGEngine

router = APIRouter(prefix="/assistant", tags=["assistant"])

rag_engine = RAGEngine()

@router.post("/chat", response_model=ScientificRAGCardResponse)
def ask_assistant(
    request: ChatQueryRequest,
    db: Session = Depends(get_db)
):
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    response = rag_engine.answer_query(
        db=db,
        query=request.query,
        investigation_filter=request.investigation_filter
    )
    return response

@router.get("/suggested-queries")
def get_suggested_queries():
    return [
        {
            "query": "What is the flame spread rate of PMMA in microgravity compared to Cotton-Fiberglass SIBAL?",
            "category": "Flame Spread",
            "tag": "Saffire vs BASS"
        },
        {
            "query": "How does low-temperature cool flame combustion behave in droplet extinguishment?",
            "category": "Suppression",
            "tag": "FLEX-2 Discovery"
        },
        {
            "query": "Why does microgravity smoke particle size differ from terrestrial smoke detector calibrations?",
            "category": "Detection",
            "tag": "SAME Aerosol Dynamics"
        },
        {
            "query": "What are the flammability limits of thick solid fuels in NASA Exploration Atmospheres (56.5 kPa, 34% O2)?",
            "category": "Exploration Atmospheres",
            "tag": "SoFIE Science"
        },
        {
            "query": "How does the lack of buoyant convection in partial-gravity (0.16g Moon, 0.38g Mars) alter flame extinction limits?",
            "category": "Physics Gap",
            "tag": "Partial-G Peak Hazard"
        }
    ]
