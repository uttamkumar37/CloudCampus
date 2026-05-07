# API Reference

Base URL: `http://localhost:8080/api/v1`

This is the concise API map. Use Swagger for the live contract and Postman for runnable request flows.

## Source of Truth

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Postman guide: [docs/postman/10_README.md](docs/postman/10_README.md)
- Collection: `docs/postman/CloudCampus.postman_collection.json`

## Conventions

Headers:

- `Authorization: Bearer <token>` for authenticated endpoints
- `X-Tenant-Slug: <slug>` for tenant-scoped endpoints
- `Content-Type: application/json` for JSON writes

Response envelope:

```json
{
  "success": true,
  "message": "Operation completed",
  "data": {}
}
```

Common statuses:

- `200` success
- `201` created
- `400` validation or malformed request
- `401` missing or invalid authentication
- `403` forbidden by role or plan
- `404` resource not found
- `409` duplicate or conflicting state

## Authentication and Session

| Area | Key endpoints | Notes |
|---|---|---|
| Auth | `POST /auth/login`, `GET /auth/me` | Super Admin omits `X-Tenant-Slug`; tenant users require it |
| Credential update | `POST /auth/credentials/send-otp`, `POST /auth/credentials/update` | Used for first-login enforcement |

## Platform Administration

| Area | Key endpoints | Role |
|---|---|---|
| Tenants | `GET /tenants`, `POST /tenants`, `PATCH /tenants/{tenantId}/status` | `SUPER_ADMIN` |
| Plans | `GET /plans`, `POST /plans` | `SUPER_ADMIN` for writes |
| Tenant subscriptions | `POST /tenants/{tenantId}/subscribe`, `GET /tenants/{tenantId}/subscription`, `DELETE /tenants/{tenantId}/subscription` | `SUPER_ADMIN` |
| Platform payments | `POST /payments`, `GET /payments/tenant/{tenantId}`, `POST /payments/webhook` | `SUPER_ADMIN` except webhook |
| Super Admin dashboard | `GET /dashboard/super-admin-summary` | `SUPER_ADMIN` |

## Tenant Operations

| Area | Key endpoints | Typical roles |
|---|---|---|
| Users | `GET /users`, `POST /users` | `SUPER_ADMIN`, `SCHOOL_ADMIN` |
| Students | `GET /students`, `POST /students`, `GET /students/{id}/details` | `SCHOOL_ADMIN`, read access for teachers |
| Teachers | `GET /teachers`, `POST /teachers`, `GET /teachers/{id}/details` | `SCHOOL_ADMIN`, read access for teachers |
| Academics | `GET/POST /academics/classes`, `subjects`, `sections` | `SCHOOL_ADMIN`, read access for teachers |
| Attendance | `POST /attendances`, `GET /attendances` | `SCHOOL_ADMIN`, `TEACHER` |
| Fees | `POST /fees/assignments`, `POST /fees/payments`, `GET /fees/students/{id}/assignments` | `SCHOOL_ADMIN`; read access for student and parent views |
| Exams | `POST /exams`, `POST /exams/results`, `GET /exams/{examId}/results` | `SCHOOL_ADMIN`, `TEACHER` |
| Homework | `POST /homework`, `GET /homework/classes/{classId}` | `SCHOOL_ADMIN`, `TEACHER` |
| Timetable | `POST /timetable/slots`, `GET /timetable/classes/{classId}/sections/{sectionId}` | `SCHOOL_ADMIN`, `TEACHER` |
| Parent links | `GET /parents/links`, `POST /parents/links`, `DELETE /parents/links/{id}` | `SCHOOL_ADMIN` |
| Parent portal | `GET /parents/me/children` | `PARENT` |
| Tenant dashboard | `GET /dashboard/tenant-summary` | Tenant-authenticated roles |

## Website and Public Endpoints

| Area | Key endpoints | Notes |
|---|---|---|
| Website builder | `GET /website/config`, `PUT /website/config`, section and gallery management endpoints | School-admin tenant management |
| Public website | `GET /public/website/{slug}`, `POST /public/website/{slug}/admission-leads` | Publicly accessible |

## Bulk Operations

| Area | Key endpoints | Notes |
|---|---|---|
| Bulk upload | Validation, preview, execute, job status endpoints under `/bulk` | Tenant-scoped, typically `SCHOOL_ADMIN` |

## How To Use This Document

- Use this file to find the right API area quickly.
- Use Swagger when you need exact payload schemas and current server behavior.
- Use Postman when you need end-to-end flows with tokens and tenant headers already wired.
- For roles, workflows, and billing rules, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
