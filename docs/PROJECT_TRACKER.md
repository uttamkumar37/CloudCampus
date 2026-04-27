# CampusCloud — Project Tracker

> Last Updated: 2026-04-28 | Reflects actual codebase state

---

## Summary

| Status | Count |
|--------|-------|
| ✅ Completed | 31 |
| ⚠️ In Progress | 4 |
| ❌ Pending | 6 |

---

## ✅ Completed Features

### Infrastructure & Foundation

| # | Task | Module | Notes |
|---|------|--------|-------|
| 1 | Spring Boot 3.4.4 project setup | Infrastructure | Java 17, Maven, clean package structure |
| 2 | PostgreSQL multi-tenant schema-per-tenant design | Database | Flyway migrations V1, V2 |
| 3 | JWT authentication (HS256, 1-hour TTL) | Auth | JJWT 0.12.6, stateless |
| 4 | Spring Security configuration | Security | BCrypt, custom entry point and access denied handler |
| 5 | Multi-tenancy infrastructure | Tenant | `TenantContext`, `TenantRequestFilter`, Hibernate schema routing |
| 6 | Uniform `ApiResponse<T>` + `PageResponse<T>` | Common | All endpoints use this envelope |
| 7 | `GlobalExceptionHandler` | Common | Handles validation, business, and runtime errors |
| 8 | Swagger/OpenAPI 3.0 documentation | Config | `/swagger-ui.html`, `/v3/api-docs` |
| 9 | Docker + Docker Compose setup | Infrastructure | postgres:16, backend, frontend services |
| 10 | Build and dev scripts | Scripts | `build.sh`, `start-dev.sh` |

### Backend Domain Modules

| # | Task | Module | Key Features |
|---|------|--------|--------------|
| 11 | Tenant CRUD + schema provisioning | Tenant | `POST /tenants`, auto-creates 13 tables |
| 12 | User management | User | Create + list users, BCrypt hashing, role enum |
| 13 | Student enrollment | Student | UPPERCASE admission no, uniqueness, pagination |
| 14 | Teacher management | Teacher | UPPERCASE employee no, unique email, pagination |
| 15 | Academic structure (classes, subjects, sections) | Academic | Unique codes, FK relationships |
| 16 | Attendance tracking | Attendance | UNIQUE(student, date), status enum, future-date guard |
| 17 | Fee management | Fees | Assignment + payment, auto status transitions (PENDING→PARTIALLY_PAID→PAID) |
| 18 | Exam scheduling + results | Exam | Duplicate guard, marks overflow guard, one result per student per exam |
| 19 | Homework assignments | Homework | Per class/section, with due date |
| 20 | Timetable slots | Timetable | dayOfWeek (1–7), time validation |
| 21 | Parent portal (linked children) | Parent | `parent_students` table, `GET /me/children` |
| 22 | Dashboard (tenant summary + super admin summary) | Dashboard | KPI cards, branding |
| 23 | Bulk upload (Excel via Apache POI) | Bulk | Students, Teachers, Classes, Sections sheets |
| 24 | Unit tests (User, Exam, Fees services) | Testing | JUnit 5 + Mockito, ~33 tests |

### Frontend

| # | Task | Module | Notes |
|---|------|--------|-------|
| 25 | React 19 + TypeScript + Vite + Tailwind CSS setup | Frontend | Clean project structure |
| 26 | Auth module (login, JWT, route guards) | Auth | `useAuth` hook, `PrivateRoute`, `PublicRoute` |
| 27 | Dashboard page with KPI cards | Dashboard | `useTenantDashboardSummary` hook |
| 28 | Student module (list, create, pagination) | Student | Full CRUD UI with DataTable and form |
| 29 | Super Admin module (tenant list + create, user list) | Super Admin | Separate layout + routes |
| 30 | Subscription plans backend (entities, repos, DTOs, services, controllers) | Subscription | Flyway V3, 4 enums, 3 entities, 7 endpoints |
| 31 | Tenant subscription & payment backend | Subscription | Subscribe/cancel/record, SubscriptionGuardService (fail-open) |
| 32 | Subscription UI (Super Admin) | Frontend/Subscription | SubscriptionPlansPage, TenantSubscriptionPage, subscriptionApi, hooks |
| 33 | Role-based dashboards (Teacher, Student, Parent) | Frontend/Dashboard | Distinct views per role using existing summary data |

---

## ⚠️ In Progress

| # | Task | Module | Status |
|---|------|--------|--------|
| 32 | Frontend UX hardening | Frontend (all) | Error boundaries, loading states, form validation messages partially done |

---

## ❌ Pending

| # | Task | Module | Priority | Description |
|---|------|--------|----------|-------------|
| 38 | Attendance, Fees, Marks UI | Frontend | High | Hub pages are stubs — need full form + list implementation |
| 39 | Homework + Timetable UI | Frontend | High | Read-only views needed for all roles |
| 40 | Parent portal UI | Frontend | Medium | `MyChildrenPage` is a stub |
| 41 | Ownership-aware authorization | Backend/Security | High | Students/parents should only access their own data |
| 42 | Audit logging (created_by, updated_by) | Backend | Medium | JPA auditing with `@CreatedBy`, `@LastModifiedBy` |
| 43 | Integration tests (Testcontainers) | Testing | Medium | `@SpringBootTest` + real PostgreSQL container |

---

## Module Status Summary

| Module | Backend | Frontend |
|--------|---------|----------|
| Auth | ✅ Complete | ✅ Complete |
| Tenant Management | ✅ Complete | ✅ Complete |
| User Management | ✅ Complete | ✅ Complete |
| Students | ✅ Complete | ✅ Complete |
| Teachers | ✅ Complete | ⚠️ In Progress |
| Academic (Classes/Subjects/Sections) | ✅ Complete | ⚠️ In Progress |
| Attendance | ✅ Complete | ❌ Pending |
| Fees | ✅ Complete | ❌ Pending |
| Exams / Marks | ✅ Complete | ❌ Pending |
| Homework | ✅ Complete | ❌ Pending |
| Timetable | ✅ Complete | ❌ Pending |
| Parent Portal | ✅ Complete | ❌ Pending |
| Dashboard | ✅ Complete | ✅ Complete |
| Bulk Upload | ✅ Complete | ❌ Pending |
| Subscription Plans | ✅ Complete | ✅ Complete |
| Tenant Subscriptions | ✅ Complete | ✅ Complete |
| Platform Payments | ✅ Complete | ✅ Complete |

---

## Architecture Decisions (Recorded)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Multi-tenancy | Schema-per-tenant | Complete data isolation; no discriminator columns; straightforward backup per school |
| Authentication | Stateless JWT (HS256) | Scalable; no server-side session; standard for REST APIs |
| ORM | Spring Data JPA + Hibernate | Mature, well-supported; custom multi-tenancy hooks available |
| Migration | Flyway | Declarative SQL migrations; easy rollback tracking |
| API Contract | `ApiResponse<T>` envelope | Consistent client-side handling; standard error format |
| DTO pattern | Java records | Immutable, concise; auto-generates `equals`, `hashCode`, `toString` |
| Frontend state | TanStack Query | Server state separate from UI state; automatic caching and invalidation |
| Frontend routing | React Router v7 | File-based routing patterns; nested routes for layouts |
