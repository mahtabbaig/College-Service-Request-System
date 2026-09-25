from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from app.database import comments_col, service_requests_col
from app.dependencies import get_current_user
from app.schemas.request import CommentCreate
from app.routes.requests import _can_view, _get_or_404
from app.services.notification_service import notify

router = APIRouter(prefix="/api/comments", tags=["comments"])


@router.get("/{request_id}")
async def list_comments(request_id: str, user: dict = Depends(get_current_user)):
    doc = await _get_or_404(request_id)
    if not _can_view(user, doc):
        raise HTTPException(403, "You do not have access to this request")
    cursor = comments_col.find({"request_id": request_id}).sort("created_at", 1)
    out = []
    async for c in cursor:
        c["id"] = str(c["_id"])
        del c["_id"]
        out.append(c)
    return out


@router.post("/{request_id}", status_code=201)
async def add_comment(request_id: str, payload: CommentCreate, user: dict = Depends(get_current_user)):
    doc = await _get_or_404(request_id)
    if not _can_view(user, doc):
        raise HTTPException(403, "You do not have access to this request")

    now = datetime.now(timezone.utc)
    comment = {
        "request_id": request_id,
        "author_id": user["id"],
        "author": user["name"],
        "role": user["role"],
        "message": payload.message,
        "created_at": now,
    }
    result = await comments_col.insert_one(comment)
    comment["id"] = str(result.inserted_id)
    del comment["_id"]

    # Notify the other party in the conversation
    notify_target = None
    if user["id"] == doc["requester_id"] and doc.get("assigned_staff_id"):
        notify_target = doc["assigned_staff_id"]
    elif user["id"] != doc["requester_id"]:
        notify_target = doc["requester_id"]
    if notify_target:
        await notify(notify_target, f"New comment on {doc['request_number']}.", doc["request_number"], request_id)

    return comment
