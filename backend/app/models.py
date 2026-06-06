from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .database import Base


class Station(Base):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ocm_id = Column(Integer, unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    address = Column(String(500))
    suburb = Column(String(100))
    state = Column(String(50))
    postcode = Column(String(20))
    country = Column(String(50), default="Australia")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    operator_name = Column(String(255))
    usage_type = Column(String(50))
    usage_cost = Column(String(255))
    is_24hr = Column(Integer, default=1)
    status_type = Column(String(50))
    date_created = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    date_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    connectors = relationship("Connector", back_populates="station", cascade="all, delete-orphan")


class Connector(Base):
    __tablename__ = "connectors"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    station_id = Column(Integer, ForeignKey("stations.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False)
    power_kw = Column(Float)
    voltage = Column(Integer)
    amperage = Column(Integer)
    quantity = Column(Integer, default=1)

    station = relationship("Station", back_populates="connectors")


class UserReport(Base):
    __tablename__ = "user_reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    station_id = Column(Integer, ForeignKey("stations.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(20), nullable=False)
    comment = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
