"""
recurring_detector.py

Detects recurring service issues using plain MongoDB aggregation
(group-by-location/category within a time window, count similar requests
above a configurable threshold). NOT AI — deterministic grouping/filtering
over historical data.
"""
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
from app.database import service_requests_col

RECURRING_THRESHOLD = 3          # >= this many similar requests => recurring
DEFAULT_WINDOW_DAYS = 30


async def detect_recurring(
    window_days: int = DEFAULT_WINDOW_DAYS,
    threshold: int = RECURRING_THRESHOLD,
) -> List[Dict[str, Any]]:
    since = datetime.now(timezone.utc) - timedelta(days=window_days)
    pipeline = [
        {"$match": {"created_at": {"$gte": since}}},
        {
            "$group": {
                "_id": {"location": "$location", "service_category": "$service_category"},
                "count": {"$sum": 1},
                "request_numbers": {"$push": "$request_number"},
                "last_reported": {"$max": "$created_at"},
                "first_reported": {"$min": "$created_at"},
            }
        },
        {"$match": {"count": {"$gte": threshold}}},
        {"$sort": {"count": -1}},
    ]
    results = []
    async for doc in service_requests_col.aggregate(pipeline):
        results.append({
            "location": doc["_id"]["location"],
            "service_category": doc["_id"]["service_category"],
            "count": doc["count"],
            "request_numbers": doc["request_numbers"][:10],
            "first_reported": doc["first_reported"],
            "last_reported": doc["last_reported"],
            "recurring": True,
            "suggested_action": "Schedule a maintenance/process review for this location and service.",
        })
    return results


async def is_location_recurring(location: str, category: str, window_days: int = DEFAULT_WINDOW_DAYS) -> Dict[str, Any]:
    since = datetime.now(timezone.utc) - timedelta(days=window_days)
    count = await service_requests_col.count_documents({
        "location": location,
        "service_category": category,
        "created_at": {"$gte": since},
    })
    return {"recurring": count >= RECURRING_THRESHOLD, "count": count}
