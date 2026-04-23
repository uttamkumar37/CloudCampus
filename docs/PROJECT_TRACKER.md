# 📘 PROJECT_TRACKER.md — CampusCloud

> **Last Updated:** 2026-04-23
> **Maintained by:** Project team + AI (GitHub Copilot)
> **Purpose:** Single source of truth for project progress, architecture decisions, and AI context.

---

## 0. ⚡ Daily Progress Snapshot

**Date:** 2026-04-23

### Completed Today
- Frontend Task 1 completed: project setup, feature-based folder structure, routing, base dashboard layout.
- Frontend Task 2 completed: auth module with login API integration, AuthContext, PrivateRoute/PublicRoute.
- Frontend Task 3 completed: student module with paginated list + create flow, React Query hooks, reusable `DataTable` and form components.
- Frontend build verified successfully after each task (`npm run build` passed).
- PROJECT_TRACKER.md updated to include frontend architecture, module status, completed task logs (Tasks 22–24), and revised roadmap.

### In Progress
- No active coding task currently in progress.

### Next Recommended Action
- Start frontend Teacher module (list + create), reusing student module patterns and shared UI primitives.

---

## 1. 📌 Project Overview

| Field | Value |
|---|---|
| **Project Name** | CampusCloud |
| **Description** | A production-grade multi-tenant SaaS school management platform. Each school (tenant) is fully isolated in its own PostgreSQL schema. The system manages students, teachers, academics, attendance, fees, and exams. |
| **Tech Stack** | Backend: Java 17, Spring Boot 3, Spring Security 6, Spring Data JPA, PostgreSQL 16, Flyway, JWT (JJWT), Maven 3, Docker, Docker Compose. Frontend: React (Vite), TypeScript, Tailwind CSS, React Router, Axios, TanStack Query. |
| **Architecture Style** | Backend: Modular Monolith (future-ready for microservices). Frontend: Feature-based modular architecture aligned to backend domains. |
| **Multi-tenancy Strategy** | Schema-per-tenant — each tenant gets a dedicated PostgreSQL schema. Schema is resolved at runtime from the `X-Tenant-ID` request header via a `ThreadLocal` (`TenantContext`). |
| **Project Root** | `/Users/uttamkumar/uttam-all-data/01_github-projects/CampusCloud` |
| **Base Package** | `com.campuscloud` |

---

## 2. 🧱 System Architecture

### High-Level Module Breakdown

```
com.campuscloud/
├── auth/           JWT filter, login endpoint, DatabaseUserDetailsService
├── common/         ApiResponse<T>, PageResponse<T>, GlobalExceptionHandler
├── config/         SecurityConfig, Flyway config
├── tenant/         Tenant entity, TenantController, TenantServiceImpl, TenantContext, TenantRequestFilter
├── user/           UserAccount, UserRole, UserController, UserServiceImpl
├── student/        Student, Gender, StudentController, StudentServiceImpl
├── teacher/        Teacher, TeacherController, TeacherServiceImpl
├── academic/       SchoolClass, Subject, Section, AcademicController, AcademicServiceImpl
├── attendance/     AttendanceRecord, AttendanceStatus, AttendanceController, AttendanceServiceImpl
├── fees/           FeeAssignment, FeePayment, FeeStatus, FeesController, FeesServiceImpl
└── exam/           Exam, ExamResult, ExamController, ExamServiceImpl
```

### Module Interaction Flow

```
HTTP Request
    │
    ▼
TenantRequestFilter          ← reads X-Tenant-ID header → sets TenantContext (ThreadLocal)
    │
    ▼
JwtAuthenticationFilter      ← validates Bearer token → sets SecurityContext
    │
    ▼
Controller (@PreAuthorize)   ← role-based guard via @EnableMethodSecurity
    │
    ▼
Service (business logic)     ← validates tenant context, calls repositories
    │
    ▼
Repository (Spring Data JPA) ← executes SQL in the correct tenant schema
    │
    ▼
PostgreSQL (schema-routed)   ← e.g. greenwood.students, riverside.teachers
```

### Frontend Architecture (EduTenant UI)

