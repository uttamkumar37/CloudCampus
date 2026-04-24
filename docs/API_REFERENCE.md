# CampusCloud REST API reference

This document describes the **primary versioned API** under the `/api/v1` prefix, aligned with the React client (`API_BASE_URL = http://localhost:8080/api/v1`).

| Item | Value |
|------|--------|
| Base URL (local) | `http://localhost:8080` |
| API prefix (v1) | `/api/v1` |
| OpenAPI (Swagger UI) | `http://localhost:8080/swagger-ui.html` |
| OpenAPI JSON | `http://localhost:8080/v3/api-docs` |
| Default tenant header | `X-Tenant-ID` — PostgreSQL **schema** name (lowercased in filter), or `public` for bootstrap / super-admin flows when no tenant is set |

**Response envelope (typical):** `ApiResponse<T>`

```json
{
  "success": true,
  "message": "…",
  "data": { },
  "timestamp": "2026-04-25T00:00:00Z"
}
```

**Authentication:** `Authorization: Bearer <accessToken>` (issued by `POST /api/v1/auth/login`).

> **Note:** The codebase may also contain unversioned or duplicate controllers under `/api/auth`, `/api/dashboard`, `/api/tenants`, etc. Those are not the canonical surface for the frontend; use `/api/v1` and resolve any duplicate Spring `RestController` bean names before production deployment.

---

## Authentication

### `POST /api/v1/auth/login`

Obtains a JWT. For non–`SUPER_ADMIN` users, send **`X-Tenant-ID`** with the **tenant schema name** (must match a registered `tenants.schema_name` and align with the resolved tenant in `TenantContext`).

**Response `data`** (`LoginResponse`) also includes `userId` (UUID, null for bootstrap super-admin) and `tenantId` (`public` or tenant schema).

### `GET /api/v1/auth/me`

Requires `Authorization: Bearer …`. Returns `UserProfileResponse` (`userId`, `username`, `email`, `fullName`, `role`, `active`, `tenantSchema`).

**Request body**

| Field | Type | Required |
|--------|------|----------|
| `username` | string | yes |
| `password` | string | yes |

**Response `data` (`LoginResponse`)**

| Field | Type |
|--------|------|
| `accessToken` | string |
| `tokenType` | string (e.g. `Bearer`) |
| `expiresIn` | number (seconds) |
| `username` | string |
| `role` | string (primary role) |
| `roles` | set of `ROLE_…` strings as returned from authorities |
| `userId` | UUID (nullable) |
| `tenantId` | string |

**Example**

```http
POST /api/v1/auth/login
Content-Type: application/json
X-Tenant-ID: myschool_schema

{"username":"admin","password":"********"}
```

---

## Tenants

All routes require a valid JWT (roles per controller — typically `SUPER_ADMIN` for management).

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/tenants` | Create tenant (registry + schema DDL) — body `TenantCreateRequest` |
| `GET` | `/api/v1/tenants` | List tenants |
| `GET` | `/api/v1/tenants/{tenantId}` | Get by **business** `tenantId` (slug) |

**`TenantCreateRequest` (abridged)**

| Field | Notes |
|--------|--------|
| `tenantId` | `^[a-z0-9_-]+$`, max 50 |
| `schoolName` | max 150 |
| `schemaName` | optional; `^[a-z0-9_]*$` up to 63; derived from `tenantId` if blank |
| `logoUrl` | optional; `http`/`https` or empty |
| `primaryColor` | required; `#RRGGBB` or `#RGB` |

---

