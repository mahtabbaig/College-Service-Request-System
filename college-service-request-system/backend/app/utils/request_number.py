from datetime import datetime
from pymongo import ReturnDocument
from app.database import counters_col


async def next_request_number() -> str:
    """
    Atomically increments a per-year counter and returns a human-readable
    request number like CSR-2026-00001. Uses MongoDB findOneAndUpdate with
    upsert for atomicity (no race conditions under concurrent requests).
    """
    year = datetime.utcnow().year
    counter_id = f"service_request_{year}"
    result = await counters_col.find_one_and_update(
        {"_id": counter_id},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    seq = result["seq"]
    return f"CSR-{year}-{seq:05d}"
