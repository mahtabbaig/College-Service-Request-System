"""
MongoDB connection (Motor async driver) and shared collection handles.
"""
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = AsyncIOMotorClient(settings.mongodb_uri)
db = client[settings.database_name]

# Collections
users_col = db["users"]
service_requests_col = db["service_requests"]
service_categories_col = db["service_categories"]
departments_col = db["departments"]
comments_col = db["comments"]
attachments_col = db["attachments"]
notifications_col = db["notifications"]
audit_logs_col = db["audit_logs"]
sla_configurations_col = db["sla_configurations"]
locations_col = db["locations"]
staff_workloads_col = db["staff_workloads"]
counters_col = db["counters"]  # used for request_number sequence


async def ensure_indexes():
    """Create indexes needed for correctness/performance. Safe to call repeatedly."""
    await users_col.create_index("email", unique=True)
    await service_requests_col.create_index("request_number", unique=True)
    await service_requests_col.create_index("requester_id")
    await service_requests_col.create_index("assigned_staff_id")
    await service_requests_col.create_index("status")
    await service_requests_col.create_index("service_category")
    await service_requests_col.create_index("location")
    await service_requests_col.create_index("created_at")
    await notifications_col.create_index("user_id")
    await comments_col.create_index("request_id")
    await audit_logs_col.create_index("request_id")
