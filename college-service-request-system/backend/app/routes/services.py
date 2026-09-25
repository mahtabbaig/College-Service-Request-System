from fastapi import APIRouter, Depends
from app.schemas.common import ServiceCategory, CATEGORY_LABELS
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/services", tags=["services"])

# Field definitions per category, used by the frontend to render the
# service-specific request form dynamically.
CATEGORY_FIELDS = {
    ServiceCategory.BONAFIDE_CERTIFICATE: [
        {"key": "purpose", "label": "Purpose", "type": "text", "required": True},
        {"key": "course", "label": "Course", "type": "text", "required": True},
        {"key": "semester", "label": "Semester", "type": "text", "required": True},
        {"key": "copies", "label": "Number of Copies", "type": "number", "required": True},
        {"key": "required_date", "label": "Required Date", "type": "date", "required": True},
    ],
    ServiceCategory.ID_CARD: [
        {"key": "issue_type", "label": "Issue Type", "type": "select",
         "options": ["NEW", "LOST", "DAMAGED"], "required": True},
        {"key": "details", "label": "Student/Faculty Details", "type": "text", "required": True},
        {"key": "supporting_document", "label": "Supporting Document Note", "type": "text", "required": False},
    ],
    ServiceCategory.HOSTEL: [
        {"key": "block", "label": "Block", "type": "text", "required": True},
        {"key": "room", "label": "Room", "type": "text", "required": True},
        {"key": "issue_type", "label": "Issue Type", "type": "select",
         "options": ["MAINTENANCE", "WATER", "ELECTRICAL", "FURNITURE", "OTHER"], "required": True},
        {"key": "urgency_note", "label": "Urgency Details", "type": "text", "required": False},
    ],
    ServiceCategory.TRANSPORT: [
        {"key": "route", "label": "Route", "type": "text", "required": True},
        {"key": "stop", "label": "Bus / Stop", "type": "text", "required": True},
        {"key": "request_type", "label": "Request Type", "type": "select",
         "options": ["SCHEDULE_ISSUE", "PASS_REQUEST", "COMPLAINT", "OTHER"], "required": True},
    ],
    ServiceCategory.LIBRARY: [
        {"key": "service_type", "label": "Book / Service Type", "type": "text", "required": True},
        {"key": "issue_type", "label": "Issue Type", "type": "select",
         "options": ["AVAILABILITY", "RENEWAL", "FINE", "DAMAGE", "OTHER"], "required": True},
        {"key": "book_id", "label": "Book ID", "type": "text", "required": False},
    ],
    ServiceCategory.IT_SUPPORT: [
        {"key": "issue_type", "label": "Issue Type", "type": "select",
         "options": ["NETWORK", "HARDWARE", "SOFTWARE", "ACCOUNT", "OTHER"], "required": True},
        {"key": "device", "label": "Device", "type": "text", "required": False},
        {"key": "problem", "label": "Software/Network Problem", "type": "text", "required": True},
    ],
}


@router.get("")
async def list_service_categories(user: dict = Depends(get_current_user)):
    return [
        {
            "value": cat.value,
            "label": CATEGORY_LABELS[cat],
            "fields": CATEGORY_FIELDS[cat],
        }
        for cat in ServiceCategory
    ]
