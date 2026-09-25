import os
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

from app.database import attachments_col
from app.dependencies import get_current_user
from app.routes.requests import _can_view, _get_or_404
from app.config import settings

router = APIRouter(prefix="/api/attachments", tags=["attachments"])

ALLOWED_EXT = {".pdf", ".png", ".jpg", ".jpeg"}
MAX_BYTES = settings.max_upload_mb * 1024 * 1024


@router.get("/{request_id}")
async def list_attachments(request_id: str, user: dict = Depends(get_current_user)):
    doc = await _get_or_404(request_id)
    if not _can_view(user, doc):
        raise HTTPException(403, "You do not have access to this request")
    cursor = attachments_col.find({"request_id": request_id})
    out = []
    async for a in cursor:
        a["id"] = str(a["_id"])
        del a["_id"]
        out.append(a)
    return out


@router.post("/{request_id}", status_code=201)
async def upload_attachment(request_id: str, file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    doc = await _get_or_404(request_id)
    if not _can_view(user, doc):
        raise HTTPException(403, "You do not have access to this request")

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(400, f"File type '{ext}' not allowed. Allowed: {sorted(ALLOWED_EXT)}")

    contents = await file.read()
    if len(contents) > MAX_BYTES:
        raise HTTPException(400, f"File exceeds max size of {settings.max_upload_mb}MB")

    os.makedirs(settings.upload_dir, exist_ok=True)
    stored_name = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(settings.upload_dir, stored_name)
    with open(path, "wb") as f:
        f.write(contents)

    meta = {
        "request_id": request_id,
        "original_name": file.filename,
        "stored_name": stored_name,
        "content_type": file.content_type,
        "size_bytes": len(contents),
        "uploaded_by": user["name"],
        "uploaded_by_id": user["id"],
        "created_at": datetime.now(timezone.utc),
    }
    result = await attachments_col.insert_one(meta)
    meta["id"] = str(result.inserted_id)
    del meta["_id"]
    return meta
