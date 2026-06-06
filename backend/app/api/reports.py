from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Station, UserReport
from ..schemas import UserReportCreate, UserReportSchema

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.post("", response_model=UserReportSchema)
def create_report(report: UserReportCreate, db: Session = Depends(get_db)):
    station = db.query(Station).filter(Station.id == report.station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    valid_statuses = {"working", "broken", "in_use", "blocked", "unavailable"}
    if report.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Status must be one of: {', '.join(sorted(valid_statuses))}",
        )

    db_report = UserReport(
        station_id=report.station_id,
        status=report.status,
        comment=report.comment,
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report


@router.get("/station/{station_id}")
def get_station_reports(station_id: int, db: Session = Depends(get_db)):
    reports = (
        db.query(UserReport)
        .filter(UserReport.station_id == station_id)
        .order_by(UserReport.created_at.desc())
        .limit(50)
        .all()
    )
    return [UserReportSchema.model_validate(r) for r in reports]
