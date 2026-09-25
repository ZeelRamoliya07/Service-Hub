from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.database import get_db
from app.models.employee import Employee
from app.models.user import User
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeResponse
from app.core.security import get_password_hash
from app.api.deps import get_current_user, get_current_admin

router = APIRouter(prefix="/employees", tags=["Employees"])

def format_employee(employee: Employee) -> EmployeeResponse:
    active_requests = [r for r in (employee.service_requests or []) if r.status in ["ASSIGNED", "IN_PROGRESS"]]
    return EmployeeResponse(
        id=employee.id,
        user_id=employee.user_id,
        employee_code=employee.employee_code,
        name=employee.user.name if employee.user else "Unknown",
        email=employee.user.email if employee.user else "Unknown",
        role=employee.user.role if employee.user else "EMPLOYEE",
        department=employee.department,
        position=employee.position,
        created_at=employee.created_at,
        active_requests_count=len(active_requests)
    )

@router.get("", response_model=List[EmployeeResponse])
def list_employees(
    search: Optional[str] = Query(None, description="Search by name, email, or code"),
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Employee).join(User)
    if search:
        term = f"%{search}%"
        query = query.filter(
            (User.name.ilike(term)) |
            (User.email.ilike(term)) |
            (Employee.employee_code.ilike(term))
        )
    if department:
        query = query.filter(Employee.department == department)
        
    employees = query.order_by(Employee.created_at.desc()).all()
    return [format_employee(e) for e in employees]

@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return format_employee(employee)

@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    emp_in: EmployeeCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    existing_user = db.query(User).filter(User.email == emp_in.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        
    role = emp_in.role.upper() if emp_in.role else "EMPLOYEE"
    user = User(
        name=emp_in.name,
        email=emp_in.email,
        password_hash=get_password_hash(emp_in.password),
        role=role
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    code = emp_in.employee_code or f"EMP-{user.id:04d}"
    employee = Employee(
        user_id=user.id,
        employee_code=code,
        department=emp_in.department,
        position=emp_in.position
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)

    return format_employee(employee)

@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: int,
    emp_in: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
        
    if emp_in.department:
        employee.department = emp_in.department
    if emp_in.position:
        employee.position = emp_in.position
    if emp_in.employee_code:
        employee.employee_code = emp_in.employee_code

    if emp_in.name:
        employee.user.name = emp_in.name
    if emp_in.role:
        employee.user.role = emp_in.role.upper()

    db.commit()
    db.refresh(employee)
    return format_employee(employee)

@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    
    # Deleting user will cascade delete employee profile
    user = employee.user
    db.delete(user)
    db.commit()
    return None
