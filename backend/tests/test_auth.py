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

def test_login_unknown_email(client):
    res = client.post("/api/auth/login", json={
        "email": "doesnotexist@test.com",
        "password": "somepassword123"
    })

    assert res.status_code == 401


def test_invalid_token_rejected(client):
    res = client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer invalid.token.value"}
    )

    assert res.status_code == 401


def test_duplicate_registration_rejected(client):
    user_data = {
        "name": "Duplicate Test User",
        "email": "duplicate@test.com",
        "password": "securepassword123",
        "role": "EMPLOYEE",
        "department": "Engineering",
        "position": "Developer"
    }

    first_res = client.post("/api/auth/register", json=user_data)
    assert first_res.status_code == 201

    second_res = client.post("/api/auth/register", json=user_data)
    assert second_res.status_code in [400, 409]
