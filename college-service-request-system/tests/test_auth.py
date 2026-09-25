import pytest


@pytest.mark.asyncio
async def test_register_and_login(client):
    res = await client.post("/api/auth/register", json={
        "name": "Test Student", "email": "test.student@college.demo",
        "password": "Passw0rd!", "role": "STUDENT",
    })
    assert res.status_code == 201
    token = res.json()["access_token"]
    assert token

    res2 = await client.post("/api/auth/login-json", json={
        "email": "test.student@college.demo", "password": "Passw0rd!",
    })
    assert res2.status_code == 200
    assert res2.json()["user"]["role"] == "STUDENT"


@pytest.mark.asyncio
async def test_login_wrong_password_fails(client):
    await client.post("/api/auth/register", json={
        "name": "A", "email": "wrongpass@college.demo", "password": "Correct1!", "role": "STUDENT",
    })
    res = await client.post("/api/auth/login-json", json={"email": "wrongpass@college.demo", "password": "Nope!"})
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_me_requires_token(client):
    res = await client.get("/api/auth/me")
    assert res.status_code == 401
