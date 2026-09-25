from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.schemas.service_request import CustomerNested, ServiceNested, EmployeeNested

class AppointmentBase(BaseModel):
    customer_id: int
    service_id: int
    employee_id: Optional[int] = None
    appointment_date: datetime
    notes: Optional[str] = None
    status: Optional[str] = "SCHEDULED"

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    customer_id: Optional[int] = None
    service_id: Optional[int] = None
    employee_id: Optional[int] = None
    appointment_date: Optional[datetime] = None
    status: Optional[str] = None # SCHEDULED, CONFIRMED, COMPLETED, CANCELLED
    notes: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: int
    customer_id: int
    service_id: int
    employee_id: Optional[int] = None
    appointment_date: datetime
    status: str
    notes: Optional[str] = None
    created_at: datetime

    customer: Optional[CustomerNested] = None
    service: Optional[ServiceNested] = None
    employee: Optional[EmployeeNested] = None

    class Config:
        from_attributes = True
