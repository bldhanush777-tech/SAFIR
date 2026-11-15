from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.database import init_db
from app.ingestion.seed_data import seed_database
from app.api.investigations import router as investigations_router
from app.api.experiments import router as experiments_router
from app.api.assistant import router as assistant_router
from app.api.habitats import router as habitats_router
from app.api.gaps import router as gaps_router
from app.api.visualizations import router as visualizations_router
from app.api.earth_apps import router as earth_apps_router
from app.api.sources import router as sources_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("firesafe.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing NASA FireSafe AI database...")
    init_db()
    seed_database(force_reseed=False)
    logger.info("NASA FireSafe AI platform online.")
    yield
    logger.info("Shutting down NASA FireSafe AI platform.")

app = FastAPI(
    title="NASA FireSafe AI",
    description="Microgravity & Partial-Gravity Combustion Intelligence Platform",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development and container networking
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers under /api/v1
app.include_router(investigations_router, prefix=settings.API_V1_STR)
app.include_router(experiments_router, prefix=settings.API_V1_STR)
app.include_router(assistant_router, prefix=settings.API_V1_STR)
app.include_router(habitats_router, prefix=settings.API_V1_STR)
app.include_router(gaps_router, prefix=settings.API_V1_STR)
app.include_router(visualizations_router, prefix=settings.API_V1_STR)
app.include_router(earth_apps_router, prefix=settings.API_V1_STR)
app.include_router(sources_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "platform": "NASA FireSafe AI",
        "description": "Microgravity & Partial-Gravity Combustion Intelligence Platform",
        "version": settings.VERSION,
        "telemetry_status": "NOMINAL",
        "verified_regimes": ["0g Microgravity", "0.16g Lunar", "0.38g Martian", "1g Terrestrial"],
        "api_docs": "/docs",
        "api_v1": settings.API_V1_STR
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "rag_engine": "active"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