```
frontend/src/
├── app/                    App shell, router, global providers
├── api/                    Axios client + endpoint constants
├── components/
│   ├── layout/             Dashboard layout and page shell
│   └── ui/                 Reusable UI primitives (PageHeader, DataTable, FormInput, FormSelect)
├── features/
│   ├── auth/               Auth context, login page, route guards, auth API/hooks/types
│   ├── student/            Student list/create pages, forms, API/hooks/types
│   ├── teacher/            Scaffolded feature module
│   └── academic/           Scaffolded feature module
├── types/                  Shared API/pagination contracts
└── utils/                  Shared storage/token utilities
```

### Frontend Request Flow

```
Route (React Router)
    │
    ▼
PrivateRoute/PublicRoute guards
    │
    ▼
Feature hook (TanStack Query)
    │
    ▼
Feature API function
    │
    ▼
Axios client interceptors
    ├── Authorization: Bearer <JWT>
    └── X-Tenant-ID: <tenant schema>
    │
    ▼
Spring Boot /api/v1 endpoints
```

### Tenant Isolation Mechanism

1. Every HTTP request includes `X-Tenant-ID: <schema-name>` header.
2. `TenantRequestFilter` reads this header and calls `TenantContext.setTenant(schemaName)`.
3. `TenantContext` stores the schema name in a `ThreadLocal<String>`.
4. A custom Hibernate `CurrentTenantIdentifierResolver` reads from `TenantContext` to route all JPA queries to the correct schema.
5. `TenantContext.clear()` is called in a `finally` block after every request.
6. The public schema (`public`) is the default; domain services throw `IllegalArgumentException` if a request arrives without a valid tenant header.
7. On tenant creation, `TenantServiceImpl.initializeTenantTables()` dynamically creates all 11 domain tables in the new schema using raw SQL via `JdbcTemplate`.

---

## 3. 🗄️ Database Design

### Public Schema (`public`)

| Table | Purpose | Key Columns |
|---|---|---|
| `tenants` | Tenant registry | `id`, `name`, `schema_name`, `active`, `created_at` |
| `flyway_schema_history` | Flyway migration tracking | Managed by Flyway |

### Tenant Schema (per school, e.g. `greenwood`)

| Table | Purpose | Key Columns |
|---|---|---|
| `users` | School staff accounts | `id`, `full_name`, `username`, `email`, `password_hash`, `role`, `active`, `created_at` |
| `students` | Enrolled students | `id`, `admission_no`, `first_name`, `last_name`, `date_of_birth`, `gender`, `email`, `phone`, `active`, `created_at` |
| `teachers` | School teachers | `id`, `employee_no`, `first_name`, `last_name`, `email`, `phone`, `hire_date`, `active`, `created_at` |
| `classes` | School classes (e.g. Grade 10) | `id`, `name`, `code`, `active`, `created_at` |
| `subjects` | Academic subjects | `id`, `name`, `code`, `active`, `created_at` |
| `sections` | Sections within a class | `id`, `name`, `class_id` (FK→classes), `active`, `created_at` |
| `attendance_records` | Daily attendance | `id`, `student_id`, `class_id`, `section_id`, `attendance_date`, `status`, `remarks`, `marked_by_user_id`, `created_at` |
| `fee_assignments` | Fee assignments per student | `id`, `student_id`, `fee_title`, `amount`, `due_date`, `status`, `created_at` |
| `fee_payments` | Payments against assignments | `id`, `fee_assignment_id` (FK), `amount_paid`, `payment_date`, `payment_method`, `reference_no`, `received_by_user_id`, `created_at` |
| `exams` | Scheduled exams | `id`, `title`, `exam_date`, `class_id`, `section_id`, `subject_id`, `max_marks`, `active`, `created_at` |
| `exam_results` | Student exam results | `id`, `exam_id`, `student_id`, `marks_obtained`, `grade`, `remarks`, `published`, `created_at` |

### Key Constraints
- `attendance_records`: UNIQUE(`student_id`, `attendance_date`) — one record per student per day.
- `exams`: UNIQUE(`title`, `exam_date`, `class_id`, `section_id`, `subject_id`) — no duplicate scheduling.
- `exam_results`: UNIQUE(`exam_id`, `student_id`) — one result per student per exam.

