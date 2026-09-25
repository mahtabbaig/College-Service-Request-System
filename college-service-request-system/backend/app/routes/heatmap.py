from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, Query
from app.database import service_requests_col
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/heatmap", tags=["heatmap"])

TIME_RANGES = {
    "today": timedelta(days=1),
    "7d": timedelta(days=7),
    "30d": timedelta(days=30),
    "semester": timedelta(days=120),
}


@router.get("")
async def get_heatmap(
    service_category: str | None = None,
    time_range: str = Query("30d", pattern="^(today|7d|30d|semester)$"),
    user: dict = Depends(get_current_user),
):
    since = datetime.now(timezone.utc) - TIME_RANGES[time_range]
    match: dict = {"created_at": {"$gte": since}}
    if service_category:
        match["service_category"] = service_category

    pipeline = [
        {"$match": match},
        {
            "$group": {
                "_id": "$location",
                "total": {"$sum": 1},
                "open": {"$sum": {"$cond": [{"$in": ["$status", ["NEW", "ASSIGNED", "IN_PROGRESS", "ON_HOLD", "REOPENED"]]}, 1, 0]}},
                "resolved": {"$sum": {"$cond": [{"$in": ["$status", ["RESOLVED", "CLOSED"]]}, 1, 0]}},
                "categories": {"$push": "$service_category"},
            }
        },
        {"$sort": {"total": -1}},
    ]

    results = []
    async for doc in service_requests_col.aggregate(pipeline):
        cats = doc["categories"]
        most_common = max(set(cats), key=cats.count) if cats else None
        results.append({
            "location": doc["_id"],
            "total": doc["total"],
            "open": doc["open"],
            "resolved": doc["resolved"],
            "most_common_service": most_common,
            "recurring_issue": doc["total"] >= 3,
        })

    total_issues = sum(r["total"] for r in results)
    top_hotspot = results[0]["location"] if results else None
    all_cats = [c for r in results for c in [r["most_common_service"]] if c]
    most_reported_service = max(set(all_cats), key=all_cats.count) if all_cats else None
    recurring_hotspots = sum(1 for r in results if r["recurring_issue"])

    return {
        "summary": {
            "total_issues": total_issues,
            "top_hotspot": top_hotspot,
            "most_reported_service": most_reported_service,
            "recurring_hotspots": recurring_hotspots,
        },
        "locations": results,
    }
