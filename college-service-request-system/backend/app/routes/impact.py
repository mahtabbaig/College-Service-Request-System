from fastapi import APIRouter, Depends
from app.schemas.common import ServiceCategory
from app.services.impact_engine import calculate_impact, WEIGHTS
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/impact", tags=["impact"])


@router.get("/preview")
async def preview_impact(
    category: ServiceCategory,
    people_affected: int = 1,
    urgency: str = "NORMAL",
    user: dict = Depends(get_current_user),
):
    """Lets the frontend show a live impact/priority preview while the requester fills the form."""
    return calculate_impact(category, people_affected, urgency, 0)


@router.get("/weights")
async def get_weights(user: dict = Depends(get_current_user)):
    return WEIGHTS
