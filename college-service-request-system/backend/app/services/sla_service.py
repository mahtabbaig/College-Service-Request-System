"""
sla_service.py

Calculates SLA response/resolution deadlines from real request timestamps
and a configurable per-category SLA table. Pure arithmetic on timestamps —
no randomness, no AI.
"""
from datetime import datetime, timedelta, timezone
from typing import Dict, Any
from app.schemas.common import ServiceCategory, SlaStatus

# Demo SLA configuration (hours). Persisted/editable via sla_configurations
# collection in a full deployment; seeded here as sensible defaults.
SLA_HOURS = {
    ServiceCategory.IT_SUPPORT: {"response": 1, "resolution": 4},
    ServiceCategory.ID_CARD: {"response": 4, "resolution": 24},
    ServiceCategory.BONAFIDE_CERTIFICATE: {"response": 8, "resolution": 48},
    ServiceCategory.HOSTEL: {"response": 0.5, "resolution": 1},  # emergency-grade
    ServiceCategory.LIBRARY: {"response": 2, "resolution": 8},
    ServiceCategory.TRANSPORT: {"response": 1, "resolution": 4},
}

APPROACHING_THRESHOLD_RATIO = 0.8  # >=80% of time elapsed => approaching


def compute_deadlines(category: ServiceCategory, created_at: datetime) -> Dict[str, datetime]:
    cfg = SLA_HOURS.get(category, {"response": 4, "resolution": 24})
    response_deadline = created_at + timedelta(hours=cfg["response"])
    resolution_deadline = created_at + timedelta(hours=cfg["resolution"])
    return {
        "sla_response_deadline": response_deadline,
        "sla_resolution_deadline": resolution_deadline,
    }


def evaluate_sla_status(
    created_at: datetime,
    resolution_deadline: datetime,
    resolved_at: datetime | None,
    now: datetime | None = None,
) -> str:

    # Make all datetimes timezone-aware (UTC)
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)

    if resolution_deadline.tzinfo is None:
        resolution_deadline = resolution_deadline.replace(tzinfo=timezone.utc)

    if resolved_at is not None and resolved_at.tzinfo is None:
        resolved_at = resolved_at.replace(tzinfo=timezone.utc)

    now = now or datetime.now(timezone.utc)

    if resolved_at is not None:
        return (
            SlaStatus.WITHIN_SLA.value
            if resolved_at <= resolution_deadline
            else SlaStatus.SLA_BREACHED.value
        )

    total_window = (resolution_deadline - created_at).total_seconds()
    elapsed = (now - created_at).total_seconds()

    if now > resolution_deadline:
        return SlaStatus.SLA_BREACHED.value

    if total_window > 0 and elapsed / total_window >= APPROACHING_THRESHOLD_RATIO:
        return SlaStatus.APPROACHING_SLA.value

    return SlaStatus.WITHIN_SLA.value
def remaining_label(deadline: datetime, now: datetime | None = None) -> str:
    now = now or datetime.now(timezone.utc)
    delta = deadline - now
    total_minutes = int(delta.total_seconds() // 60)
    sign = "-" if total_minutes < 0 else ""
    total_minutes = abs(total_minutes)
    hours, minutes = divmod(total_minutes, 60)
    return f"{sign}{hours:02d}h {minutes:02d}m"
