from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User
from app.models.employee import Employee
from app.schemas.auth import UserCreate, UserResponse, Token, UserLogin
from app.core.security import verify_password, get_password_hash, create_access_token
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

def format_user_response(user: User, db: Session) -> UserResponse:
    employee_id = None
    employee_code = None
    department = None
    position = None
    if user.employee_profile:
        employee_id = user.employee_profile.id
        employee_code = user.employee_profile.employee_code
        department = user.employee_profile.department
        position = user.employee_profile.position

    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        created_at=user.created_at,
        employee_id=employee_id,
        employee_code=employee_code,
        department=department,
        position=position
    )

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists"
        )
    
    role = user_in.role.upper() if user_in.role else "EMPLOYEE"
    if role not in ["ADMIN", "EMPLOYEE"]:
        role = "EMPLOYEE"

    user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        role=role
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    if role == "EMPLOYEE" or user_in.employee_code:
        emp_code = user_in.employee_code or f"EMP-{user.id:04d}"
        employee = Employee(
            user_id=user.id,
            employee_code=emp_code,
            department=user_in.department or "General Operations",
            position=user_in.position or "Service Specialist"
        )
        db.add(employee)
        db.commit()
        db.refresh(user)

    return format_user_response(user, db)

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=format_user_response(user, db)
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return format_user_response(current_user, db)
