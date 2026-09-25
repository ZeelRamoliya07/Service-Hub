from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.database.database import get_db
from app.models.service_request import ServiceRequest
from app.models.customer import Customer
from app.models.service import Service
from app.models.employee import Employee
from app.models.user import User
from app.schemas.service_request import (
    ServiceRequestCreate, ServiceRequestUpdate, ServiceRequestResponse,
    CustomerNested, ServiceNested, EmployeeNested
)
from app.api.deps import get_current_user, get_current_admin

router = APIRouter(prefix="/requests", tags=["Service Requests"])

def format_request(req: ServiceRequest) -> ServiceRequestResponse:
    customer_data = None
    if req.customer:
        customer_data = CustomerNested(
            id=req.customer.id,
            name=req.customer.name,
            email=req.customer.email,
            phone=req.customer.phone
        )
    service_data = None
    if req.service:
        service_data = ServiceNested(
            id=req.service.id,
            name=req.service.name,
            price=req.service.price,
            duration=req.service.duration
        )
    employee_data = None
    if req.employee:
        employee_data = EmployeeNested(
            id=req.employee.id,
            employee_code=req.employee.employee_code,
            name=req.employee.user.name if req.employee.user else "Employee"
        )
    
    return ServiceRequestResponse(
        id=req.id,
        customer_id=req.customer_id,
        service_id=req.service_id,
        employee_id=req.employee_id,
        title=req.title,
        description=req.description,
        status=req.status,
        priority=req.priority,
        created_at=req.created_at,
        updated_at=req.updated_at,
        customer=customer_data,
        service=service_data,
        employee=employee_data
    )

VALID_STATUSES = ["PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]
VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"]

@router.get("", response_model=List[ServiceRequestResponse])
def list_requests(
    search: Optional[str] = Query(None, description="Search by title or customer name"),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    employee_id: Optional[int] = Query(None),
    customer_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ServiceRequest).join(Customer)
    
    if current_user.role == "EMPLOYEE" and current_user.employee_profile:
        # Employees can view all or filter, but default view includes assigned or open
        pass

    if search:
        term = f"%{search}%"
        query = query.filter(
            (ServiceRequest.title.ilike(term)) |
            (Customer.name.ilike(term))
        )
    if status:
        query = query.filter(ServiceRequest.status == status.upper())
    if priority:
        query = query.filter(ServiceRequest.priority == priority.upper())
    if employee_id:
        query = query.filter(ServiceRequest.employee_id == employee_id)
    if customer_id:
        query = query.filter(ServiceRequest.customer_id == customer_id)

    requests = query.order_by(ServiceRequest.created_at.desc()).all()
    return [format_request(r) for r in requests]

@router.get("/{request_id}", response_model=ServiceRequestResponse)
def get_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service Request not found")
    return format_request(req)

@router.post("", response_model=ServiceRequestResponse, status_code=status.HTTP_201_CREATED)
def create_request(
    req_in: ServiceRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customer = db.query(Customer).filter(Customer.id == req_in.customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid customer_id")
        
    service = db.query(Service).filter(Service.id == req_in.service_id).first()
    if not service:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid service_id")

    employee_id = req_in.employee_id
    init_status = "PENDING"
    if employee_id:
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if not employee:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid employee_id")
        init_status = "ASSIGNED"

    priority = req_in.priority.upper() if req_in.priority else "MEDIUM"
    if priority not in VALID_PRIORITIES:
        priority = "MEDIUM"

    req = ServiceRequest(
        customer_id=req_in.customer_id,
        service_id=req_in.service_id,
        employee_id=employee_id,
        title=req_in.title,
        description=req_in.description,
        status=init_status,
        priority=priority
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return format_request(req)

@router.put("/{request_id}", response_model=ServiceRequestResponse)
def update_request(
    request_id: int,
    req_in: ServiceRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service Request not found")
    
    # Employee permission check: Employees can update status/notes of their assigned request or assign themselves
    if current_user.role == "EMPLOYEE":
        emp_id = current_user.employee_profile.id if current_user.employee_profile else None
        if req.employee_id and req.employee_id != emp_id and req_in.employee_id != emp_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Employees can only update service requests assigned to them"
            )

    update_data = req_in.model_dump(exclude_unset=True)

    # Assignment logic
    if "employee_id" in update_data:
        new_emp_id = update_data["employee_id"]
        if new_emp_id is not None:
            emp = db.query(Employee).filter(Employee.id == new_emp_id).first()
            if not emp:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid employee_id")
            if req.status == "PENDING":
                req.status = "ASSIGNED"
        req.employee_id = new_emp_id

    # Status transition logic & enforcement
    if "status" in update_data:
        new_status = update_data["status"].upper()
        if new_status not in VALID_STATUSES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid status. Must be one of {VALID_STATUSES}")
        
        current_status = req.status
        if current_status == "CANCELLED" and new_status != "CANCELLED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cancelled requests cannot resume lifecycle"
            )
        if new_status == "COMPLETED" and current_status not in ["IN_PROGRESS", "ASSIGNED"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Service request must be IN_PROGRESS or ASSIGNED before it can be marked COMPLETED"
            )
        req.status = new_status

    if "priority" in update_data and update_data["priority"]:
        p = update_data["priority"].upper()
        if p in VALID_PRIORITIES:
            req.priority = p

    if "title" in update_data and update_data["title"]:
        req.title = update_data["title"]
    if "description" in update_data:
        req.description = update_data["description"]
    if "customer_id" in update_data and update_data["customer_id"]:
        req.customer_id = update_data["customer_id"]
    if "service_id" in update_data and update_data["service_id"]:
        req.service_id = update_data["service_id"]

    req.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(req)
    return format_request(req)

@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    req = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service Request not found")
    
    db.delete(req)
    db.commit()
    return None
