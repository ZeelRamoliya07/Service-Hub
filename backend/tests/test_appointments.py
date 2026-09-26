from datetime import datetime

from app.models.customer import Customer
from app.models.service import Service
from app.models.employee import Employee


def test_employee_can_create_appointment(
    client,
    db,
    employee_headers,
    employee_user
):
    customer = Customer(
        name="Appointment Customer",
        email="appointment@test.com",
        phone="123456789"
    )
    service = Service(
        name="Appointment Service",
        description="Service for appointment testing",
        price=500.0,
        duration=60
    )

    db.add_all([customer, service])
    db.commit()
    db.refresh(customer)
    db.refresh(service)

    employee = db.query(Employee).filter(
        Employee.user_id == employee_user.id
    ).first()

    res = client.post("/api/appointments", headers=employee_headers, json={
        "customer_id": customer.id,
        "service_id": service.id,
        "employee_id": employee.id,
        "appointment_date": "2026-10-05T10:00:00",
        "notes": "Automated test appointment",
        "status": "SCHEDULED"
    })

    assert res.status_code == 201

    data = res.json()
    assert data["customer_id"] == customer.id
    assert data["service_id"] == service.id
    assert data["employee_id"] == employee.id
    assert data["status"] == "SCHEDULED"


def test_authenticated_user_can_get_appointment(
    client,
    db,
    employee_headers,
    employee_user
):
    customer = Customer(
        name="Get Appointment Customer",
        email="getappointment@test.com",
        phone="123456789"
    )
    service = Service(
        name="Get Appointment Service",
        description="Service for retrieval testing",
        price=600.0,
        duration=60
    )

    db.add_all([customer, service])
    db.commit()
    db.refresh(customer)
    db.refresh(service)

    employee = db.query(Employee).filter(
        Employee.user_id == employee_user.id
    ).first()

    create_res = client.post("/api/appointments", headers=employee_headers, json={
        "customer_id": customer.id,
        "service_id": service.id,
        "employee_id": employee.id,
        "appointment_date": "2026-10-06T11:00:00",
        "notes": "Appointment retrieval test",
        "status": "SCHEDULED"
    })

    assert create_res.status_code == 201
    appointment_id = create_res.json()["id"]

    get_res = client.get(
        f"/api/appointments/{appointment_id}",
        headers=employee_headers
    )

    assert get_res.status_code == 200
    assert get_res.json()["id"] == appointment_id


def test_admin_can_delete_appointment(
    client,
    db,
    admin_headers
):
    customer = Customer(
        name="Delete Appointment Customer",
        email="deleteappointment@test.com",
        phone="123456789"
    )
    service = Service(
        name="Delete Appointment Service",
        description="Service for deletion testing",
        price=700.0,
        duration=60
    )

    db.add_all([customer, service])
    db.commit()
    db.refresh(customer)
    db.refresh(service)

    create_res = client.post("/api/appointments", headers=admin_headers, json={
        "customer_id": customer.id,
        "service_id": service.id,
        "appointment_date": "2026-10-07T12:00:00",
        "notes": "Appointment deletion test",
        "status": "SCHEDULED"
    })

    assert create_res.status_code == 201
    appointment_id = create_res.json()["id"]

    delete_res = client.delete(
        f"/api/appointments/{appointment_id}",
        headers=admin_headers
    )

    assert delete_res.status_code == 204

    get_res = client.get(
        f"/api/appointments/{appointment_id}",
        headers=admin_headers
    )

    assert get_res.status_code == 404


def test_unauthorized_user_cannot_access_appointments(client):
    res = client.get("/api/appointments")

    assert res.status_code == 401
