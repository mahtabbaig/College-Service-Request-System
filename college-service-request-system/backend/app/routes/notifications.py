from fastapi import APIRouter, Depends
from bson import ObjectId

from app.database import notifications_col
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("")
async def list_notifications(user: dict = Depends(get_current_user), limit: int = 50):
    cursor = notifications_col.find({"user_id": user["id"]}).sort("created_at", -1).limit(limit)
    out = []
    async for n in cursor:
        n["id"] = str(n["_id"])
        del n["_id"]
        out.append(n)
    unread = await notifications_col.count_documents({"user_id": user["id"], "read": False})
    return {"items": out, "unread_count": unread}


@router.patch("/{notification_id}/read")
async def mark_read(notification_id: str, user: dict = Depends(get_current_user)):
    await notifications_col.update_one(
        {"_id": ObjectId(notification_id), "user_id": user["id"]}, {"$set": {"read": True}}
    )
    return {"ok": True}


@router.patch("/read-all")
async def mark_all_read(user: dict = Depends(get_current_user)):
    await notifications_col.update_many({"user_id": user["id"], "read": False}, {"$set": {"read": True}})
    return {"ok": True}
