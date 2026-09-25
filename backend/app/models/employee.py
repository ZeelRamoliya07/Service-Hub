from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    employee_code = Column(String(20), unique=True, index=True, nullable=False)
    department = Column(String(50), nullable=False)
    position = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="employee_profile")
    service_requests = relationship("ServiceRequest", back_populates="employee")
    appointments = relationship("Appointment", back_populates="employee")
