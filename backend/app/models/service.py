from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.database import Base

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    duration = Column(Integer, nullable=False) # In minutes
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    service_requests = relationship("ServiceRequest", back_populates="service")
    appointments = relationship("Appointment", back_populates="service")
