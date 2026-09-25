def test_create_and_list_customer(client, admin_headers):
    create_res = client.post("/api/customers", headers=admin_headers, json={
        "name": "Acme Test Corp",
        "email": "test@acme.com",
        "phone": "+1-555-9999",
        "address": "123 Test Street"
    })
    assert create_res.status_code == 201
    cust_id = create_res.json()["id"]

    list_res = client.get("/api/customers", headers=admin_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    get_res = client.get(f"/api/customers/{cust_id}", headers=admin_headers)
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Acme Test Corp"

def test_update_customer(client, admin_headers):
    create_res = client.post("/api/customers", headers=admin_headers, json={
        "name": "Old Name",
        "email": "old@example.com",
        "phone": "00000"
    })
    cust_id = create_res.json()["id"]

    update_res = client.put(f"/api/customers/{cust_id}", headers=admin_headers, json={
        "name": "Updated Name"
    })
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Updated Name"

def test_employee_cannot_delete_customer(client, employee_headers, admin_headers):
    create_res = client.post("/api/customers", headers=admin_headers, json={
        "name": "Protected Cust",
        "email": "protected@example.com",
        "phone": "11111"
    })
    cust_id = create_res.json()["id"]

    del_res = client.delete(f"/api/customers/{cust_id}", headers=employee_headers)
    assert del_res.status_code == 403

def test_admin_can_delete_customer(client, admin_headers):
    create_res = client.post("/api/customers", headers=admin_headers, json={
        "name": "To Delete",
        "email": "todelete@example.com",
        "phone": "22222"
    })
    cust_id = create_res.json()["id"]

    del_res = client.delete(f"/api/customers/{cust_id}", headers=admin_headers)
    assert del_res.status_code == 204
