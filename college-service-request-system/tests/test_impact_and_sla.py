from datetime import datetime, timedelta, timezone
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.services.impact_engine import calculate_impact
from app.services.sla_service import compute_deadlines, evaluate_sla_status
from app.services.recurring_detector import RECURRING_THRESHOLD
from app.schemas.common import ServiceCategory


def test_impact_score_within_bounds():
    result = calculate_impact(ServiceCategory.HOSTEL, people_affected=120, urgency="URGENT", minutes_waited=0)
    assert 0 <= result["score"] <= 100
    assert result["priority"] in ("LOW", "MEDIUM", "HIGH", "CRITICAL")
    assert len(result["factors"]) >= 3


def test_hostel_scores_higher_than_library_all_else_equal():
    hostel = calculate_impact(ServiceCategory.HOSTEL, people_affected=10, urgency="NORMAL", minutes_waited=0)
    library = calculate_impact(ServiceCategory.LIBRARY, people_affected=10, urgency="NORMAL", minutes_waited=0)
    assert hostel["score"] >= library["score"]


def test_sla_deadlines_computed_from_creation_time():
    now = datetime.now(timezone.utc)
    deadlines = compute_deadlines(ServiceCategory.IT_SUPPORT, now)
    assert deadlines["sla_response_deadline"] > now
    assert deadlines["sla_resolution_deadline"] > deadlines["sla_response_deadline"] - timedelta(hours=1)


def test_sla_status_breached_after_deadline():
    now = datetime.now(timezone.utc)
    created = now - timedelta(hours=10)
    resolution_deadline = created + timedelta(hours=4)  # already passed
    status = evaluate_sla_status(created, resolution_deadline, resolved_at=None, now=now)
    assert status == "SLA_BREACHED"


def test_sla_status_within_when_far_from_deadline():
    now = datetime.now(timezone.utc)
    created = now
    resolution_deadline = created + timedelta(hours=24)
    status = evaluate_sla_status(created, resolution_deadline, resolved_at=None, now=now)
    assert status == "WITHIN_SLA"


def test_recurring_threshold_is_configured():
    assert RECURRING_THRESHOLD >= 2