## Users

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/users` | Create user in **current** tenant — `UserCreateRequest` |
| `GET` | `/api/v1/users` | Paginated list — `page`, `size`, `sort` |

**`UserCreateRequest`:** `fullName`, `username`, `email`, `password`, `role` (`UserRole` enum: `SCHOOL_ADMIN`, `TEACHER`, etc.).

**Requires** `X-Tenant-ID` for tenant operations (not `public` for these services).

---

## Students

| Method | Path |
|--------|------|
| `POST` | `/api/v1/students` |
| `GET` | `/api/v1/students` |
| `GET` | `/api/v1/students/{id}` |

Use student create DTOs from OpenAPI (admission number, name, DOB, gender, etc.).

---

## Teachers

| Method | Path |
|--------|------|
| `POST` | `/api/v1/teachers` |
| `GET` | `/api/v1/teachers` |
| `GET` | `/api/v1/teachers/{id}` |

---

## Academics

| Method | Path |
|--------|------|
| `POST` | `/api/v1/academics/classes` |
| `GET` | `/api/v1/academics/classes` |
| `POST` | `/api/v1/academics/subjects` |
| `GET` | `/api/v1/academics/subjects` |
| `POST` | `/api/v1/academics/sections` |
| `GET` | `/api/v1/academics/sections` |

---

## Dashboard (v1)

| Method | Path | Roles (typical) |
|--------|------|------------------|
| `GET` | `/api/v1/dashboard/tenant-summary` | School / teacher / student / parent |
| `GET` | `/api/v1/dashboard/branding` | Same |
| `GET` | `/api/v1/dashboard/super-admin-summary` | `SUPER_ADMIN` |

---

## Bulk upload

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/api/v1/bulk/sample` | `SCHOOL_ADMIN` — download XLSX |
| `POST` | `/api/v1/bulk/upload` | `multipart/form-data` field `file` — max size enforced in service |

---

## Fees

| Method | Path |
|--------|------|
| `POST` | `/api/v1/fees/assignments` |
| `POST` | `/api/v1/fees/payments` |
| `GET` | `/api/v1/fees/students/{studentId}/assignments` |

**Bodies:** `FeeAssignmentCreateRequest`, `FeePaymentCreateRequest` (see `com.campuscloud.fees.dto`).

---

## Exams

| Method | Path |
|--------|------|
| `POST` | `/api/v1/exams` |
| `GET` | `/api/v1/exams/classes/{classId}` |
| `POST` | `/api/v1/exams/results` |
| `GET` | `/api/v1/exams/{examId}/results` |

**Bodies:** `ExamCreateRequest`, `ExamResultCreateRequest` (see `com.campuscloud.exam.dto`).

---

## Attendance

| Method | Path |
|--------|------|
| `POST` | `/api/v1/attendances` |
| `GET` | `/api/v1/attendances` |
| `GET` | `/api/v1/attendances/{attendanceId}` |

**`AttendanceStatus`:** `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`.

---

## Homework (v1)

| Method | Path | Roles |
|--------|------|--------|
| `POST` | `/api/v1/homework` | `SCHOOL_ADMIN`, `TEACHER` |
| `GET` | `/api/v1/homework/classes/{classId}` | `SCHOOL_ADMIN`, `TEACHER`, `STUDENT`, `PARENT` |

## Timetable (v1)

| Method | Path | Roles |
|--------|------|--------|
| `POST` | `/api/v1/timetable/slots` | `SCHOOL_ADMIN`, `TEACHER` |
| `GET` | `/api/v1/timetable/classes/{classId}/sections/{sectionId}` | All school roles |

## Parent portal (v1)

| Method | Path | Roles |
|--------|------|--------|
| `GET` | `/api/v1/parents/me/children` | `PARENT` |

Populate `parent_students` (SQL or future admin API) to link parent `users.id` to `students.id`.

---

## Environment variables (backend)

See `application.yml` and `.env.example` for: `DB_*`, `JWT_SECRET` (used by the v1 JWT service as `app.security.jwt.secret`), `BOOTSTRAP_ADMIN_*`, `SERVER_PORT`, etc.

---

## Postman

Import:

- `postman/CampusCloud.postman_collection.json`
- `postman/CampusCloud.local.postman_environment.json`

Set **`baseUrl`** in the environment to `http://localhost:8080/api/v1` (required for collection paths that omit `/api/v1`).

Use the collection at `postman/CampusCloud.postman_collection.json` (with the local environment for variables).
