from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="EMPLOYEE") # ADMIN or EMPLOYEE
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    employee_profile = relationship("Employee", back_populates="user", uselist=False, cascade="all, delete-orphan")
