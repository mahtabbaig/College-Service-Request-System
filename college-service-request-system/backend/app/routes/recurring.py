from fastapi import APIRouter, Depends
from app.services.recurring_detector import detect_recurring
from app.dependencies import lead_or_above

router = APIRouter(prefix="/api/recurring", tags=["recurring"])


@router.get("")
async def get_recurring(window_days: int = 30, threshold: int = 3, user: dict = Depends(lead_or_above)):
    return await detect_recurring(window_days, threshold)
