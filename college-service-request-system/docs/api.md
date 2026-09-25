# API Reference (summary)

Base URL: `http://localhost:8000`. All endpoints except `/api/auth/register`
and `/api/auth/login*` require `Authorization: Bearer <token>`.

See the Postman collection at `postman/College-Service-Request-System.postman_collection.json`
for ready-to-run examples of every endpoint below, and the interactive
Swagger docs at `http://localhost:8000/docs` once the backend is running.

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/login-json`, `GET /api/auth/me` |
| Users | `GET /api/users` (admin), `GET /api/users/staff`, `POST /api/users` (admin), `DELETE /api/users/{id}` (admin) |
| Services | `GET /api/services` (categories + dynamic form fields) |
| Departments | `GET /api/departments` |
| Requests | `POST /api/requests`, `GET /api/requests`, `GET /api/requests/{id}`, `PATCH /api/requests/{id}/status`, `PATCH /api/requests/{id}/assign`, `PATCH /api/requests/{id}/workaround`, `PATCH /api/requests/{id}/confirm`, `GET /api/requests/{id}/audit` |
| Comments | `GET /api/comments/{request_id}`, `POST /api/comments/{request_id}` |
| Attachments | `GET /api/attachments/{request_id}`, `POST /api/attachments/{request_id}` (multipart) |
| Notifications | `GET /api/notifications`, `PATCH /api/notifications/{id}/read`, `PATCH /api/notifications/read-all` |
| Dashboard | `GET /api/dashboard/summary`, `GET /api/dashboard/charts` |
| Impact | `GET /api/impact/preview`, `GET /api/impact/weights` |
| SLA | `GET /api/sla/config` |
| Heatmap | `GET /api/heatmap` |
| Recurring | `GET /api/recurring` (lead/admin) |
| Audit | `GET /api/audit` (admin) |
