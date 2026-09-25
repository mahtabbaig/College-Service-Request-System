import pytest


async def _register(client, role, email):
    res = await client.post("/api/auth/register", json={
        "name": f"Test {role}", "email": email, "password": "Passw0rd!", "role": role,
    })
    return res.json()["access_token"]


@pytest.mark.asyncio
async def test_student_can_create_request(client):
    token = await _register(client, "STUDENT", "creator@college.demo")
    headers = {"Authorization": f"Bearer {token}"}
    res = await client.post("/api/requests", json={
        "service_category": "IT_SUPPORT", "title": "Wifi down", "description": "No wifi in lab",
        "location": "Computer Lab", "urgency": "URGENT", "people_affected": 50,
    }, headers=headers)
    assert res.status_code == 201
    body = res.json()
    assert body["request_number"].startswith("CSR-")
    assert body["status"] == "NEW"
    assert body["priority"] in ("LOW", "MEDIUM", "HIGH", "CRITICAL")


@pytest.mark.asyncio
async def test_staff_cannot_create_request(client):
    token = await _register(client, "SERVICE_STAFF", "staffcreate@college.demo")
    headers = {"Authorization": f"Bearer {token}"}
    res = await client.post("/api/requests", json={
        "service_category": "IT_SUPPORT", "title": "x", "description": "x", "location": "x",
    }, headers=headers)
    assert res.status_code == 403


@pytest.mark.asyncio
async def test_full_lifecycle_assign_progress_resolve_confirm(client):
    student_token = await _register(client, "STUDENT", "lifecycle.student@college.demo")
    lead_token = await _register(client, "SERVICE_LEAD", "lifecycle.lead@college.demo")
    staff_token = await _register(client, "SERVICE_STAFF", "lifecycle.staff@college.demo")

    s_headers = {"Authorization": f"Bearer {student_token}"}
    l_headers = {"Authorization": f"Bearer {lead_token}"}
    st_headers = {"Authorization": f"Bearer {staff_token}"}

    create = await client.post("/api/requests", json={
        "service_category": "LIBRARY", "title": "Book unavailable", "description": "x", "location": "Library",
    }, headers=s_headers)
    request_id = create.json()["id"]

    # Get staff id
    me = await client.get("/api/auth/me", headers=st_headers)
    staff_id = me.json()["id"]

    assign = await client.patch(f"/api/requests/{request_id}/assign", json={"staff_id": staff_id}, headers=l_headers)
    assert assign.status_code == 200
    assert assign.json()["status"] == "ASSIGNED"

    progress = await client.patch(f"/api/requests/{request_id}/status", json={"new_status": "IN_PROGRESS"}, headers=st_headers)
    assert progress.status_code == 200

    resolve = await client.patch(f"/api/requests/{request_id}/status", json={"new_status": "RESOLVED"}, headers=st_headers)
    assert resolve.status_code == 200

    confirm = await client.patch(f"/api/requests/{request_id}/confirm", json={"accepted": True}, headers=s_headers)
    assert confirm.status_code == 200
    assert confirm.json()["status"] == "CLOSED"


@pytest.mark.asyncio
async def test_reject_resolution_reopens(client):
    student_token = await _register(client, "STUDENT", "reopen.student@college.demo")
    lead_token = await _register(client, "SERVICE_LEAD", "reopen.lead@college.demo")
    staff_token = await _register(client, "SERVICE_STAFF", "reopen.staff@college.demo")

    s_headers = {"Authorization": f"Bearer {student_token}"}
    l_headers = {"Authorization": f"Bearer {lead_token}"}
    st_headers = {"Authorization": f"Bearer {staff_token}"}

    create = await client.post("/api/requests", json={
        "service_category": "HOSTEL", "title": "Leak", "description": "x", "location": "Hostel Block A",
    }, headers=s_headers)
    request_id = create.json()["id"]

    me = await client.get("/api/auth/me", headers=st_headers)
    staff_id = me.json()["id"]
    await client.patch(f"/api/requests/{request_id}/assign", json={"staff_id": staff_id}, headers=l_headers)
    await client.patch(f"/api/requests/{request_id}/status", json={"new_status": "IN_PROGRESS"}, headers=st_headers)
    await client.patch(f"/api/requests/{request_id}/status", json={"new_status": "RESOLVED"}, headers=st_headers)

    reject = await client.patch(f"/api/requests/{request_id}/confirm", json={"accepted": False, "reason": "still broken"}, headers=s_headers)
    assert reject.status_code == 200
    assert reject.json()["status"] == "REOPENED"


@pytest.mark.asyncio
async def test_invalid_status_transition_rejected(client):
    student_token = await _register(client, "STUDENT", "invalidtrans.student@college.demo")
    admin_token = await _register(client, "ADMIN", "invalidtrans.admin@college.demo")
    s_headers = {"Authorization": f"Bearer {student_token}"}
    a_headers = {"Authorization": f"Bearer {admin_token}"}

    create = await client.post("/api/requests", json={
        "service_category": "ID_CARD", "title": "x", "description": "x", "location": "Admin Block",
    }, headers=s_headers)
    request_id = create.json()["id"]

    # NEW -> RESOLVED directly should be rejected (must go through ASSIGNED, IN_PROGRESS)
    res = await client.patch(f"/api/requests/{request_id}/status", json={"new_status": "RESOLVED"}, headers=a_headers)
    assert res.status_code == 400
