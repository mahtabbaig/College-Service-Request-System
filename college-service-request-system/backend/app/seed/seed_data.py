"""
Seed script for "Nexus Institute of Technology" demo data.

Run with:  python -m app.seed.seed_data

Creates: departments, locations, demo users (all 5 roles), sla config docs,
and 50+ realistic service requests across categories/locations/statuses so
dashboards, the heatmap, and recurring-issue detection all have real data
to work with.

Safe to re-run: it wipes and recreates the collections it seeds.
"""
import asyncio
import random
from datetime import datetime, timedelta, timezone

from app.database import (
    users_col, departments_col, locations_col, service_requests_col,
    comments_col, notifications_col, audit_logs_col, counters_col,
    sla_configurations_col, ensure_indexes,
)
from app.utils.security import hash_password
from app.schemas.common import ServiceCategory
from app.services.impact_engine import calculate_impact
from app.services.sla_service import compute_deadlines, SLA_HOURS

DEMO_PASSWORD = "Demo@1234"

DEPARTMENTS = [
    "Academic Records Office",
    "Administration Office",
    "Hostel Management",
    "Transport Office",
    "Library Services",
    "IT Support Desk",
]

LOCATIONS = [
    "Academic Block A", "Academic Block B", "Hostel Block A", "Hostel Block B",
    "Library", "Admin Block", "Transport Office", "Computer Lab", "Student Center",
]

CATEGORY_LOCATION_BIAS = {
    ServiceCategory.HOSTEL: ["Hostel Block A", "Hostel Block B"],
    ServiceCategory.IT_SUPPORT: ["Computer Lab", "Academic Block A", "Academic Block B", "Library"],
    ServiceCategory.LIBRARY: ["Library"],
    ServiceCategory.TRANSPORT: ["Transport Office", "Student Center"],
    ServiceCategory.ID_CARD: ["Admin Block", "Student Center"],
    ServiceCategory.BONAFIDE_CERTIFICATE: ["Admin Block", "Academic Block A"],
}

FIRST_NAMES = ["Aarav", "Priya", "Rohan", "Neha", "Kabir", "Anaya", "Vikram", "Ishita",
               "Dev", "Meera", "Aditya", "Sanya", "Karan", "Riya", "Arjun", "Tara",
               "Nikhil", "Simran", "Yash", "Pooja", "Rahul", "Divya", "Sameer", "Alisha"]
LAST_NAMES = ["Sharma", "Verma", "Iyer", "Khan", "Nair", "Gupta", "Reddy", "Mehta",
              "Chopra", "Das", "Singh", "Rao"]

TITLES = {
    ServiceCategory.BONAFIDE_CERTIFICATE: [
        "Bonafide certificate for internship", "Bonafide certificate for bank loan",
        "Bonafide certificate for passport application",
    ],
    ServiceCategory.ID_CARD: ["Lost ID card — need reissue", "Damaged ID card replacement", "New ID card request"],
    ServiceCategory.HOSTEL: ["Water leakage in room", "Fan not working", "Broken window latch", "No hot water"],
    ServiceCategory.TRANSPORT: ["Bus route delay complaint", "New bus pass request", "Route change request"],
    ServiceCategory.LIBRARY: ["Book not available", "Fine dispute", "Printer not working"],
    ServiceCategory.IT_SUPPORT: ["Wi-Fi not working", "Projector not turning on", "Lab PC won't boot", "Email account locked"],
}

STATUSES_WEIGHTED = (
    ["NEW"] * 6 + ["ASSIGNED"] * 5 + ["IN_PROGRESS"] * 8 + ["ON_HOLD"] * 3 +
    ["RESOLVED"] * 8 + ["CLOSED"] * 18 + ["REOPENED"] * 2
)


async def wipe():
    for col in (users_col, departments_col, locations_col, service_requests_col,
                comments_col, notifications_col, audit_logs_col, counters_col):
        await col.delete_many({})


async def seed_departments():
    docs = [{"name": n, "created_at": datetime.now(timezone.utc)} for n in DEPARTMENTS]
    result = await departments_col.insert_many(docs)
    return {n: str(i) for n, i in zip(DEPARTMENTS, result.inserted_ids)}


async def seed_locations():
    docs = [{"name": n, "created_at": datetime.now(timezone.utc)} for n in LOCATIONS]
    await locations_col.insert_many(docs)


async def seed_sla_config():
    docs = [{"service_category": cat.value, "response_hours": v["response"], "resolution_hours": v["resolution"]}
            for cat, v in SLA_HOURS.items()]
    await sla_configurations_col.insert_many(docs)


async def make_user(name, email, role, department=None):
    return {
        "name": name, "email": email, "password_hash": hash_password(DEMO_PASSWORD),
        "role": role, "department": department, "phone": f"9{random.randint(100000000, 999999999)}",
        "created_at": datetime.now(timezone.utc) - timedelta(days=random.randint(30, 400)),
    }


