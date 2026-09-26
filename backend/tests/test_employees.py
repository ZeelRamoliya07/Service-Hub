def test_admin_can_create_employee(client, admin_headers):
    res = client.post("/api/employees", headers=admin_headers, json={
        "name": "Test Employee",
        "email": "new.employee@test.com",
        "password": "testpass123",
        "department": "Operations",
        "position": "Service Technician"
    })

    assert res.status_code == 201

    data = res.json()
    assert data["name"] == "Test Employee"
    assert data["email"] == "new.employee@test.com"
    assert data["role"] == "EMPLOYEE"


def test_employee_cannot_create_employee(client, employee_headers):
    res = client.post("/api/employees", headers=employee_headers, json={
        "name": "Unauthorized Employee",
        "email": "unauthorized@test.com",
        "password": "testpass123",
        "department": "Operations",
        "position": "Technician"
    })

    assert res.status_code == 403


def test_admin_can_delete_employee(client, admin_headers):
    create_res = client.post("/api/employees", headers=admin_headers, json={
        "name": "Delete Test Employee",
        "email": "delete.employee@test.com",
        "password": "testpass123",
        "department": "Testing",
        "position": "Test Engineer"
    })

    assert create_res.status_code == 201

    employee_id = create_res.json()["id"]

    delete_res = client.delete(
        f"/api/employees/{employee_id}",
        headers=admin_headers
    )

    assert delete_res.status_code == 204

    get_res = client.get(
        f"/api/employees/{employee_id}",
        headers=admin_headers
    )

    assert get_res.status_code == 404


def test_employee_cannot_delete_employee(client, admin_headers, employee_headers):
    create_res = client.post("/api/employees", headers=admin_headers, json={
        "name": "Protected Employee",
        "email": "protected.employee@test.com",
        "password": "testpass123",
        "department": "Testing",
        "position": "Test Engineer"
    })

    assert create_res.status_code == 201

    employee_id = create_res.json()["id"]

    delete_res = client.delete(
        f"/api/employees/{employee_id}",
        headers=employee_headers
    )

    assert delete_res.status_code == 403
