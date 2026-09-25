from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from bson import ObjectId

from app.database import service_requests_col, users_col, departments_col
from app.dependencies import get_current_user, staff_or_above, lead_or_above
from app.schemas.request import RequestCreate, StatusChange, AssignStaff, WorkaroundIn, ConfirmResolution
from app.schemas.common import ServiceCategory, RequestStatus, ALLOWED_TRANSITIONS, Role
from app.services.impact_engine import calculate_impact
from app.services.sla_service import compute_deadlines, evaluate_sla_status
from app.services.routing_service import CATEGORY_DEPARTMENT_MAP
from app.services.audit_service import log_action
from app.services.notification_service import notify
from app.utils.request_number import next_request_number

router = APIRouter(prefix="/api/requests", tags=["requests"])


def serialize(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    doc["sla_status"] = evaluate_sla_status(
        doc["created_at"], doc["sla_resolution_deadline"], doc.get("resolved_at")
    )
    return doc


@router.post("", status_code=201)
async def create_request(payload: RequestCreate, user: dict = Depends(get_current_user)):
    if user["role"] not in [Role.STUDENT.value, Role.FACULTY.value]:
        raise HTTPException(403, "Only students and faculty can create requests")

    now = datetime.now(timezone.utc)
    impact = calculate_impact(
        payload.service_category, payload.people_affected or 1, payload.urgency or "NORMAL", 0
    )
    deadlines = compute_deadlines(payload.service_category, now)
    dept_name = CATEGORY_DEPARTMENT_MAP.get(payload.service_category)
    dept = await departments_col.find_one({"name": dept_name})

    doc = {
        "request_number": await next_request_number(),
        "requester_id": user["id"],
        "requester_name": user["name"],
        "requester_role": user["role"],
        "service_category": payload.service_category.value,
        "department_id": str(dept["_id"]) if dept else None,
        "title": payload.title,
        "description": payload.description,
        "form_data": payload.form_data,
        "location": payload.location,
        "priority": impact["priority"],
        "impact_score": impact["score"],
        "impact_factors": impact["factors"],
        "people_affected": payload.people_affected or 1,
        "sla_response_deadline": deadlines["sla_response_deadline"],
        "sla_resolution_deadline": deadlines["sla_resolution_deadline"],
        "assigned_staff_id": None,
        "assigned_staff_name": None,
        "status": RequestStatus.NEW.value,
        "workaround": None,
        "created_at": now,
        "assigned_at": None,
        "started_at": None,
        "resolved_at": None,
        "closed_at": None,
        "updated_at": now,
    }
    result = await service_requests_col.insert_one(doc)
    doc["_id"] = result.inserted_id
    await log_action(str(result.inserted_id), user["id"], user["name"], user["role"],
                      "CREATED", f"{user['name']} created {doc['request_number']}")
    return serialize(doc)


@router.get("")
async def list_requests(
    user: dict = Depends(get_current_user),
    status_filter: Optional[str] = Query(None, alias="status"),
    service_category: Optional[str] = None,
    priority: Optional[str] = None,
    department_id: Optional[str] = None,
    assigned_staff_id: Optional[str] = None,
    sla_status: Optional[str] = None,
    search: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
):
    query: dict = {}

    # Role-based visibility
    if user["role"] in (Role.STUDENT.value, Role.FACULTY.value):
        query["requester_id"] = user["id"]
    elif user["role"] == Role.SERVICE_STAFF.value:
        query["assigned_staff_id"] = user["id"]
    # SERVICE_LEAD and ADMIN see everything (optionally filtered below)

    if status_filter:
        query["status"] = status_filter
    if service_category:
        query["service_category"] = service_category
    if priority:
        query["priority"] = priority
    if department_id:
        query["department_id"] = department_id
    if assigned_staff_id:
        query["assigned_staff_id"] = assigned_staff_id
    if date_from or date_to:
        rng = {}
        if date_from:
            rng["$gte"] = datetime.fromisoformat(date_from)
        if date_to:
            rng["$lte"] = datetime.fromisoformat(date_to)
        query["created_at"] = rng
    if search:
        query["$or"] = [
            {"request_number": {"$regex": search, "$options": "i"}},
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"requester_name": {"$regex": search, "$options": "i"}},
        ]

    cursor = service_requests_col.find(query).sort("created_at", -1).skip(skip).limit(limit)
    items = [serialize(doc) async for doc in cursor]
    if sla_status:
        items = [i for i in items if i["sla_status"] == sla_status]
    total = await service_requests_col.count_documents(query)
    return {"items": items, "total": total}


async def _get_or_404(request_id: str) -> dict:
    try:
        doc = await service_requests_col.find_one({"_id": ObjectId(request_id)})
    except Exception:
        doc = None
    if not doc:
        raise HTTPException(404, "Request not found")
    return doc


def _can_view(user: dict, doc: dict) -> bool:
    if user["role"] in (Role.SERVICE_LEAD.value, Role.ADMIN.value):
        return True
    if user["role"] in (Role.STUDENT.value, Role.FACULTY.value):
        return doc["requester_id"] == user["id"]
    if user["role"] == Role.SERVICE_STAFF.value:
        return doc.get("assigned_staff_id") == user["id"]
    return False


@router.get("/{request_id}")
async def get_request(request_id: str, user: dict = Depends(get_current_user)):
    doc = await _get_or_404(request_id)
    if not _can_view(user, doc):
        raise HTTPException(403, "You do not have access to this request")
    return serialize(doc)


