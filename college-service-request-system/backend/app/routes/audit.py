from fastapi import APIRouter, Depends
from app.database import audit_logs_col
from app.dependencies import admin_only

router = APIRouter(prefix="/api/audit", tags=["audit"])


@router.get("")
async def list_audit_logs(limit: int = 100, user: dict = Depends(admin_only)):
    cursor = audit_logs_col.find({}).sort("created_at", -1).limit(limit)
    out = []
    async for a in cursor:
        a["id"] = str(a["_id"])
        del a["_id"]
        out.append(a)
    return out