async def seed_users():
    users = []

    # Demo accounts (one per role, memorable emails)
    users.append(await make_user("Aarav Sharma", "student@college.demo", "STUDENT"))
    users.append(await make_user("Dr. Neha Iyer", "faculty@college.demo", "FACULTY"))
    users.append(await make_user("Rohan Verma", "staff@college.demo", "SERVICE_STAFF", "IT Support Desk"))
    users.append(await make_user("Priya Nair", "lead@college.demo", "SERVICE_LEAD", "IT Support Desk"))
    users.append(await make_user("Admin User", "admin@college.demo", "ADMIN"))

    # Extra students/faculty
    for i in range(12):
        fn, ln = random.choice(FIRST_NAMES), random.choice(LAST_NAMES)
        users.append(await make_user(f"{fn} {ln}", f"student{i+1}@college.demo", "STUDENT"))
    for i in range(5):
        fn, ln = random.choice(FIRST_NAMES), random.choice(LAST_NAMES)
        users.append(await make_user(f"Dr. {fn} {ln}", f"faculty{i+1}@college.demo", "FACULTY"))

    # Staff spread across all departments (2 each)
    for dept in DEPARTMENTS:
        for i in range(2):
            fn, ln = random.choice(FIRST_NAMES), random.choice(LAST_NAMES)
            slug = dept.split()[0].lower()
            users.append(await make_user(f"{fn} {ln}", f"{slug}.staff{i+1}@college.demo", "SERVICE_STAFF", dept))

    # One additional lead
    users.append(await make_user("Karan Singh", "lead2@college.demo", "SERVICE_LEAD", "Hostel Management"))

    result = await users_col.insert_many(users)
    for u, _id in zip(users, result.inserted_ids):
        u["_id"] = _id
    return users


def _next_number(counters: dict, year: int) -> str:
    counters[year] = counters.get(year, 0) + 1
    return f"CSR-{year}-{counters[year]:05d}"


