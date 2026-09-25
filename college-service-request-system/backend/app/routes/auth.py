from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

from app.database import users_col
from app.schemas.user import UserRegister, UserLogin, TokenResponse, UserOut
from app.utils.security import hash_password, verify_password, create_access_token
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _user_out(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "department": user.get("department"),
        "phone": user.get("phone"),
        "created_at": user["created_at"],
    }


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister):
    existing = await users_col.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

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
    token = create_access_token({"sub": str(result.inserted_id), "role": doc["role"]})
    return {"access_token": token, "user": _user_out(doc)}


@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await users_col.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": str(user["_id"]), "role": user["role"]})
    return {"access_token": token, "user": _user_out(user)}


@router.post("/login-json", response_model=TokenResponse)
async def login_json(payload: UserLogin):
    """JSON-friendly login endpoint (frontend uses this instead of the OAuth2 form)."""
    user = await users_col.find_one({"email": payload.email, "role": payload.role})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": str(user["_id"]), "role": user["role"]})
    return {"access_token": token, "user": _user_out(user)}


@router.get("/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    return _user_out(user)
