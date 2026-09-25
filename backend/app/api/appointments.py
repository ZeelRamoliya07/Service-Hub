from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.database import get_db
from app.models.appointment import Appointment
from app.models.customer import Customer
from app.models.service import Service
from app.models.employee import Employee
from app.models.user import User
from app.schemas.appointment import (
    AppointmentCreate, AppointmentUpdate, AppointmentResponse
)
from app.schemas.service_request import CustomerNested, ServiceNested, EmployeeNested
from app.api.deps import get_current_user, get_current_admin

router = APIRouter(prefix="/appointments", tags=["Appointments"])

def format_appointment(app: Appointment) -> AppointmentResponse:
    customer_data = CustomerNested(
        id=app.customer.id, name=app.customer.name, email=app.customer.email, phone=app.customer.phone
    ) if app.customer else None
    service_data = ServiceNested(
        id=app.service.id, name=app.service.name, price=app.service.price, duration=app.service.duration
    ) if app.service else None
    employee_data = EmployeeNested(
        id=app.employee.id, employee_code=app.employee.employee_code,
        name=app.employee.user.name if app.employee.user else "Employee"
    ) if app.employee else None

    return AppointmentResponse(
        id=app.id,
        customer_id=app.customer_id,
        service_id=app.service_id,
        employee_id=app.employee_id,
        appointment_date=app.appointment_date,
        status=app.status,
        notes=app.notes,
        created_at=app.created_at,
        customer=customer_data,
        service=service_data,
        employee=employee_data
    )

VALID_APP_STATUSES = ["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED"]

@router.get("", response_model=List[AppointmentResponse])
def list_appointments(
    status: Optional[str] = Query(None),
    employee_id: Optional[int] = Query(None),
    customer_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Appointment)
    if status:
        query = query.filter(Appointment.status == status.upper())
    if employee_id:
        query = query.filter(Appointment.employee_id == employee_id)
    if customer_id:
        query = query.filter(Appointment.customer_id == customer_id)

    appointments = query.order_by(Appointment.appointment_date.asc()).all()
    return [format_appointment(a) for a in appointments]

@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return format_appointment(app)

@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(
    app_in: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cust = db.query(Customer).filter(Customer.id == app_in.customer_id).first()
    if not cust:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid customer_id")
    
    svc = db.query(Service).filter(Service.id == app_in.service_id).first()
    if not svc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid service_id")

    if app_in.employee_id:
        emp = db.query(Employee).filter(Employee.id == app_in.employee_id).first()
        if not emp:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid employee_id")

    status_val = app_in.status.upper() if app_in.status else "SCHEDULED"
    if status_val not in VALID_APP_STATUSES:
        status_val = "SCHEDULED"

    app = Appointment(
        customer_id=app_in.customer_id,
        service_id=app_in.service_id,
        employee_id=app_in.employee_id,
        appointment_date=app_in.appointment_date,
        notes=app_in.notes,
        status=status_val
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return format_appointment(app)

@router.put("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: int,
    app_in: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    update_data = app_in.model_dump(exclude_unset=True)
    
    if "status" in update_data and update_data["status"]:
        s = update_data["status"].upper()
        if s in VALID_APP_STATUSES:
            app.status = s
    if "appointment_date" in update_data and update_data["appointment_date"]:
        app.appointment_date = update_data["appointment_date"]
    if "notes" in update_data:
        app.notes = update_data["notes"]
    if "employee_id" in update_data:
        app.employee_id = update_data["employee_id"]

    db.commit()
    db.refresh(app)
    return format_appointment(app)

@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    app = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    
    db.delete(app)
    db.commit()
    return None
