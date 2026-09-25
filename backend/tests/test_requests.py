def test_service_request_lifecycle(client, admin_headers):
    # Create Customer
    c_res = client.post("/api/customers", headers=admin_headers, json={
        "name": "Req Customer", "email": "req@cust.com", "phone": "1234"
    })
    cust_id = c_res.json()["id"]

    # Create Service
    s_res = client.post("/api/services", headers=admin_headers, json={
        "name": "Dev Service", "price": 1000.0, "duration": 60
    })
    svc_id = s_res.json()["id"]

    # Create Request (PENDING)
    req_res = client.post("/api/requests", headers=admin_headers, json={
        "customer_id": cust_id,
        "service_id": svc_id,
        "title": "Build Landing Page",
        "priority": "HIGH"
    })
    assert req_res.status_code == 201
    req_id = req_res.json()["id"]
    assert req_res.json()["status"] == "PENDING"

    # Invalid jump from PENDING to COMPLETED should fail with 400
    bad_jump = client.put(f"/api/requests/{req_id}", headers=admin_headers, json={
        "status": "COMPLETED"
    })
    assert bad_jump.status_code == 400

    # Step 1: Assign employee
    emp_res = client.get("/api/employees", headers=admin_headers)
    emp_id = emp_res.json()[0]["id"]

    assign_res = client.put(f"/api/requests/{req_id}", headers=admin_headers, json={
        "employee_id": emp_id
    })
    assert assign_res.status_code == 200
    assert assign_res.json()["status"] == "ASSIGNED"

    # Step 2: Mark IN_PROGRESS
    progress_res = client.put(f"/api/requests/{req_id}", headers=admin_headers, json={
        "status": "IN_PROGRESS"
    })
    assert progress_res.status_code == 200
    assert progress_res.json()["status"] == "IN_PROGRESS"

    # Step 3: Mark COMPLETED
    complete_res = client.put(f"/api/requests/{req_id}", headers=admin_headers, json={
        "status": "COMPLETED"
    })
    assert complete_res.status_code == 200
    assert complete_res.json()["status"] == "COMPLETED"

def test_analytics_overview(client, admin_headers):
    res = client.get("/api/analytics/overview", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_customers" in data
    assert "status_distribution" in data
