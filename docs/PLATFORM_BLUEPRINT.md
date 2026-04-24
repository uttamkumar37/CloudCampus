# CampusCloud platform blueprint

This document captures the **unified identity model**, **tenant DDL**, **new REST modules**, and **frontend role routing** introduced for a production-style school SaaS. Multi-tenancy remains **schema-per-tenant** with header `X-Tenant-ID` (PostgreSQL schema name, lowercased).

---

## 1. Unified user & authentication

### Principal: `CampusUserDetails`

All authenticated principals (bootstrap super-admin and tenant `UserAccount` rows) implement `UserDetails` via `CampusUserDetails`:

| Field | Description |
|--------|-------------|
| `userId` | UUID of `users.id` in the tenant schema; **null** for bootstrap super-admin |
| `username`, `password`, `authorities` | Standard Spring Security |
| `email`, `fullName` | From `UserAccount`; bootstrap may use placeholders |
| `tenantSchema` | Current schema / `public` for platform login |

### JWT claims

Issued by `JwtServiceImpl` in addition to `roles`:

- `tenant` — value from `TenantContext` at login time  
- `user_id` — UUID string when not bootstrap  
- `tenant_schema` — same as principal’s `tenantSchema`

### Login response (`POST /api/v1/auth/login`)

`LoginResponse` now includes:

- `userId` (UUID, nullable)  
- `tenantId` (`public` for super-admin, else active tenant schema)

### Current user (`GET /api/v1/auth/me`)

Returns `UserProfileResponse` for the authenticated principal (bootstrap returns role `SUPER_ADMIN` without DB row).

---

## 2. Database schema (per-tenant)

DDL is provisioned in `TenantServiceImpl.initializeTenantTables` (plus `ALTER ... ADD COLUMN IF NOT EXISTS` for older schemas).

### `users`

| Column | Notes |
|--------|--------|
| `id` UUID PK | |
| `full_name`, `username`, `email`, `password_hash`, `role` | |
| `tenant_id` VARCHAR(80) | Filled from `TenantContext` on create |
| `active`, `created_at` | |

### `students` / `teachers`

Optional link to login account:

- `user_id` UUID → `users(id)` nullable

### `parent_students`

| Column | Notes |
|--------|--------|
| `parent_user_id` | `users.id` with role `PARENT` |
| `student_id` | `students.id` |
| Unique `(parent_user_id, student_id)` | |

### `homework_assignments`

Teacher/admin-authored work tied to `class_id`, optional `section_id`, `assigned_by_user_id`, `due_date`.

### `timetable_slots`

Per class/section: `subject_id`, optional `teacher_id`, `day_of_week` (1–7), `start_time`, `end_time`, `label`.

---

## 3. REST API summary (v1)

| Area | Method | Path | Roles |
|------|--------|------|--------|
| Auth | POST | `/api/v1/auth/login` | Public |
| Auth | GET | `/api/v1/auth/me` | Authenticated |
| Homework | POST | `/api/v1/homework` | `SCHOOL_ADMIN`, `TEACHER` |
| Homework | GET | `/api/v1/homework/classes/{classId}` | All school roles |
| Timetable | POST | `/api/v1/timetable/slots` | `SCHOOL_ADMIN`, `TEACHER` |
| Timetable | GET | `/api/v1/timetable/classes/{classId}/sections/{sectionId}` | All school roles |
| Parent | GET | `/api/v1/parents/me/children` | `PARENT` |

Existing modules (`/students`, `/teachers`, `/academics`, `/attendances`, `/fees`, `/exams`, `/dashboard`, `/bulk`) stay as before.

---

## 4. Frontend role model

| Role | Experience |
|------|------------|
| `SUPER_ADMIN` | `/super-admin/*` — tenants, platform users (with tenant header when hitting tenant APIs) |
| `SCHOOL_ADMIN` / `TEACHER` | Full KPI dashboard + sidebar: students, teachers, academic, bulk (admin only), homework, timetable, attendance, fees, marks, profile |
| `STUDENT` / `PARENT` | Simplified home with cards → homework, timetable, attendance, fees, marks, profile; parents also **My children** |

Branding: `DashboardLayout` already applies `primaryColor` and `logoUrl` from tenant dashboard summary.

---

## 5. Next implementation steps

1. **Enrollment model** — `class_id` / `section_id` on `students` for scoped homework and timetable defaults.  
2. **Parent linking API** — `POST /api/v1/parents/links` (admin) to populate `parent_students`.  
3. **Homework submissions** — `homework_submissions` table + file metadata.  
4. **Wire hub pages** — Replace attendance/fees/marks stubs with TanStack Query + tables.  
5. **Integration tests** — `@SpringBootTest` with Testcontainers for auth + tenant isolation.  
6. **Payment gateway** — Optional adapter behind `FeesService`.

---

## 6. Testing notes

- **Unit**: Continue service-layer tests with `TenantContext` set/cleared.  
- **API**: Postman collection should set `baseUrl` = `http://localhost:8080/api/v1`; login stores `token` and use `X-Tenant-ID` for school routes.  
- **Edge cases**: Login without `X-Tenant-ID` for non–super-admin; homework create without tenant header; parent `/me/children` with no links.
