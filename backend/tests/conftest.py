import pytest
import os
import sys
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.database import Base, get_db
from app.main import app
from app.core.security import get_password_hash
from app.models.user import User
from app.models.employee import Employee
from app.models.customer import Customer
from app.models.service import Service

# Use SQLite for fast isolated test execution
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_servicehub.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture(scope="function")
def client(db):
    def _override_get_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture
def admin_user(db):
    user = User(
        name="Admin Test",
        email="admin@test.com",
        password_hash=get_password_hash("adminpass123"),
        role="ADMIN"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    emp = Employee(
        user_id=user.id,
        employee_code="EMP-TEST-01",
        department="Executive",
        position="Manager"
    )
    db.add(emp)
    db.commit()
    return user

@pytest.fixture
def employee_user(db):
    user = User(
        name="Employee Test",
        email="employee@test.com",
        password_hash=get_password_hash("employeepass123"),
        role="EMPLOYEE"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    emp = Employee(
        user_id=user.id,
        employee_code="EMP-TEST-02",
        department="Operations",
        position="Specialist"
    )
    db.add(emp)
    db.commit()
    return user

@pytest.fixture
def admin_headers(client, admin_user):
    res = client.post("/api/auth/login", json={"email": "admin@test.com", "password": "adminpass123"})
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def employee_headers(client, employee_user):
    res = client.post("/api/auth/login", json={"email": "employee@test.com", "password": "employeepass123"})
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
