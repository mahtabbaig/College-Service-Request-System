"""
Shared pytest fixtures. Tests talk to a running MongoDB instance configured
via MONGODB_URI / DATABASE_NAME (defaults to a local 'college_service_request_test'
database so tests never touch your real data).
"""
import os
import sys
import asyncio
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

os.environ.setdefault("DATABASE_NAME", "college_service_request_test")
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app                      # noqa: E402
from app.database import db                    # noqa: E402


@pytest_asyncio.fixture(autouse=True)
async def clean_db():
    for name in await db.list_collection_names():
        await db[name].delete_many({})
    yield


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