---

## 4. 🔐 Security Design

### Authentication
- **Type:** Stateless JWT (Bearer token)
- **Algorithm:** HS256
- **Secret:** Loaded from `${JWT_SECRET}` environment variable (min 32 bytes)
- **Token TTL:** Configurable via `${JWT_ACCESS_TOKEN_EXPIRATION_MS}` (default 1 hour)
- **Login endpoint:** `POST /api/v1/auth/login` — public, no auth required
- **All other endpoints:** Require `Authorization: Bearer <token>`

### Bootstrap Super Admin
- Created on application startup from environment variables (no SQL needed)
- Config: `app.security.bootstrap-admin.username/password/role`
- `DatabaseUserDetailsService` intercepts the bootstrap username before hitting the DB

### Role-Based Access Control (RBAC)
- Enforced via `@EnableMethodSecurity` + `@PreAuthorize` on every controller method
- **No wildcard permissions** — every endpoint has an explicit role guard

| Role | Scope |
|---|---|
| `SUPER_ADMIN` | Platform-level; manages tenants, all modules |
| `SCHOOL_ADMIN` | School-level; manages users, students, teachers, academics, fees |
| `TEACHER` | Read students/teachers; mark attendance; enter exam results |
| `STUDENT` | Read exam results for their exams |
| `PARENT` | Read fee assignments and exam results for their child |

### Endpoint Role Matrix (summary)

| Endpoint | SUPER_ADMIN | SCHOOL_ADMIN | TEACHER | STUDENT | PARENT |
|---|---|---|---|---|---|
| Tenant management | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create user | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create student/teacher | ✅ | ✅ | ❌ | ❌ | ❌ |
| Read student/teacher | ✅ | ✅ | ✅ | ❌ | ❌ |
| Mark attendance | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage fees | ✅ | ✅ | ❌ | ❌ | ❌ |
| View fee assignments | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create exam/result | ✅ | ✅ | ✅ | ❌ | ❌ |
| View exam results | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## 5. 📦 Module Status Tracker

| Module | Status | Description | Completed Features |
|---|---|---|---|
| `tenant` | ✅ COMPLETED | Tenant lifecycle management | Create tenant, list tenants, get by ID, schema + 11 tables auto-provisioned on creation, SUPER_ADMIN-only access |
| `auth` | ✅ COMPLETED | JWT authentication | Login endpoint, JwtAuthenticationFilter, JwtService (generate/validate), DatabaseUserDetailsService, bootstrap super-admin |
| `user` | ✅ COMPLETED | School user accounts | Create user, list users (paginated), username/email normalisation, BCrypt password hashing, tenant context guard |
| `student` | ✅ COMPLETED | Student enrollment | Enroll student, get by ID, list (paginated), admission number uniqueness, gender enum |
| `teacher` | ✅ COMPLETED | Teacher management | Add teacher, get by ID, list (paginated), employee number + email uniqueness |
| `academic` | ✅ COMPLETED | Classes, subjects, sections | Create/list classes, subjects, sections; section FK to class; code uniqueness |
| `attendance` | ✅ COMPLETED | Daily attendance tracking | Mark attendance, get by ID, get by date; duplicate guard per student/day; status enum |
| `fees` | ✅ COMPLETED | Fee management | Assign fee, record payment, payment reconciliation, status transitions (PENDING→PARTIALLY_PAID→PAID), overpay guard |
| `exam` | ✅ COMPLETED | Exam scheduling & results | Schedule exam, get by class, enter result, get results; duplicate schedule guard; marks overflow guard |
| `common` | ✅ COMPLETED | Shared infrastructure | `ApiResponse<T>`, `PageResponse<T>`, `GlobalExceptionHandler` (400/401/403/500) |
| `docker` | ✅ COMPLETED | Container support | Multi-stage Dockerfile, docker-compose.yml, .env.example, .gitignore |
| `config` | ✅ COMPLETED | Application configuration | SecurityConfig, application.yml (all secrets via env vars), Flyway V1+V2 migrations |
| `tests` | ✅ COMPLETED | Unit test suite | 33 tests across UserServiceImpl, FeesServiceImpl, ExamServiceImpl (Mockito, no Spring context) |

