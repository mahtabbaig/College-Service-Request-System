"""
routing_service.py

RULE-BASED SERVICE ROUTING (explicitly not AI). Maps a service category +
location to a suggested department, and suggests a staff member using
current workload counts (fewest active assignments first). The Service
Lead always makes the final assignment — this only produces a suggestion.
"""
from typing import Dict, Any, Optional, List
from app.schemas.common import ServiceCategory
from app.database import departments_col, users_col, service_requests_col

CATEGORY_DEPARTMENT_MAP = {
    ServiceCategory.BONAFIDE_CERTIFICATE: "Academic Records Office",
    ServiceCategory.ID_CARD: "Administration Office",
    ServiceCategory.HOSTEL: "Hostel Management",
    ServiceCategory.TRANSPORT: "Transport Office",
    ServiceCategory.LIBRARY: "Library Services",
    ServiceCategory.IT_SUPPORT: "IT Support Desk",
}


async def suggest_routing(category: ServiceCategory, location: str) -> Dict[str, Any]:
    dept_name = CATEGORY_DEPARTMENT_MAP.get(category, "General Service Desk")
    dept = await departments_col.find_one({"name": dept_name})

    # Find staff in that department, ranked by current open-request workload
    staff_cursor = users_col.find({"role": "SERVICE_STAFF", "department": dept_name})
    staff_list: List[Dict[str, Any]] = [s async for s in staff_cursor]

    suggestion = None
    if staff_list:
        workloads = []
        for s in staff_list:
            open_count = await service_requests_col.count_documents({
                "assigned_staff_id": str(s["_id"]),
                "status": {"$in": ["ASSIGNED", "IN_PROGRESS", "ON_HOLD"]},
            })
            workloads.append((open_count, s))
        workloads.sort(key=lambda x: x[0])
        best = workloads[0][1]
        suggestion = {
            "staff_id": str(best["_id"]),
            "staff_name": best["name"],
            "current_open_requests": workloads[0][0],
        }

    return {
        "routing_method": "RULE_BASED_SERVICE_ROUTING",
        "suggested_department": dept_name,
        "department_id": str(dept["_id"]) if dept else None,
        "suggested_staff": suggestion,
        "explanation": (
            f"Category '{category.value}' routes to '{dept_name}' by fixed mapping. "
            f"Staff suggestion (if any) is the staff member in that department with "
            f"the fewest currently open assignments. Final assignment is made by the Service Lead."
        ),
    }
