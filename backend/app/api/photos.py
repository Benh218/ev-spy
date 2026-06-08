import logging
import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Station, StationPhoto
from ..schemas import StationPhotoSchema

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/photos", tags=["photos"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE = 10 * 1024 * 1024


@router.post("/upload/{station_id}")
async def upload_photo(
    station_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, and WebP allowed")

    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"

    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    filepath = UPLOAD_DIR / filename
    with open(filepath, "wb") as f:
        f.write(contents)

    photo = StationPhoto(station_id=station_id, filename=filename)
    db.add(photo)
    db.commit()
    db.refresh(photo)

    return StationPhotoSchema(
        id=photo.id,
        filename=photo.filename,
        url=f"/uploads/{photo.filename}",
        uploaded_at=photo.uploaded_at,
    )


@router.get("/station/{station_id}")
def list_photos(station_id: int, db: Session = Depends(get_db)):
    photos = (
        db.query(StationPhoto)
        .filter(StationPhoto.station_id == station_id)
        .order_by(StationPhoto.uploaded_at.desc())
        .all()
    )
    return [
        StationPhotoSchema(
            id=p.id,
            filename=p.filename,
            url=f"/uploads/{p.filename}",
            uploaded_at=p.uploaded_at,
        )
        for p in photos
    ]
