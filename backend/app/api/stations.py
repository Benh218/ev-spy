import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload, selectinload

from ..database import get_db
from ..models import Connector, Station, StationPhoto, UserReport
from ..schemas import StationListItem, StationPhotoSchema, StationSchema, UserReportSchema
from ..services.ocm_service import (
    fetch_stations_from_ocm,
    get_stations_near,
    save_stations_to_db,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/stations", tags=["stations"])


@router.get("")
async def list_stations(
    lat: float | None = Query(None),
    lng: float | None = Query(None),
    radius_km: float = Query(50, le=500),
    q: str | None = Query(None),
    connector_type: str | None = Query(None),
    min_power_kw: float | None = Query(None),
    operator: str | None = Query(None),
    refresh: bool = Query(False),
    limit: int = Query(100, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
) -> list[StationListItem]:
    latest_status_subq = (
        db.query(UserReport.status)
        .filter(UserReport.station_id == Station.id)
        .order_by(UserReport.created_at.desc())
        .limit(1)
        .correlate(Station)
        .scalar_subquery()
    )

    query = (
        db.query(Station, latest_status_subq.label("latest_status"))
        .options(selectinload(Station.connectors))
        .order_by(Station.name)
    )

    if q:
        q_filter = f"%{q}%"
        query = query.filter(
            Station.name.ilike(q_filter)
            | Station.suburb.ilike(q_filter)
            | Station.state.ilike(q_filter)
            | Station.postcode.ilike(q_filter)
        )

    if lat is not None and lng is not None:
        stations = get_stations_near(db, lat, lng, radius_km)
        station_ids = {s.id for s in stations}
        query = query.filter(Station.id.in_(station_ids))

    if connector_type:
        query = query.filter(Station.connectors.any(Connector.type.ilike(f"%{connector_type}%")))

    if min_power_kw is not None:
        query = query.filter(Station.connectors.any(Connector.power_kw >= min_power_kw))

    if operator:
        query = query.filter(Station.operator_name.ilike(f"%{operator}%"))

    if refresh and lat is not None and lng is not None:
        try:
            import asyncio
            raw = await fetch_stations_from_ocm(lat, lng, int(radius_km))
            save_stations_to_db(db, raw)
        except Exception as e:
            logger.warning("OCM refresh failed: %s", e)

    total = query.count()
    rows = query.offset(offset).limit(limit).all()

    result = []
    for s, latest_status in rows:
        ctypes = list({c.type for c in s.connectors})
        max_power = max((c.power_kw for c in s.connectors if c.power_kw), default=None)
        result.append(
            StationListItem(
                id=s.id,
                ocm_id=s.ocm_id,
                name=s.name,
                address=s.address,
                latitude=s.latitude,
                longitude=s.longitude,
                operator_name=s.operator_name,
                usage_cost=s.usage_cost,
                connector_types=ctypes,
                max_power_kw=max_power,
                status_type=s.status_type,
                latest_status=latest_status,
            )
        )

    return result


@router.get("/{station_id}")
def get_station(
    station_id: int,
    db: Session = Depends(get_db),
) -> StationSchema:
    station = (
        db.query(Station)
        .options(selectinload(Station.connectors), selectinload(Station.photos))
        .filter(Station.id == station_id)
        .first()
    )
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    reports = (
        db.query(UserReport)
        .filter(UserReport.station_id == station_id)
        .order_by(UserReport.created_at.desc())
        .limit(20)
        .all()
    )

    return StationSchema(
        id=station.id,
        ocm_id=station.ocm_id,
        name=station.name,
        address=station.address,
        suburb=station.suburb,
        state=station.state,
        postcode=station.postcode,
        country=station.country,
        latitude=station.latitude,
        longitude=station.longitude,
        operator_name=station.operator_name,
        usage_type=station.usage_type,
        usage_cost=station.usage_cost,
        is_24hr=bool(station.is_24hr),
        status_type=station.status_type,
        connectors=[
            {
                "id": c.id,
                "type": c.type,
                "power_kw": c.power_kw,
                "voltage": c.voltage,
                "amperage": c.amperage,
                "quantity": c.quantity,
            }
            for c in station.connectors
        ],
        latest_reports=[
            UserReportSchema.model_validate(r) for r in reports
        ],
        photos=[
            StationPhotoSchema(
                id=p.id,
                filename=p.filename,
                url=f"/uploads/{p.filename}",
                uploaded_at=p.uploaded_at,
            )
            for p in station.photos
        ],
    )


@router.post("/refresh")
async def refresh_stations(
    lat: float = Query(...),
    lng: float = Query(...),
    radius_km: float = Query(50),
    db: Session = Depends(get_db),
) -> dict:
    raw = await fetch_stations_from_ocm(lat, lng, int(radius_km))
    count = save_stations_to_db(db, raw)
    return {"refreshed": count, "radius_km": radius_km}
