from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ServiceRequestBase(BaseModel):
    customer_id: int
    service_id: int
    employee_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    priority: str = "MEDIUM" # LOW, MEDIUM, HIGH, URGENT

class ServiceRequestCreate(ServiceRequestBase):
    pass

class ServiceRequestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    customer_id: Optional[int] = None
    service_id: Optional[int] = None
    employee_id: Optional[int] = None
    priority: Optional[str] = None
    status: Optional[str] = None # PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED

class CustomerNested(BaseModel):
    id: int
    name: str
    email: str
    phone: str

    class Config:
        from_attributes = True

class ServiceNested(BaseModel):
    id: int
    name: str
    price: float
    duration: int

    class Config:
        from_attributes = True

class EmployeeNested(BaseModel):
    id: int
    employee_code: str
    name: str

    class Config:
        from_attributes = True

class ServiceRequestResponse(BaseModel):
    id: int
    customer_id: int
    service_id: int
    employee_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    created_at: datetime
    updated_at: datetime
    
    customer: Optional[CustomerNested] = None
    service: Optional[ServiceNested] = None
    employee: Optional[EmployeeNested] = None

    class Config:
        from_attributes = True