@router.patch("/{request_id}/status")
async def change_status(request_id: str, payload: StatusChange, user: dict = Depends(staff_or_above)):
    doc = await _get_or_404(request_id)
    current = RequestStatus(doc["status"])
    allowed = ALLOWED_TRANSITIONS.get(current, [])
    if payload.new_status not in allowed:
        raise HTTPException(400, f"Cannot move from {current.value} to {payload.new_status.value}")

    now = datetime.now(timezone.utc)
    update = {"status": payload.new_status.value, "updated_at": now}
    if payload.new_status == RequestStatus.IN_PROGRESS and not doc.get("started_at"):
        update["started_at"] = now
    if payload.new_status == RequestStatus.RESOLVED:
        update["resolved_at"] = now

    await service_requests_col.update_one({"_id": doc["_id"]}, {"$set": update})
    await log_action(request_id, user["id"], user["name"], user["role"], "STATUS_CHANGE",
                      f"{user['name']} changed status to {payload.new_status.value}" +
                      (f" — {payload.note}" if payload.note else ""))

    if payload.new_status == RequestStatus.RESOLVED:
        await notify(doc["requester_id"], f"Your request {doc['request_number']} has been marked RESOLVED. Please confirm.",
                     doc["request_number"], request_id)

    updated = await service_requests_col.find_one({"_id": doc["_id"]})
    return serialize(updated)


@router.patch("/{request_id}/assign")
async def assign_staff(request_id: str, payload: AssignStaff, user: dict = Depends(lead_or_above)):
    doc = await _get_or_404(request_id)
    staff = await users_col.find_one({"_id": ObjectId(payload.staff_id), "role": Role.SERVICE_STAFF.value})
    if not staff:
        raise HTTPException(404, "Staff member not found")

    now = datetime.now(timezone.utc)
    new_status = RequestStatus.ASSIGNED.value if doc["status"] in (
        RequestStatus.NEW.value, RequestStatus.ASSIGNED.value
    ) else doc["status"]

    await service_requests_col.update_one(
        {"_id": doc["_id"]},
        {"$set": {
            "assigned_staff_id": str(staff["_id"]),
            "assigned_staff_name": staff["name"],
            "assigned_at": now,
            "status": new_status,
            "updated_at": now,
        }},
    )
    action = "REASSIGNED" if doc.get("assigned_staff_id") else "ASSIGNED"
    await log_action(request_id, user["id"], user["name"], user["role"], action,
                      f"{user['name']} assigned request to {staff['name']}" +
                      (f" — {payload.note}" if payload.note else ""))
    await notify(staff["_id"].__str__(), f"You have been assigned request {doc['request_number']}.",
                 doc["request_number"], request_id)
    await notify(doc["requester_id"], f"Your request {doc['request_number']} has been assigned.",
                 doc["request_number"], request_id)

    updated = await service_requests_col.find_one({"_id": doc["_id"]})
    return serialize(updated)


@router.patch("/{request_id}/workaround")
async def set_workaround(request_id: str, payload: WorkaroundIn, user: dict = Depends(staff_or_above)):
    doc = await _get_or_404(request_id)
    now = datetime.now(timezone.utc)
    workaround = {"alternative": payload.alternative, "note": payload.note, "provided_by": user["name"], "provided_at": now}
    await service_requests_col.update_one({"_id": doc["_id"]}, {"$set": {"workaround": workaround, "updated_at": now}})
    await log_action(request_id, user["id"], user["name"], user["role"], "WORKAROUND_PROVIDED",
                      f"Temporary alternative provided: {payload.alternative}")
    await notify(doc["requester_id"], f"A temporary alternative was provided for {doc['request_number']}: {payload.alternative}",
                 doc["request_number"], request_id)
    updated = await service_requests_col.find_one({"_id": doc["_id"]})
    return serialize(updated)


@router.patch("/{request_id}/confirm")
async def confirm_resolution(request_id: str, payload: ConfirmResolution, user: dict = Depends(get_current_user)):
    doc = await _get_or_404(request_id)
    if doc["requester_id"] != user["id"]:
        raise HTTPException(403, "Only the original requester can confirm this request")
    if doc["status"] != RequestStatus.RESOLVED.value:
        raise HTTPException(400, "Request is not in RESOLVED state")

    now = datetime.now(timezone.utc)
    if payload.accepted:
        await service_requests_col.update_one(
            {"_id": doc["_id"]}, {"$set": {"status": RequestStatus.CLOSED.value, "closed_at": now, "updated_at": now}}
        )
        await log_action(request_id, user["id"], user["name"], user["role"], "CONFIRMED_CLOSED",
                          f"{user['name']} confirmed completion. Request closed.")
    else:
        await service_requests_col.update_one(
            {"_id": doc["_id"]},
            {"$set": {"status": RequestStatus.REOPENED.value, "resolved_at": None, "updated_at": now}},
        )
        await log_action(request_id, user["id"], user["name"], user["role"], "REOPENED",
                          f"{user['name']} rejected resolution — {payload.reason or 'no reason given'}. Request reopened.")
        if doc.get("assigned_staff_id"):
            await notify(doc["assigned_staff_id"], f"Request {doc['request_number']} was reopened by the requester.",
                         doc["request_number"], request_id)

    updated = await service_requests_col.find_one({"_id": doc["_id"]})
    return serialize(updated)


@router.get("/{request_id}/audit")
async def get_request_audit(request_id: str, user: dict = Depends(get_current_user)):
    from app.services.audit_service import get_audit_trail
    doc = await _get_or_404(request_id)
    if not _can_view(user, doc):
        raise HTTPException(403, "You do not have access to this request")
    return await get_audit_trail(request_id)
