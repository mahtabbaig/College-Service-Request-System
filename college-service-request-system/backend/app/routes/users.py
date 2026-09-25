from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from app.database import users_col
from app.dependencies import get_current_user, admin_only
from app.schemas.user import UserRegister
from app.utils.security import hash_password

router = APIRouter(prefix="/api/users", tags=["users"])


def _out(u: dict) -> dict:
    return {
        "id": str(u["_id"]),
        "name": u["name"],
        "email": u["email"],
        "role": u["role"],
        "department": u.get("department"),
        "phone": u.get("phone"),
        "created_at": u["created_at"],
    }


@router.get("")
async def list_users(role: str | None = None, department: str | None = None, user: dict = Depends(admin_only)):
    query = {}
    if role:
        query["role"] = role
    if department:
        query["department"] = department
    cursor = users_col.find(query).sort("created_at", -1)
    return [_out(u) async for u in cursor]


@router.get("/staff")
async def list_staff(department: str | None = None, user: dict = Depends(get_current_user)):
    """Lightweight staff lookup for assignment dropdowns (leads and admins)."""
    query = {"role": "SERVICE_STAFF"}
    if department:
        query["department"] = department
    cursor = users_col.find(query)
    return [_out(u) async for u in cursor]


@router.post("", status_code=201)
async def create_user(payload: UserRegister, user: dict = Depends(admin_only)):
    existing = await users_col.find_one({"email": payload.email})
    if existing:
        raise HTTPException(400, "Email already registered")
    doc = {
        "name": payload.name,
        "email": payload.email,
        "password_hash": hash_password(payload.password),
        "role": payload.role.value,
        "department": payload.department,
        "phone": payload.phone,
        "created_at": datetime.now(timezone.utc),
    }
    result = await users_col.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _out(doc)


@router.delete("/{user_id}")
async def delete_user(user_id: str, user: dict = Depends(admin_only)):
    await users_col.delete_one({"_id": ObjectId(user_id)})
    return {"ok": True}
