import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from .config import settings
from .database import Base, SessionLocal, engine, get_db
from .models import Connector, Station, StationPhoto  # noqa: F401

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created")

    db = SessionLocal()
    try:
        if db.query(Station).count() == 0:
            from .services.mock_data import seed_stations
            count = seed_stations(db)
            logger.info("Auto-seeded %d mock stations", count)
    finally:
        db.close()

    yield


app = FastAPI(
    title="ChargeSpot API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from .api import photos, reports, stations  # noqa: E402
from .services.mock_data import seed_stations  # noqa: E402

uploads_dir = Path(__file__).resolve().parent.parent / "uploads"
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

app.include_router(stations.router)
app.include_router(reports.router)
app.include_router(photos.router)


@app.post("/api/seed")
def seed_db(force: bool = False, db: Session = Depends(get_db)):
    count = seed_stations(db, force=force)
    if count == 0 and not force:
        return {"message": "Stations already seeded", "count": 0}
    return {"message": f"Seeded {count} mock stations", "count": count}


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "0.1.0"}
