def test_register_user(client):
    res = client.post("/api/auth/register", json={
        "name": "Jane Doe",
        "email": "jane@example.com",
        "password": "securepassword123",
        "role": "EMPLOYEE",
        "department": "Engineering",
        "position": "Frontend Dev"
    })
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "jane@example.com"
    assert data["role"] == "EMPLOYEE"
    assert data["department"] == "Engineering"

def test_login_success(client, admin_user):
    res = client.post("/api/auth/login", json={
        "email": "admin@test.com",
        "password": "adminpass123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "admin@test.com"

def test_login_failed(client, admin_user):
    res = client.post("/api/auth/login", json={
        "email": "admin@test.com",
        "password": "wrongpassword"
    })
    assert res.status_code == 401

def test_get_me(client, admin_headers):
    res = client.get("/api/auth/me", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "admin@test.com"

def test_unauthorized_access(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401
