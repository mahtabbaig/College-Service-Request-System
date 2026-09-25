from datetime import datetime, timezone
from app.database import notifications_col


async def notify(user_id: str, message: str, request_number: str | None = None, request_id: str | None = None):
    await notifications_col.insert_one({
        "user_id": user_id,
        "message": message,
        "request_number": request_number,
        "request_id": request_id,
        "read": False,
        "created_at": datetime.now(timezone.utc),
    })
