# CloudCampus — Documentation Index

> **Start here.** Follow the numbered reading order below to go from zero to fully productive with CloudCampus.

---

## Reading Path

```
New to the project?          → Read 1 → 2 → 3 → 4
Setting it up locally?       → Read 1 → 5
Building features / APIs?    → Read 6 → 7
Testing APIs manually?       → Read 8 → 9
Understanding billing/plans? → Read 10 → 11
Tracking progress?           → Read 12 → 13
```

---

## 1. [02_SETUP.md](./02_SETUP.md)
**Start here — run the project locally**

Everything you need to get CloudCampus running:
- Docker Compose quick start (recommended)
- Manual local setup (Java + Node + PostgreSQL)
- Environment variables reference
- First-time initialization (bootstrap super admin)
- Troubleshooting

---

## 2. [03_ARCHITECTURE.md](./03_ARCHITECTURE.md)
**Understand the system design**

How CloudCampus is built:
- High-level architecture diagram
- Technology stack (Spring Boot 3.4, React + Vite, PostgreSQL)
- Backend layering (Controller → Service → Repository)
- Frontend architecture (TanStack Query, React Router v6)
- Multi-tenant schema-per-tenant design
- Database schema overview
- Authentication & Authorization flow
- Request lifecycle (TenantFilter → JwtFilter → Controller)

---

## 3. [04_PLATFORM_BLUEPRINT.md](./04_PLATFORM_BLUEPRINT.md)
**Understand how the platform works end-to-end**

Workflows for every role and every feature:
- What is a tenant? How is one created?
- Super Admin workflows
- School Admin workflows
- Teacher workflows (attendance, homework, exams)
- Student workflows (view marks, timetable, homework)
- Parent workflows (monitor children)
- Fee payment lifecycle
- Timetable system
- Bulk upload system
- Subscription & billing system

---

## 4. [05_ROLE_MATRIX.md](./05_ROLE_MATRIX.md)
**Who can do what — security reference**

- Role definitions (SUPER_ADMIN → PARENT)
- Permission matrix: every feature vs every role
- Spring Security `@PreAuthorize` patterns used
- JWT token claims structure (`role`, `tenant`, `user_id`)

---

## 5. [06_TENANT_DETAILS.txt](./06_TENANT_DETAILS.txt)
**Sample tenant seed data**

Pre-configured school tenants for local development and testing:
- `sunrise-academy` / `greenwood-high` / `riverdale-public` / `oakridge-international`
- Use these `tenantId` values as the `X-Tenant-Slug` header

---

## 6. [07_API_REFERENCE.md](./07_API_REFERENCE.md)
**Quick lookup — all endpoints at a glance**

One-line summary of every REST endpoint in the system:
- Method, path, description, auth required, roles allowed
- Great as a quick cheat sheet while building

---

## 7. [08_API.md](./08_API.md)
**Full API documentation**

Complete request/response documentation for every endpoint:
- Request body schemas with field-level validation rules
- Sample JSON bodies (copy-paste ready)
- Response envelopes and error codes
- Business rules per endpoint
- Role access per endpoint

> Covers: Auth, Tenants, Users, Students, Teachers, Academic, Attendance, Fees, Exams, Homework, Timetable, Parents, Dashboard, Bulk Upload, Plans, Subscriptions, Payments

---

## 8. [09_TESTING.md](./09_TESTING.md)
**Test the system — backend and API**

- Running backend unit tests (`mvn test`)
- Unit test coverage summary (User, Exam, Fees services)
- Manual API testing with `curl` — full examples
- Role-based auth test cases:
  - Login as TEACHER / STUDENT / PARENT
  - Expected 200 vs 403 vs 401 per endpoint
- Postman collection usage

---

## 9. [postman/10_README.md](./postman/10_README.md)
**Postman collection guide**

How to import and use the Postman collection:
- Import steps for collection + environment
- Environment variable reference
- Pre-request scripts (auto-sets `X-Tenant-Slug`)
- Test scripts (auto-saves token to environment)
- Includes: Super Admin login, School Admin login, **Teacher login**, **Student login**, **Parent login**

---

## 10. [11_PRICING.md](./11_PRICING.md)
**Subscription plan tiers**

- Plan comparison table: FREE / BASIC / PRO / ENTERPRISE
- Per-plan feature availability
- Student and teacher limits per plan

---

## 11. [12_PAYMENT_FLOW.md](./12_PAYMENT_FLOW.md)
**Billing and payment lifecycle**

- Current v1 model (manual payment recording by Super Admin)
- Subscription lifecycle (PENDING → ACTIVE → EXPIRED)
- API flow for assigning a plan and recording payment
- Future payment gateway integration notes

---

## 12. [13_PROJECT_TRACKER.md](./13_PROJECT_TRACKER.md)
**What has been built**

- Completed features (31 tasks)
- In-progress features (4 tasks)
- Pending features (6 tasks)
- Summary of each module's build status

---

## 13. [14_PENDING_TASKS.md](./14_PENDING_TASKS.md)
**What is next**

- Prioritized backlog (🔴 High / 🟡 Medium / 🟢 Low)
- In-progress tasks
- Technical debt items
- Planned integration tests

---

## 14. [15_COMMANDS.md](./15_COMMANDS.md)
**All commands cheatsheet**

- Docker Compose (up, down, build, logs, shell)
- Local development without Docker (backend + frontend)
- Maven build/test/package commands
- Git workflow commands
- PostgreSQL / psql commands
- GitHub Actions CI/CD — how to trigger manually, how to re-enable
- Useful one-liners for debugging

---

## Quick Reference

### Key URLs (local)

| Service | URL |
|---------|-----|
| Backend API | `http://localhost:8080/api/v1` |
| Swagger UI | `http://localhost:8080/swagger-ui.html` |
| Frontend | `http://localhost:5173` |
| PostgreSQL | `localhost:5432` / db: `cloudcampus` |

### Default Login

| Role | Username | Header |
|------|----------|--------|
| Super Admin | `superadmin` (from env `BOOTSTRAP_ADMIN_USERNAME`) | No `X-Tenant-Slug` |
| School Admin | Tenant-specific (created via API) | `X-Tenant-Slug: <schema>` |
| Teacher / Student / Parent | Tenant-specific (created via API) | `X-Tenant-Slug: <schema>` |

### JWT Token Structure

```json
{
  "sub": "username",
  "role": "TEACHER",
  "roles": ["ROLE_TEACHER"],
  "tenant": "greenwood",
  "tenant_schema": "greenwood",
  "user_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Frontend Routes After Login

| Role | Lands on |
|------|----------|
| SUPER_ADMIN | `/super-admin/dashboard` |
| SCHOOL_ADMIN | `/dashboard` |
| TEACHER | `/teacher/dashboard` |
| STUDENT | `/student/dashboard` |
| PARENT | `/parent/dashboard` |