### Frontend Module Status

| Module | Status | Description | Completed Features |
|---|---|---|---|
| `frontend-app` | ✅ COMPLETED | App shell and routing foundation | `app/App.tsx`, `app/routes.tsx`, `app/providers.tsx`, route map for `/login`, `/dashboard`, `/students`, `/teachers`, `/academic` |
| `frontend-api` | ✅ COMPLETED | Shared API infrastructure | Axios client with interceptors, endpoint constants, shared `ApiResponse` and pagination types, local storage token/tenant utility |
| `frontend-auth` | ✅ COMPLETED | Authentication and route protection | Login page + API integration, AuthContext/AuthProvider, `PrivateRoute`, `PublicRoute`, JWT + tenant persistence in localStorage |
| `frontend-student` | ✅ COMPLETED | Student list/create feature | Backend-aligned DTOs, paginated student fetch, create student mutation, reusable student form, reusable data table, page-level loading/error/pagination states |
| `frontend-teacher` | 🟡 SCAFFOLDED | Teacher feature module | Folder structure, types, API stub, page scaffold |
| `frontend-academic` | 🟡 SCAFFOLDED | Academic feature module | Folder structure, types, API stub, page scaffold |

---

## 6. ✅ Completed Tasks Log

### Task 1 — Project Bootstrap
- **Implemented:** Spring Boot 3 project scaffolding, Maven `pom.xml` with all dependencies (Spring Web, Security, Data JPA, Flyway, PostgreSQL, JWT, Lombok, Validation)
- **Files Created:** `pom.xml`, main application class, `application.yml`
- **Key Decisions:** Java 17, schema-per-tenant multi-tenancy, Flyway for public schema, programmatic table creation for tenant schemas

### Task 2 — Multi-Tenancy Foundation
- **Implemented:** `TenantContext` (ThreadLocal), `TenantRequestFilter`, Hibernate schema routing
- **Files Created:** `TenantContext.java`, `TenantRequestFilter.java`, Hibernate tenant resolver/connection provider config
- **Key Decisions:** X-Tenant-ID header as tenant discriminator; `public` is the default fallback schema

### Task 3 — Tenant Module
- **Implemented:** Tenant entity (public schema), TenantRepository, TenantServiceImpl (creates schema + all domain tables), TenantController
- **Files Created:** `Tenant.java`, `TenantRepository.java`, `TenantService.java`, `TenantServiceImpl.java`, `TenantController.java`, DTOs
- **Key Decisions:** `CREATE SCHEMA IF NOT EXISTS` + all 11 tenant tables provisioned in a single transaction on tenant creation

### Task 4 — DB-Backed Authentication
- **Implemented:** Replaced in-memory auth with DB-backed auth; JWT stateless auth pipeline; bootstrap super-admin
- **Files Created:** `UserAccount.java`, `UserRole.java`, `UserAccountRepository.java`, `DatabaseUserDetailsService.java`, `JwtService.java`, `JwtAuthenticationFilter.java`, `AuthController.java`, `SecurityConfig.java`, `UserService/Impl.java`, `UserController.java`
- **Key Decisions:** `@PostConstruct` pre-encodes bootstrap password once; `DatabaseUserDetailsService` checks bootstrap username before querying DB

### Task 5 — Student Module
- **Implemented:** Full student CRUD (create, get by ID, list)
- **Files Created:** `Student.java`, `Gender.java`, `StudentRepository.java`, `StudentService/Impl.java`, `StudentController.java`, DTOs
- **Key Decisions:** Admission number uppercased and uniqueness-checked; email/phone nullable

### Task 6 — Teacher Module
- **Implemented:** Full teacher CRUD (create, get by ID, list)
- **Files Created:** `Teacher.java`, `TeacherRepository.java`, `TeacherService/Impl.java`, `TeacherController.java`, DTOs
- **Key Decisions:** Employee number uppercased; email lowercased; both uniqueness-checked

