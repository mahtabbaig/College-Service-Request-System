from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import ensure_indexes
from app.routes import (
    auth, users, requests, services, departments, comments,
    notifications, dashboard, impact, sla, heatmap, recurring, audit, attachments,
)

app = FastAPI(
    title="College Service Request System API",
    description="Nexus Institute of Technology — Service Desk API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(requests.router)
app.include_router(services.router)
app.include_router(departments.router)
app.include_router(comments.router)
app.include_router(notifications.router)
app.include_router(dashboard.router)
app.include_router(impact.router)
app.include_router(sla.router)
app.include_router(heatmap.router)
app.include_router(recurring.router)
app.include_router(audit.router)
app.include_router(attachments.router)


@app.on_event("startup")
async def on_startup():
    await ensure_indexes()


@app.get("/")
async def root():
    return {"status": "ok", "service": "College Service Request System API"}


@app.get("/api/health")
async def health():
    return {"status": "healthy"}
