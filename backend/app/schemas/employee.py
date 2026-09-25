from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class EmployeeBase(BaseModel):
    department: str
    position: str

class EmployeeCreate(EmployeeBase):
    name: str
    email: EmailStr
    password: str
    employee_code: Optional[str] = None
    role: Optional[str] = "EMPLOYEE"

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    employee_code: Optional[str] = None
    role: Optional[str] = None

class EmployeeResponse(EmployeeBase):
    id: int
    user_id: int
    employee_code: str
    name: str
    email: EmailStr
    role: str
    created_at: datetime
    active_requests_count: Optional[int] = 0

    class Config:
        from_attributes = True
