from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ConnectorSchema(BaseModel):
    id: int
    type: str
    power_kw: Optional[float] = None
    voltage: Optional[int] = None
    amperage: Optional[int] = None
    quantity: int = 1

    model_config = {"from_attributes": True}


class StationPhotoSchema(BaseModel):
    id: int
    filename: str
    url: str
    uploaded_at: datetime

    model_config = {"from_attributes": True}


class StationSchema(BaseModel):
    id: int
    ocm_id: int
    name: str
    address: Optional[str] = None
    suburb: Optional[str] = None
    state: Optional[str] = None
    postcode: Optional[str] = None
    country: Optional[str] = None
    latitude: float
    longitude: float
    operator_name: Optional[str] = None
    usage_type: Optional[str] = None
    usage_cost: Optional[str] = None
    is_24hr: Optional[bool] = None
    status_type: Optional[str] = None
    connectors: list[ConnectorSchema] = []
    latest_reports: list["UserReportSchema"] = []
    photos: list[StationPhotoSchema] = []

    model_config = {"from_attributes": True}


class StationListItem(BaseModel):
    id: int
    ocm_id: int
    name: str
    address: Optional[str] = None
    latitude: float
    longitude: float
    operator_name: Optional[str] = None
    connector_types: list[str] = []
    max_power_kw: Optional[float] = None
    status_type: Optional[str] = None
    latest_status: Optional[str] = None

    model_config = {"from_attributes": True}


class StationPhotoCreate(BaseModel):
    station_id: int


class UserReportSchema(BaseModel):
    id: int
    station_id: int
    status: str
    comment: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserReportCreate(BaseModel):
    station_id: int
    status: str
    comment: Optional[str] = None


class StationSearchParams(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None
    radius_km: float = 50
    q: Optional[str] = None
    connector_type: Optional[str] = None
    min_power_kw: Optional[float] = None
    operator: Optional[str] = None
    limit: int = 100
    offset: int = 0