### Task 7 — Academic Module
- **Implemented:** Classes, subjects, sections (create + list for each)
- **Files Created:** `SchoolClass.java`, `Subject.java`, `Section.java`, repositories, `AcademicService/Impl.java`, `AcademicController.java`, DTOs
- **Key Decisions:** Section has FK to SchoolClass; code uniqueness enforced per entity type

### Task 8 — Attendance Module
- **Implemented:** Mark attendance, get by ID, get by date
- **Files Created:** `AttendanceRecord.java`, `AttendanceStatus.java`, `AttendanceRecordRepository.java`, `AttendanceService/Impl.java`, `AttendanceController.java`, DTOs
- **Key Decisions:** One record per student per day enforced in service layer; status enum: PRESENT/ABSENT/LATE/EXCUSED

### Task 9 — Fees Module
- **Implemented:** Fee assignment, payment recording with reconciliation, status transitions, view by student
- **Files Created:** `FeeAssignment.java`, `FeePayment.java`, `FeeStatus.java`, repositories, `FeesService/Impl.java`, `FeesController.java`, DTOs
- **Key Decisions:** Payment reconciliation sums all payments against an assignment; overpay blocked; status auto-transitions PENDING→PARTIALLY_PAID→PAID

### Task 10 — Exam Module
- **Implemented:** Schedule exam, list by class, enter result, get results
- **Files Created:** `Exam.java`, `ExamResult.java`, `ExamRepository.java`, `ExamResultRepository.java`, `ExamService/Impl.java`, `ExamController.java`, DTOs
- **Key Decisions:** Duplicate schedule guard (title+date+class+section+subject); one result per student per exam; marks cannot exceed maxMarks

