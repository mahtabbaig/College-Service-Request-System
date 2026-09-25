from datetime import datetime
from typing import Optional, Any, Dict, List
from pydantic import BaseModel, Field
from app.schemas.common import ServiceCategory, RequestStatus, Priority, SlaStatus


class RequestCreate(BaseModel):
    service_category: ServiceCategory
    title: str
    description: str
    location: str
    form_data: Dict[str, Any] = Field(default_factory=dict)
    urgency: Optional[str] = "NORMAL"  # NORMAL | URGENT
    people_affected: Optional[int] = 1


class StatusChange(BaseModel):
    new_status: RequestStatus
    note: Optional[str] = None


class AssignStaff(BaseModel):
    staff_id: str
    note: Optional[str] = None


class WorkaroundIn(BaseModel):
    alternative: str
    note: Optional[str] = None


class ConfirmResolution(BaseModel):
    accepted: bool  # True = confirm & close, False = reject & reopen
    reason: Optional[str] = None


class CommentCreate(BaseModel):
    message: str


class ImpactFactor(BaseModel):
    name: str
    points: int
    reason: str


class ImpactResult(BaseModel):
    score: int
    priority: Priority
    factors: List[ImpactFactor]
    explanation: str


class RequestOut(BaseModel):
    id: str
    request_number: str
    requester_id: str
    requester_name: str
    requester_role: str
    service_category: ServiceCategory
    department_id: Optional[str] = None
    title: str
    description: str
    form_data: Dict[str, Any] = {}
    location: str
    priority: Priority
    impact_score: int
    impact_factors: List[Dict[str, Any]] = []
    sla_status: SlaStatus
    sla_response_deadline: Optional[datetime] = None
    sla_resolution_deadline: Optional[datetime] = None
    assigned_staff_id: Optional[str] = None
    assigned_staff_name: Optional[str] = None
    status: RequestStatus
    workaround: Optional[Dict[str, Any]] = None
    people_affected: int = 1
    created_at: datetime
    assigned_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    updated_at: datetime
