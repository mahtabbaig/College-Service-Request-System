from fastapi import APIRouter, Depends
from app.services.sla_service import SLA_HOURS
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/sla", tags=["sla"])


@router.get("/config")
async def get_sla_config(user: dict = Depends(get_current_user)):
    return {cat.value: hours for cat, hours in SLA_HOURS.items()}
