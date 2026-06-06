import logging
from datetime import datetime, timedelta, timezone

import httpx
from sqlalchemy.orm import Session

from ..config import settings
from ..database import SessionLocal
from ..models import Connector, Station

logger = logging.getLogger(__name__)

CONNECTOR_TYPE_MAP = {
    1: "Type 1 (J1772)",
    2: "Type 2 (Mennekes)",
    3: "CCS (Type 1)",
    4: "CCS (Type 2)",
    5: "CHAdeMO",
    6: "Tesla (Roadster)",
    7: "Tesla (Supercharger)",
    8: "Tesla (Destination)",
    9: "Wall Outlet",
    10: "Three Phase",
    25: "Type 2 (Tethered)",
    27: "CCS",
    28: "Type 2 (Socket)",
    32: "CCS (Type 2)",
    33: "CHAdeMO",
    103: "CCS",
    104: "Type 2",
}


def normalize_connector_type(ocm_type_id: int) -> str:
    return CONNECTOR_TYPE_MAP.get(ocm_type_id, f"Unknown ({ocm_type_id})")


def _parse_ocm_station(item: dict) -> dict:
    address = item.get("AddressInfo", {})
    connections = item.get("Connections", [])
    operator = item.get("OperatorInfo") or {}
    usage = item.get("UsageType") or {}

    connector_types = set()
    max_power = 0
    connectors_data = []

    for conn in connections:
        ctype_id = None
        if conn.get("ConnectionType"):
            ctype_id = conn["ConnectionType"].get("ID")
        ctype = normalize_connector_type(ctype_id) if ctype_id else "Unknown"
        power = conn.get("PowerKW")
        if power and power > max_power:
            max_power = power
        connector_types.add(ctype)
        connectors_data.append(
            {
                "type": ctype,
                "power_kw": power,
                "voltage": conn.get("Voltage"),
                "amperage": conn.get("Amps"),
                "quantity": conn.get("Quantity", 1),
            }
        )

    cost = item.get("UsageCost")
    if cost and isinstance(cost, str):
        cost = cost.strip()

    return {
        "ocm_id": item.get("ID"),
        "name": address.get("Title") or "Unknown",
        "address": address.get("AddressLine1"),
        "suburb": address.get("Town"),
        "state": address.get("StateOrProvince"),
        "postcode": address.get("Postcode"),
        "country": address.get("Country", {}).get("Title") if isinstance(address.get("Country"), dict) else "Australia",
        "latitude": address.get("Latitude"),
        "longitude": address.get("Longitude"),
        "operator_name": operator.get("Title"),
        "usage_type": usage.get("Title") if isinstance(usage, dict) else None,
        "usage_cost": cost,
        "is_24hr": 1 if item.get("AccessComments") and "24" in str(item.get("AccessComments", "")) else 0,
        "status_type": item.get("StatusType", {}).get("Title") if isinstance(item.get("StatusType"), dict) else None,
        "connectors": connectors_data,
        "connector_types": sorted(connector_types) if connector_types else ["Unknown"],
        "max_power_kw": max_power if max_power else None,
    }


async def fetch_stations_from_ocm(
    latitude: float | None = None,
    longitude: float | None = None,
    distance_km: int = 50,
    max_results: int = 500,
    country_code: str = "AU",
) -> list[dict]:
    params = {
        "maxresults": max_results,
        "countrycode": country_code,
        "includecomments": 0,
    }
    if latitude is not None and longitude is not None:
        params["latitude"] = latitude
        params["longitude"] = longitude
        params["distance"] = distance_km

    if settings.ocm_api_key:
        params["key"] = settings.ocm_api_key

    headers = {}
    if not settings.ocm_api_key:
        headers["X-API-Key"] = "Public"

    logger.info("Fetching from OCM: %s", params)
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(
            f"{settings.ocm_base_url}/poi",
            params=params,
            headers=headers,
        )
        resp.raise_for_status()
        data = resp.json()

    stations = []
    for item in data:
        try:
            parsed = _parse_ocm_station(item)
            if parsed["latitude"] and parsed["longitude"]:
                stations.append(parsed)
        except Exception as e:
            logger.warning("Failed to parse station %s: %s", item.get("ID"), e)
            continue

    return stations


def save_stations_to_db(db: Session, stations: list[dict]) -> int:
    count = 0
    for s in stations:
        existing = db.query(Station).filter(Station.ocm_id == s["ocm_id"]).first()
        connectors_data = s.pop("connectors", [])
        s.pop("connector_types", None)
        s.pop("max_power_kw", None)
        if existing:
            for key, val in s.items():
                if key != "ocm_id":
                    setattr(existing, key, val)
            db.flush()
            station = existing
        else:
            station = Station(**s)
            db.add(station)
            db.flush()

        db.query(Connector).filter(Connector.station_id == station.id).delete()
        for c in connectors_data:
            db.add(Connector(station_id=station.id, **c))

        count += 1

    db.commit()
    return count


def get_stations_near(db: Session, lat: float, lng: float, radius_km: float = 50) -> list[Station]:
    rough_deg = radius_km / 111.0
    return (
        db.query(Station)
        .filter(
            Station.latitude.between(lat - rough_deg, lat + rough_deg),
            Station.longitude.between(lng - rough_deg, lng + rough_deg),
        )
        .limit(200)
        .all()
    )
