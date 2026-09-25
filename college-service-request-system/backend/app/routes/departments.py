from fastapi import APIRouter, Depends
from app.database import departments_col
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/departments", tags=["departments"])


@router.get("")
async def list_departments(user: dict = Depends(get_current_user)):
    cursor = departments_col.find({})
    out = []
    async for d in cursor:
        d["id"] = str(d["_id"])
        del d["_id"]
        out.append(d)
    return out
