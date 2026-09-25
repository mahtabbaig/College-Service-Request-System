from datetime import datetime, timezone
from app.database import audit_logs_col


async def log_action(request_id: str, actor_id: str, actor_name: str, actor_role: str, action: str, details: str = ""):
    await audit_logs_col.insert_one({
        "request_id": request_id,
        "actor_id": actor_id,
        "actor_name": actor_name,
        "actor_role": actor_role,
        "action": action,
        "details": details,
        "created_at": datetime.now(timezone.utc),
    })


async def get_audit_trail(request_id: str):
    cursor = audit_logs_col.find({"request_id": request_id}).sort("created_at", 1)
    trail = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        trail.append(doc)
    return trail
