from typing import List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId

from app.utils.security import decode_access_token
from app.database import users_col
from app.schemas.common import Role

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    user = await users_col.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise credentials_exception
    user["id"] = str(user["_id"])
    return user


def require_roles(*roles: Role):
    async def checker(user: dict = Depends(get_current_user)) -> dict:
        if user["role"] not in [r.value for r in roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{user['role']}' is not permitted to perform this action",
            )
        return user

    return checker


# Convenience dependency bundles
any_authenticated = get_current_user
staff_or_above = require_roles(Role.SERVICE_STAFF, Role.SERVICE_LEAD, Role.ADMIN)
lead_or_above = require_roles(Role.SERVICE_LEAD, Role.ADMIN)
admin_only = require_roles(Role.ADMIN)
