"""
impact_engine.py

RULE-BASED impact/priority scoring. NOT AI/ML — every point is derived from
a fixed, configurable weight table applied to fields the requester and the
system already know (category criticality, people affected, urgency,
availability of alternatives, and time already waited). The output always
includes the itemised factors so the score is fully explainable.
"""
from typing import Dict, Any, List
from app.schemas.common import ServiceCategory, Priority

# Configurable scoring weights. Admins can tune these via /api/impact/weights
# (kept in-memory + seedable; a real deployment would persist this in
# sla_configurations_col or a dedicated config collection).
CATEGORY_CRITICALITY = {
    ServiceCategory.HOSTEL: 25,
    ServiceCategory.IT_SUPPORT: 15,
    ServiceCategory.LIBRARY: 10,
    ServiceCategory.TRANSPORT: 15,
    ServiceCategory.ID_CARD: 12,
    ServiceCategory.BONAFIDE_CERTIFICATE: 10,
}

CATEGORY_HAS_ALTERNATIVE = {
    ServiceCategory.HOSTEL: False,
    ServiceCategory.IT_SUPPORT: True,
    ServiceCategory.LIBRARY: True,
    ServiceCategory.TRANSPORT: False,
    ServiceCategory.ID_CARD: False,
    ServiceCategory.BONAFIDE_CERTIFICATE: False,
}

WEIGHTS = {
    "criticality_max": 25,
    "people_affected_max": 25,
    "urgency_max": 20,
    "no_alternative_bonus": 15,
    "waiting_time_max": 15,
}


def _people_affected_points(people_affected: int) -> int:
    if people_affected >= 100:
        return WEIGHTS["people_affected_max"]
    if people_affected >= 30:
        return 18
    if people_affected >= 10:
        return 12
    if people_affected >= 3:
        return 6
    return 2


def _urgency_points(urgency: str) -> int:
    return WEIGHTS["urgency_max"] if (urgency or "").upper() == "URGENT" else 8


def score_to_priority(score: int) -> Priority:
    if score >= 80:
        return Priority.CRITICAL
    if score >= 60:
        return Priority.HIGH
    if score >= 35:
        return Priority.MEDIUM
    return Priority.LOW


def calculate_impact(
    category: ServiceCategory,
    people_affected: int = 1,
    urgency: str = "NORMAL",
    minutes_waited: int = 0,
) -> Dict[str, Any]:
    """Returns score, priority, itemised factors, and a human explanation."""
    factors: List[Dict[str, Any]] = []

    crit_points = CATEGORY_CRITICALITY.get(category, 10)
    factors.append({
        "name": "Service Criticality",
        "points": crit_points,
        "reason": f"{category.value.replace('_', ' ').title()} is rated at "
                  f"{crit_points}/{WEIGHTS['criticality_max']} criticality for campus operations.",
    })

    people_points = _people_affected_points(people_affected)
    factors.append({
        "name": "People Affected",
        "points": people_points,
        "reason": f"Estimated {people_affected} people affected.",
    })

    urgency_points = _urgency_points(urgency)
    factors.append({
        "name": "Urgency",
        "points": urgency_points,
        "reason": f"Requester marked urgency as {urgency or 'NORMAL'}.",
    })

    has_alt = CATEGORY_HAS_ALTERNATIVE.get(category, True)
    alt_points = 0 if has_alt else WEIGHTS["no_alternative_bonus"]
    factors.append({
        "name": "Availability of Alternatives",
        "points": alt_points,
        "reason": "No alternative facility/service is available." if not has_alt
                  else "An alternative or workaround is generally available.",
    })

    # Waiting-time escalation: the longer a request sits unresolved, the more
    # its score climbs, so ageing requests naturally surface higher.
    wait_points = min(WEIGHTS["waiting_time_max"], minutes_waited // 30)
    if wait_points:
        factors.append({
            "name": "Time Waiting",
            "points": wait_points,
            "reason": f"Request has been waiting {minutes_waited} minutes.",
        })

    score = min(100, sum(f["points"] for f in factors))
    priority = score_to_priority(score)

    explanation = (
        f"Impact Score: {score}/100 → Priority: {priority.value}. "
        f"Computed from service criticality, people affected, urgency, "
        f"availability of alternatives and elapsed waiting time — "
        f"a fixed, configurable rule table (no AI/ML involved)."
    )

    return {
        "score": score,
        "priority": priority.value,
        "factors": factors,
        "explanation": explanation,
    }
