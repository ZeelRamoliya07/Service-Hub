def test_admin_can_create_service(client, admin_headers):
    res = client.post("/api/services", headers=admin_headers, json={
        "name": "Test Service",
        "description": "Service created during automated testing",
        "price": 500.0,
        "duration": 60
    })

    assert res.status_code == 201

    data = res.json()
    assert data["name"] == "Test Service"
    assert data["price"] == 500.0
    assert data["duration"] == 60


def test_admin_can_update_service(client, admin_headers):
    create_res = client.post("/api/services", headers=admin_headers, json={
        "name": "Original Service",
        "description": "Original description",
        "price": 500.0,
        "duration": 60
    })

    assert create_res.status_code == 201
    service_id = create_res.json()["id"]

    update_res = client.put(
        f"/api/services/{service_id}",
        headers=admin_headers,
        json={
            "name": "Updated Service",
            "price": 750.0
        }
    )

    assert update_res.status_code == 200

    data = update_res.json()
    assert data["name"] == "Updated Service"
    assert data["price"] == 750.0


def test_employee_cannot_create_service(client, employee_headers):
    res = client.post("/api/services", headers=employee_headers, json={
        "name": "Unauthorized Service",
        "description": "Should not be created",
        "price": 100.0,
        "duration": 30
    })

    assert res.status_code == 403


def test_employee_cannot_update_service(client, admin_headers, employee_headers):
    create_res = client.post("/api/services", headers=admin_headers, json={
        "name": "Protected Service",
        "description": "Service for RBAC testing",
        "price": 500.0,
        "duration": 60
    })

    assert create_res.status_code == 201
    service_id = create_res.json()["id"]

    update_res = client.put(
        f"/api/services/{service_id}",
        headers=employee_headers,
        json={
            "name": "Unauthorized Update"
        }
    )

    assert update_res.status_code == 403