async def seed_requests(users, dept_ids):
    students_faculty = [u for u in users if u["role"] in ("STUDENT", "FACULTY")]
    staff = [u for u in users if u["role"] == "SERVICE_STAFF"]

    requests_docs = []
    comments_docs = []
    audit_docs = []
    counters = {}

    # Deliberately create a recurring cluster: repeated water issues in Hostel Block B
    forced_recurring = [
        (ServiceCategory.HOSTEL, "Hostel Block B", "Water leakage in room", 40),
        (ServiceCategory.HOSTEL, "Hostel Block B", "Water leakage in room", 25),
        (ServiceCategory.HOSTEL, "Hostel Block B", "Water leakage in room", 12),
        (ServiceCategory.HOSTEL, "Hostel Block B", "Water leakage in room", 3),
        (ServiceCategory.IT_SUPPORT, "Computer Lab", "Wi-Fi not working", 20),
        (ServiceCategory.IT_SUPPORT, "Computer Lab", "Wi-Fi not working", 9),
        (ServiceCategory.IT_SUPPORT, "Computer Lab", "Wi-Fi not working", 2),
    ]

    total_count = 55
    now = datetime.now(timezone.utc)

    def build_request(category, location, title, days_ago, forced_status=None):
        requester = random.choice(students_faculty)
        created_at = now - timedelta(days=days_ago, hours=random.randint(0, 20))
        year = created_at.year
        req_num = _next_number(counters, year)

        people_affected = {
            ServiceCategory.HOSTEL: random.randint(1, 40),
            ServiceCategory.IT_SUPPORT: random.randint(1, 120),
            ServiceCategory.LIBRARY: random.randint(1, 5),
            ServiceCategory.TRANSPORT: random.randint(5, 60),
            ServiceCategory.ID_CARD: 1,
            ServiceCategory.BONAFIDE_CERTIFICATE: 1,
        }[category]
        urgency = random.choice(["NORMAL", "NORMAL", "URGENT"])
        impact = calculate_impact(category, people_affected, urgency, 0)
        deadlines = compute_deadlines(category, created_at)

        status = forced_status or random.choice(STATUSES_WEIGHTED)
        dept_id = dept_ids.get({
            ServiceCategory.BONAFIDE_CERTIFICATE: "Academic Records Office",
            ServiceCategory.ID_CARD: "Administration Office",
            ServiceCategory.HOSTEL: "Hostel Management",
            ServiceCategory.TRANSPORT: "Transport Office",
            ServiceCategory.LIBRARY: "Library Services",
            ServiceCategory.IT_SUPPORT: "IT Support Desk",
        }[category])

        assigned_staff, assigned_at, started_at, resolved_at, closed_at = None, None, None, None, None
        eligible_staff = [s for s in staff if s.get("department") == {
            ServiceCategory.BONAFIDE_CERTIFICATE: "Academic Records Office",
            ServiceCategory.ID_CARD: "Administration Office",
            ServiceCategory.HOSTEL: "Hostel Management",
            ServiceCategory.TRANSPORT: "Transport Office",
            ServiceCategory.LIBRARY: "Library Services",
            ServiceCategory.IT_SUPPORT: "IT Support Desk",
        }[category]] or staff

        if status != "NEW":
            assigned_staff = random.choice(eligible_staff)
            assigned_at = created_at + timedelta(hours=random.randint(1, 6))
        if status in ("IN_PROGRESS", "ON_HOLD", "RESOLVED", "CLOSED", "REOPENED"):
            started_at = (assigned_at or created_at) + timedelta(hours=random.randint(1, 5))
        if status in ("RESOLVED", "CLOSED"):
            resolved_at = (started_at or created_at) + timedelta(hours=random.randint(1, 30))
        if status == "CLOSED":
            closed_at = resolved_at + timedelta(hours=random.randint(1, 10))

        doc = {
            "request_number": req_num,
            "requester_id": str(requester["_id"]),
            "requester_name": requester["name"],
            "requester_role": requester["role"],
            "service_category": category.value,
            "department_id": dept_id,
            "title": title,
            "description": f"{title}. Reported at {location}.",
            "form_data": {},
            "location": location,
            "priority": impact["priority"],
            "impact_score": impact["score"],
            "impact_factors": impact["factors"],
            "people_affected": people_affected,
            "sla_response_deadline": deadlines["sla_response_deadline"],
            "sla_resolution_deadline": deadlines["sla_resolution_deadline"],
            "assigned_staff_id": str(assigned_staff["_id"]) if assigned_staff else None,
            "assigned_staff_name": assigned_staff["name"] if assigned_staff else None,
            "status": status,
            "workaround": None,
            "created_at": created_at,
            "assigned_at": assigned_at,
            "started_at": started_at,
            "resolved_at": resolved_at,
            "closed_at": closed_at,
            "updated_at": closed_at or resolved_at or started_at or assigned_at or created_at,
        }
        requests_docs.append(doc)

        audit_docs.append({
            "request_id": None,  # filled after insert
            "_tmp_index": len(requests_docs) - 1,
            "actor_id": str(requester["_id"]), "actor_name": requester["name"], "actor_role": requester["role"],
            "action": "CREATED", "details": f"{requester['name']} created {req_num}", "created_at": created_at,
        })
        if assigned_staff:
            audit_docs.append({
                "request_id": None, "_tmp_index": len(requests_docs) - 1,
                "actor_id": "system", "actor_name": "Service Lead", "actor_role": "SERVICE_LEAD",
                "action": "ASSIGNED", "details": f"Assigned to {assigned_staff['name']}", "created_at": assigned_at,
            })
        if status in ("RESOLVED", "CLOSED"):
            comments_docs.append({
                "request_id": None, "_tmp_index": len(requests_docs) - 1,
                "author_id": str(assigned_staff["_id"]) if assigned_staff else "system",
                "author": assigned_staff["name"] if assigned_staff else "Staff",
                "role": "SERVICE_STAFF", "message": "Issue resolved. Please confirm on your end.",
                "created_at": resolved_at,
            })

    for cat, loc, title, days_ago in forced_recurring:
        build_request(cat, loc, title, days_ago)

    for _ in range(total_count - len(forced_recurring)):
        category = random.choice(list(ServiceCategory))
        location = random.choice(CATEGORY_LOCATION_BIAS.get(category, LOCATIONS))
        title = random.choice(TITLES[category])
        days_ago = random.randint(0, 90)
        build_request(category, location, title, days_ago)

    result = await service_requests_col.insert_many(requests_docs)
    ids = result.inserted_ids

    for a in audit_docs:
        a["request_id"] = str(ids[a.pop("_tmp_index")])
    for c in comments_docs:
        c["request_id"] = str(ids[c.pop("_tmp_index")])

    if audit_docs:
        await audit_logs_col.insert_many(audit_docs)
    if comments_docs:
        await comments_col.insert_many(comments_docs)

    return len(requests_docs)


async def main():
    print("Wiping existing demo collections...")
    await wipe()
    await ensure_indexes()

    print("Seeding departments & locations...")
    dept_ids = await seed_departments()
    await seed_locations()
    await seed_sla_config()

    print("Seeding users...")
    users = await seed_users()

    print("Seeding service requests, comments, audit logs...")
    count = await seed_requests(users, dept_ids)

    print(f"\nSeed complete: {len(users)} users, {count} requests.\n")
    print("Demo accounts (all use password: {})".format(DEMO_PASSWORD))
    for email, role in [
        ("student@college.demo", "STUDENT"),
        ("faculty@college.demo", "FACULTY"),
        ("staff@college.demo", "SERVICE_STAFF"),
        ("lead@college.demo", "SERVICE_LEAD"),
        ("admin@college.demo", "ADMIN"),
    ]:
        print(f"  {role:15s} {email}")


if __name__ == "__main__":
    asyncio.run(main())