### Task 11 — Docker Support
- **Implemented:** Multi-stage Dockerfile, docker-compose.yml with health checks, .dockerignore, Flyway V2 placeholder
- **Files Created:** `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `V2__baseline_public_schema_extensions.sql`
- **Key Decisions:** Multi-stage build (Maven builder → JRE Alpine runtime); non-root `spring` user; `-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0`

### Task 12 — Tenant API Security Hardening
- **Implemented:** Removed public tenant creation route; added `@PreAuthorize("hasRole('SUPER_ADMIN')")` to all tenant endpoints
- **Files Modified:** `SecurityConfig.java` (removed `permitAll` on POST /tenants), `TenantController.java` (added `@PreAuthorize` to all 3 handlers)
- **Key Decisions:** Tenant management is strictly SUPER_ADMIN; no public route for any tenant operation

### Task 13 — Global Exception Handling
- **Implemented:** `GlobalExceptionHandler` extended with `AccessDeniedException` → 403; `ApiResponse.error()` factory method added
- **Files Modified:** `GlobalExceptionHandler.java`, `ApiResponse.java`
- **Key Decisions:** All errors return `{ success: false, message: "...", data: null, timestamp: "..." }`; generic `Exception` logs and returns 500

### Task 14 — Configuration & Secret Hardening
- **Implemented:** All secrets moved to `.env` file; `docker-compose.yml` reads from `.env`; `.gitignore` and `.env.example` created
- **Files Created:** `.env.example`, `.gitignore`
- **Files Modified:** `docker-compose.yml` (replaced all hardcoded values with `${VAR}` references)
- **Key Decisions:** `.env` is gitignored; `.env.example` serves as onboarding template with generation hints

### Task 15 — README Documentation
- **Implemented:** Full project `README.md`
- **Files Created:** `README.md`
- **Sections:** Tech stack, architecture overview, local setup, Docker setup, environment variables reference, full API endpoint table for all modules, error response format, project structure tree

### Task 16 — Unit Test Suite
- **Implemented:** 33 unit tests across 3 service classes using Mockito (no Spring context load)
- **Files Created:** `UserServiceImplTest.java` (7 tests), `FeesServiceImplTest.java` (10 tests), `ExamServiceImplTest.java` (16 tests)
- **Coverage Highlights:** Username/email normalisation, duplicate guards, tenant context enforcement, fee payment reconciliation (partial/full/top-up), overpay guard, exam duplicate schedule, marks overflow check

### Task 17 — Pagination
- **Implemented:** `PageResponse<T>` common DTO; paginated list endpoints for users, students, teachers
- **Files Created:** `PageResponse.java`
- **Files Modified:** `UserService/Impl/Controller`, `StudentService/Impl/Controller`, `TeacherService/Impl/Controller`
- **Key Decisions:** `@PageableDefault(size=20)` with sensible sort defaults; response wraps Spring `Page<T>` metadata (page, size, totalElements, totalPages, last)

### Task 18 — Swagger + Postman Artifacts
- **Implemented:** OpenAPI/Swagger integration, endpoint annotations, Postman collection and environment generation
- **Files Created:** `SwaggerConfig.java`, `postman/EduTenant.postman_collection.json`, `postman/EduTenant Local.postman_environment.json`
- **Files Modified:** All module controllers with `@Tag` and `@Operation` metadata
- **Key Decisions:** Swagger UI at `/swagger-ui.html`; OpenAPI schema at `/v3/api-docs`; Postman login auto-captures JWT token

### Task 19 — Runtime Stabilization Fixes
- **Implemented:** Startup/runtime fixes discovered during local smoke tests
- **Files Modified:** `pom.xml`, `JwtServiceImpl.java`, `SecurityConfig.java`, `JwtAuthenticationFilter.java`, `PasswordConfig.java`
- **Key Decisions:** Added `flyway-postgresql`; hardened JWT key parsing with 32-byte minimum; removed bean-cycle risks with cleaner wiring

### Task 20 — GitHub Deployment Readiness
- **Implemented:** CI and container publish workflows for GitHub
- **Files Created:** `.github/workflows/ci.yml`, `.github/workflows/docker-publish.yml`
- **Files Modified:** `README.md` runbook/deployment sections
- **Key Decisions:** PR/push CI with PostgreSQL service + Maven verify; Docker image publish to GHCR on `main` and tags

### Task 21 — Security Hardening Phase 1
- **Implemented:** Immediate IDOR mitigations + fail-fast secret validation
- **Files Modified:** `ExamController.java`, `FeesController.java`, `application.yml`, `DatabaseUserDetailsService.java`
- **Key Decisions:** Restricted risky read endpoints to staff roles until ownership model is implemented; removed insecure fallback values for `JWT_SECRET`, `DB_PASSWORD`, `BOOTSTRAP_ADMIN_PASSWORD`; startup now fails fast for missing bootstrap credentials

### Task 22 — Frontend Foundation (Task 1)
- **Implemented:** React TypeScript app architecture with feature-based folder structure aligned to backend domains
- **Files Created/Modified:** `frontend/src/app/*`, `frontend/src/api/*`, `frontend/src/components/layout/*`, `frontend/src/components/ui/PageHeader.tsx`, feature scaffolds under `frontend/src/features/*`, `frontend/src/main.tsx`, `frontend/src/index.css`, `frontend/vite.config.ts`, `frontend/package.json`
- **Key Decisions:** Router-first shell, QueryClient provider setup, Tailwind integration via `@tailwindcss/vite`, dashboard layout as base private app container

### Task 23 — Frontend Auth Module (Task 2)
- **Implemented:** End-to-end login flow with JWT + tenant persistence, auth context, and route protection
- **Files Created/Modified:** `frontend/src/features/auth/components/AuthProvider.tsx`, `frontend/src/features/auth/components/PrivateRoute.tsx`, `frontend/src/features/auth/components/PublicRoute.tsx`, `frontend/src/features/auth/hooks/useAuth.ts`, `frontend/src/features/auth/pages/LoginPage.tsx`, `frontend/src/app/routes.tsx`, `frontend/src/app/providers.tsx`
- **Key Decisions:** All non-login routes guarded by `PrivateRoute`; authenticated users are redirected away from `/login`; tenant ID collected at sign-in and propagated via axios interceptor

### Task 24 — Frontend Student Module (Task 3)
- **Implemented:** Student list + create flow with backend-contract alignment and reusable UI primitives
- **Files Created/Modified:** `frontend/src/features/student/*`, `frontend/src/components/ui/DataTable.tsx`, `frontend/src/components/ui/FormInput.tsx`, `frontend/src/components/ui/FormSelect.tsx`, `frontend/src/types/pagination.ts`
- **Key Decisions:** DTO fields aligned to backend (`admissionNo`, `dateOfBirth`, `gender`, `email`, `phone`), paginated list uses `ApiResponse<PageResponse<Student>>`, create mutation invalidates student queries, page has explicit loading/error/pagination states

---

## 7. 🚧 Current Task

**Status: Backend Stable + Frontend Core Implemented ✅**

Backend is production-stable with security hardening checkpoint complete.
Frontend now has completed foundation + auth + student module and is ready for teacher/academic feature implementation.

---

## 8. 🎯 Next Tasks (Auto-Suggested)

### Task 25 — Frontend Teacher Module
- Implement teacher list + create flow mirroring student architecture
- Align DTO/API contracts with backend `teacher` module
- Reuse existing table/form components for consistency
- **Effort:** Medium

### Task 26 — Frontend Academic Module
- Implement classes/subjects/sections list + create flows
- Add tabs/segmented views under `/academic` for each sub-resource
- Keep feature API layer separated from page components
- **Effort:** Medium

### Task 27 — Frontend UX Hardening
- Add global query/mutation error handling strategy and toast notifications
- Add optimistic UX improvements (button pending states, empty-state guidance)
- Add minimal form validation layer (client-side required checks + shape guards)
- **Effort:** Medium

### Task 28 — Ownership-Aware Authorization (Backend)
- Introduce parent-child and student-user mapping model
- Re-enable STUDENT/PARENT exam and fees read endpoints only with ownership checks
- Add service-layer authorization policies for object-level access
- **Effort:** High

### Task 29 — Security Error Response Consistency
- Add explicit `AuthenticationEntryPoint` and `AccessDeniedHandler` in `SecurityConfig`
- Return uniform `ApiResponse` payloads for all 401/403 responses from filter chain
- **Effort:** Medium

### Task 30 — Audit Logging
- Add a `created_by_user_id` and `updated_at` field to key entities (student, teacher, exam)
- Implement Spring Data JPA `@CreatedBy` / `@LastModifiedBy` via `AuditorAware` reading from `SecurityContext`
- **Effort:** Medium

### Task 31 — Soft Delete
- Add `deleted_at TIMESTAMP` column to students, teachers, users
- Override `findById` / `findAll` to filter `WHERE deleted_at IS NULL`
- Add `DELETE /api/v1/students/{id}` endpoint (sets `deleted_at`, does not hard-delete)
- **Effort:** Medium

### Task 32 — API Versioning Strategy
- Document the current `/api/v1/` prefix convention
- Add a `@ApiVersion` annotation or path-based routing strategy for future `/api/v2/` endpoints
- **Effort:** Low

### Task 33 — Integration Tests
- Add `@SpringBootTest` + Testcontainers (PostgreSQL) integration tests for the tenant provisioning flow and fee payment reconciliation end-to-end
- **Effort:** High

### Task 34 — Student Self-Registration Flow
- Allow a SCHOOL_ADMIN to generate a one-time invite token for a student
- Student uses the token to set their password and activate their account
- **Effort:** High

---

## 9. 🧠 Notes for Future AI (VERY IMPORTANT)

### How Tenant Is Resolved
1. Every request (except `/api/v1/auth/**`) must carry `X-Tenant-ID: <schema-name>` header.
2. `TenantRequestFilter` sets `TenantContext.setTenant(schemaName)`.
3. All service methods call `validateTenantContext()` which throws `IllegalArgumentException` if the current schema is `"public"`.
4. Never bypass `TenantContext` — all repositories run in the tenant schema automatically.

### Package Structure Convention
```
com.campuscloud.<module>/
    controller/   — REST controllers only, no business logic
    service/      — interface + impl
    repository/   — Spring Data JPA interface
    entity/       — JPA entities (never returned from controllers)
    dto/          — Request/Response records (Java records preferred)
```

### Naming Conventions
- **Entities:** PascalCase noun (`UserAccount`, `FeeAssignment`)
- **DTOs:** `<Entity>CreateRequest`, `<Entity>Response`
- **Services:** `<Module>Service` (interface) + `<Module>ServiceImpl` (implementation)
- **Controllers:** `<Module>Controller`, mapped to `/api/v1/<module-plural>`
- **Repositories:** `<Entity>Repository` extending `JpaRepository<Entity, UUID>`
- **Test classes:** `<ServiceImpl>Test` in the matching test package

### API Standards
- All endpoints prefixed `/api/v1/`
- All responses wrapped in `ApiResponse<T>` — `{ success, message, data, timestamp }`
- Paginated list responses use `ApiResponse<PageResponse<T>>`
- HTTP status codes: 200 OK, 201 (not yet used — use 200 with message), 400 BAD_REQUEST, 401 UNAUTHORIZED, 403 FORBIDDEN, 500 INTERNAL_SERVER_ERROR
- IDs are always `UUID`
- Dates: `LocalDate` for calendar dates, `Instant` for timestamps

### DTO Rules — NEVER Expose Entities
- Controllers **never** return JPA entities directly
- All data flows through `Request` records (inbound) and `Response` records (outbound)
- DTOs are Java `record` types with Jakarta Validation annotations on request records
- Map entities to DTOs in the service `map()` private method

### Security Rules
- Every controller method **must** have `@PreAuthorize`
- Never use `permitAll()` except for `/api/v1/auth/**`
- Role strings use `hasRole('X')` (Spring prepends `ROLE_` automatically) or `hasAnyRole('X', 'Y')`
- `@EnableMethodSecurity` is on `SecurityConfig`
- JWT secret **must** come from environment variable, never hardcoded

### Error Handling Rules
- Business rule violations → `throw new IllegalArgumentException("descriptive message")`
- `GlobalExceptionHandler` converts these to 400 responses automatically
- Never throw `RuntimeException` directly — use `IllegalArgumentException`
- Log at `ERROR` level only for unexpected exceptions (the `Exception.class` handler)

### Tenant Table Creation
- When adding a new domain entity that lives in the tenant schema, add its `CREATE TABLE IF NOT EXISTS` SQL to `TenantServiceImpl.initializeTenantTables()`
- Tables must be created in dependency order (parent tables before FK-dependent tables)
- Always add `IF NOT EXISTS` to be idempotent

---

## 10. ⚙️ How to Continue This Project

### After Completing Any Task

1. **Update Module Status** — change `NOT_STARTED` → `IN_PROGRESS` → `COMPLETED` in Section 5
2. **Add Entry to Completed Tasks Log** — Section 6, following the existing format:
   ```
   ### Task N — Title
   - **Implemented:** ...
   - **Files Created/Modified:** ...
   - **Key Decisions:** ...
   ```
3. **Update Current Task** — Section 7 with the task now in progress
4. **Suggest Next Tasks** — Section 8 with 2–3 actionable follow-ups
5. **Update "Last Updated" date** at the top of this file

### Running the Project Locally
```bash
# 1. Copy and configure secrets
cp .env.example .env
# Edit .env with real values; generate JWT secret:
openssl rand -hex 32

# 2. Start with Docker Compose
docker compose up --build

# 3. Or run locally (requires PostgreSQL running)
export $(grep -v '^#' .env | xargs)
mvn spring-boot:run
```

### Running Tests
```bash
mvn test
# or specific class:
mvn test -Dtest=FeesServiceImplTest
```

### Building the JAR
```bash
mvn clean package -DskipTests
java -jar target/digital-school-saas-0.0.1-SNAPSHOT.jar
```

### Adding a New Module (Checklist)
- [ ] Create package `com.campuscloud.<module>/`
- [ ] Add entity class with `@Entity`, UUID PK, `@PrePersist` for `createdAt`
- [ ] Add repository interface extending `JpaRepository<Entity, UUID>`
- [ ] Add request/response DTOs as Java records
- [ ] Add service interface + `@Service` implementation
- [ ] Add `@RestController` with `@PreAuthorize` on every method
- [ ] Add `CREATE TABLE IF NOT EXISTS` SQL to `TenantServiceImpl.initializeTenantTables()`
- [ ] Add unit tests for the service implementation
- [ ] Update `PROJECT_TRACKER.md` (Sections 3, 5, 6, 7, 8)

---

*This file is the authoritative project context. Keep it updated after every task.*
