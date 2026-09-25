from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from app.database import service_requests_col, users_col
from app.dependencies import get_current_user
from app.schemas.common import Role, RequestStatus
from app.services.sla_service import evaluate_sla_status

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

STATUS_LIST = [s.value for s in RequestStatus]


def _scope_query(user: dict) -> dict:
    if user["role"] in (Role.STUDENT.value, Role.FACULTY.value):
        return {"requester_id": user["id"]}
    if user["role"] == Role.SERVICE_STAFF.value:
        return {"assigned_staff_id": user["id"]}
    return {}  # lead/admin see all


@router.get("/summary")
async def dashboard_summary(user: dict = Depends(get_current_user)):
    query = _scope_query(user)

    counts = {}
    for s in STATUS_LIST:
        counts[s] = await service_requests_col.count_documents({**query, "status": s})
    total = await service_requests_col.count_documents(query)

    # SLA breach count computed from real timestamps, not stored/stale field
    sla_breached = 0
    now = datetime.now(timezone.utc)
    async for doc in service_requests_col.find({**query, "status": {"$nin": ["CLOSED"]}}):
        status = evaluate_sla_status(doc["created_at"], doc["sla_resolution_deadline"], doc.get("resolved_at"), now)
        if status == "SLA_BREACHED":
            sla_breached += 1

    return {"total": total, "by_status": counts, "sla_breached": sla_breached}


@router.get("/charts")
async def dashboard_charts(user: dict = Depends(get_current_user)):
    query = _scope_query(user)

    # Requests by service category
    by_service_pipeline = [{"$match": query}, {"$group": {"_id": "$service_category", "count": {"$sum": 1}}}]
    by_service = {doc["_id"]: doc["count"] async for doc in service_requests_col.aggregate(by_service_pipeline)}

    # Requests by status
    by_status_pipeline = [{"$match": query}, {"$group": {"_id": "$status", "count": {"$sum": 1}}}]
    by_status = {doc["_id"]: doc["count"] async for doc in service_requests_col.aggregate(by_status_pipeline)}

    # Monthly trend (last 6 months)
    since = datetime.now(timezone.utc) - timedelta(days=182)
    monthly_pipeline = [
        {"$match": {**query, "created_at": {"$gte": since}}},
        {"$group": {"_id": {"$dateToString": {"format": "%Y-%m", "date": "$created_at"}}, "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}},
    ]
    monthly = [{"month": doc["_id"], "count": doc["count"]} async for doc in service_requests_col.aggregate(monthly_pipeline)]

    # Average resolution time (hours) for closed/resolved requests
    resolved_pipeline = [
        {"$match": {**query, "resolved_at": {"$ne": None}}},
        {"$project": {"hours": {"$divide": [{"$subtract": ["$resolved_at", "$created_at"]}, 1000 * 60 * 60]}}},
    ]
    hours_list = [doc["hours"] async for doc in service_requests_col.aggregate(resolved_pipeline)]
    avg_resolution_hours = round(sum(hours_list) / len(hours_list), 1) if hours_list else 0

    # SLA compliance % (resolved within resolution deadline)
    compliant, evaluated = 0, 0
    async for doc in service_requests_col.find({**query, "resolved_at": {"$ne": None}}):
        evaluated += 1
        if doc["resolved_at"] <= doc["sla_resolution_deadline"]:
            compliant += 1
    sla_compliance_pct = round((compliant / evaluated) * 100, 1) if evaluated else 100.0

    # Staff workload (open assignments per staff member)
    workload_pipeline = [
        {"$match": {"assigned_staff_id": {"$ne": None}, "status": {"$in": ["ASSIGNED", "IN_PROGRESS", "ON_HOLD"]}}},
        {"$group": {"_id": "$assigned_staff_name", "open_requests": {"$sum": 1}}},
        {"$sort": {"open_requests": -1}},
    ]
    staff_workload = [{"staff": doc["_id"], "open_requests": doc["open_requests"]} async for doc in service_requests_col.aggregate(workload_pipeline)]

    return {
        "by_service": by_service,
        "by_status": by_status,
        "monthly_trend": monthly,
        "avg_resolution_hours": avg_resolution_hours,
        "sla_compliance_pct": sla_compliance_pct,
        "staff_workload": staff_workload,
    }
