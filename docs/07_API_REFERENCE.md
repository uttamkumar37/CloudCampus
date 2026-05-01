# CloudCampus API Reference

Version: 2026-05-01
Base URL: http://localhost:8080/api/v1

## Contract Envelope

All endpoints return:

```json
{
  "success": true,
  "message": "string",
  "data": {}
}
```

## Tenant Context

- Tenant-scoped APIs require X-Tenant-Slug
- Legacy X-Tenant-ID is still accepted during compatibility period
- Super-admin platform APIs do not require tenant header

## Authentication

| Method | Path | Auth | Tenant Header |
|---|---|---|---|
| POST | /auth/login | Public | Optional (required for non-super-admin) |
| POST | /auth/logout | Authenticated | Optional |
| GET | /auth/me | Authenticated | Required for tenant users |
| POST | /auth/change-password | Authenticated | Required for tenant users |

Login request example:

```json
{
  "username": "teacher01",
  "password": "********",
  "tenantSlug": "greenwood",
  "role": "TEACHER"
}
```

## Tenant APIs

| Method | Path | Roles |
|---|---|---|
| POST | /tenants | SUPER_ADMIN |
| GET | /tenants | SUPER_ADMIN |
| GET | /tenants/{tenantId} | SUPER_ADMIN |
| GET | /tenants/schools/search?query=... | Public |
| GET | /tenants/schools/{tenantSlug} | Public |

## Domain APIs (Tenant Scoped)

- Users: /users
- Students: /students
- Teachers: /teachers
- Academic: /academics/*
- Attendance: /attendances
- Fees: /fees/*
- Exams: /exams/*
- Homework: /homework/*
- Timetable: /timetable/*
- Parent: /parents/*
- Dashboard: /dashboard/tenant-summary, /dashboard/student, /dashboard/teacher

All above require:

- Valid auth cookie
- Correct tenant context header
- Role authorization via @PreAuthorize

## Super Admin APIs

- /dashboard/super-admin-summary
- /plans
- /tenants/{tenantId}/subscribe
- /tenants/{tenantId}/subscription
- /payments
- /payments/tenant/{tenantId}

## Common Error Statuses

- 400: validation/business rule failure
- 401: unauthenticated or invalid token
- 403: authenticated but insufficient role
- 404: resource not found
- 500: unhandled server error

## Pagination

Paginated endpoints support:

- page (default 0)
- size (default endpoint-specific)
- sort (field,direction)

## Notes

- External clients should rely on slug-based tenant context.
- Avoid depending on internal database identifiers in UI contracts.
