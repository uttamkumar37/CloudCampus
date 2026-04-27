# CampusCloud — System Architecture

> Version: 1.0 | Last Updated: 2026-04-28 (subscription system added) | Based on actual source code

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Technology Stack](#2-technology-stack)
3. [Backend Architecture](#3-backend-architecture)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Multi-Tenant Architecture](#5-multi-tenant-architecture)
6. [Database Design](#6-database-design)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Request Lifecycle](#8-request-lifecycle)
9. [Integration Points](#9-integration-points)
10. [Deployment Architecture](#10-deployment-architecture)

---

## 1. High-Level Architecture

CampusCloud is a **multi-tenant SaaS school management platform** built as a modular monolith with clean separation between backend, frontend, and infrastructure layers.

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENTS                                 │
│   Browser (React SPA)    │    API Consumers (Postman / Mobile)  │
└────────────┬─────────────┴──────────────┬───────────────────────┘
             │ HTTPS                       │ HTTPS + JSON
             ▼                             ▼
┌────────────────────────────────────────────────────────────────┐
│                    SPRING BOOT BACKEND (Port 8080)              │
│                                                                  │
│  TenantRequestFilter → JwtAuthFilter → SecurityConfig           │
│                ↓                                                 │
│  REST Controllers (/api/v1/*)                                   │
│                ↓                                                 │
│  Service Layer (Business Logic + Tenant Validation)             │
│                ↓                                                 │
│  Spring Data JPA + Hibernate (Multi-Tenant Schema Routing)      │
└──────────────────────────┬─────────────────────────────────────┘
                           │ JDBC
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                   PostgreSQL 16 (Port 5432)                   │
│                                                               │
│   public schema              tenant schemas (per school)      │
│   ┌─────────────┐            ┌──────────────────────────────┐│
│   │  tenants    │            │  greenwood.*  sunrise.*  ...  ││
│   │  (registry) │            │  users, students, teachers,   ││
│   └─────────────┘            │  fees, exams, attendance, ... ││
│                              └──────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### Backend

| Component | Technology | Version |
|-----------|------------|---------|
| Language | Java | 17 |
| Framework | Spring Boot | 3.4.4 |
| Security | Spring Security | 6.x |
| ORM | Spring Data JPA + Hibernate | 6.x |
| Database | PostgreSQL | 16 (Alpine) |
| Migrations | Flyway | Latest |
| JWT | JJWT (io.jsonwebtoken) | 0.12.6 |
| Build Tool | Maven | 3.8+ |
| API Docs | SpringDoc OpenAPI | 2.6.0 |
| Excel Parsing | Apache POI | 5.3.0 |
| Utilities | Lombok | Latest |
| Testing | JUnit 5 + Mockito | Latest |

### Frontend

| Component | Technology | Version |
|-----------|------------|---------|
| Language | TypeScript | ~6.0.2 |
| UI Library | React | 19.2.5 |
| Build Tool | Vite | 8.0.10 |
| Styling | Tailwind CSS | 4.2.4 |
| Routing | React Router | 7.14.2 |
| HTTP Client | Axios | 1.15.2 |
| Server State | TanStack Query | 5.99.2 |
| Linting | ESLint + TypeScript ESLint | Latest |

### Infrastructure

| Component | Technology |
|-----------|------------|
| Containerization | Docker + Docker Compose |
| Database | PostgreSQL 16 Alpine |
| Scripts | `build.sh`, `start-dev.sh` |
| API Docs | Swagger UI (`/swagger-ui.html`) |

---

## 3. Backend Architecture

### 3.1 Layered Architecture

The backend follows a strict clean layered architecture with one-way dependency flow:

```
Controller → Service Interface → Service Impl → Repository → Database
```

| Layer | Package | Responsibility |
|-------|---------|----------------|
| **Controller** | `*.controller` | Parse HTTP requests, invoke service, return `ApiResponse<T>`. No business logic. Every method has `@PreAuthorize`. |
| **Service Interface** | `*.service` | Defines the business contract. One interface per domain (e.g., `StudentService`). |
| **Service Impl** | `*.service.impl` | Executes business logic. First call is always `validateTenantContext()`. Uses `@Transactional`. |
| **Repository** | `*.repository` | Spring Data JPA. Extends `JpaRepository<Entity, UUID>`. Custom finders only — no raw SQL. |
| **Entity** | `*.entity` | JPA-mapped table rows. Uses `@PrePersist` for UUID and `createdAt`. Never returned from controllers. |
| **DTO** | `*.dto` | Java records for request/response contracts. Annotated with `@Valid`. One `*Request` and one `*Response` per use case. |
| **Config** | `com.campuscloud.config` | Spring beans: `SecurityConfig`, `SwaggerConfig`, `PasswordConfig`. |
| **Common** | `com.campuscloud.common` | `ApiResponse<T>`, `PageResponse<T>`, `GlobalExceptionHandler`. |
| **Tenant** | `com.campuscloud.tenant` | Multi-tenancy infra: `TenantContext`, `TenantRequestFilter`, Hibernate resolvers. |

### 3.2 Module Structure

```
backend/src/main/java/com/campuscloud/
├── CampusCloudApplication.java
├── academic/        classes, subjects, sections
├── attendance/      daily attendance tracking
├── auth/            JWT login, /auth/me
├── bulk/            Excel bulk upload via Apache POI
├── common/          ApiResponse, PageResponse, GlobalExceptionHandler
├── config/          SecurityConfig, SwaggerConfig, PasswordConfig
├── dashboard/       tenant summary, super-admin summary, branding
├── exam/            exam scheduling + results
├── fees/            fee assignments + payments
├── homework/        homework assignments
├── parent/          parent-student links, /me/children
├── security/        JwtService, JwtFilter, UserDetailsService
├── student/         student enrollment
├── teacher/         teacher management
├── tenant/          tenant registry, schema provisioning, multi-tenancy infra
├── timetable/       timetable slots
├── user/            user account management
├── subscription/    subscription plans, tenant subscriptions, platform payments
└── web/             web utilities
```

### 3.3 Common Response Envelope

All API responses use a uniform `ApiResponse<T>` wrapper:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { },
  "timestamp": "2026-04-28T10:00:00Z"
}
```

Error response:
```json
{
  "success": false,
  "message": "Admission number already exists",
  "data": null,
  "timestamp": "2026-04-28T10:00:00Z"
}
```

Paginated response uses `PageResponse<T>`:
```json
{
  "success": true,
  "data": {
    "content": [],
    "page": 0,
    "size": 20,
    "totalElements": 150,
    "totalPages": 8,
    "last": false
  }
}
```

### 3.4 SOLID Principles

| Principle | Implementation |
|-----------|----------------|
| **S** (Single Responsibility) | Controller handles HTTP only; Service handles logic only; Repository handles persistence only |
| **O** (Open/Closed) | New modules extend without modifying existing services |
| **L** (Liskov Substitution) | `StudentService` interface allows swappable implementations |
| **I** (Interface Segregation) | Each service interface is narrow (5–8 methods); no God interfaces |
| **D** (Dependency Inversion) | Controllers depend on service interfaces, injected via constructor |

### 3.4 Subscription & Billing System

The `com.campuscloud.subscription` module manages SaaS plan gating for tenants. All tables live in the `public` schema.

```
subscription_plans          ← available SaaS plans (FREE, BASIC, PRO, ENTERPRISE)
subscription_plan_features  ← features included per plan (join table)
tenant_subscriptions        ← which plan each tenant is on (with dates and status)
platform_payments           ← manually recorded payment receipts per tenant
```

**Key class:** `SubscriptionGuardService.requireFeature(PlanFeature)` — called in service methods to gate feature access.

**Fail-open rule:** If a tenant has no active subscription, all features are permitted (backward compatible for pre-subscription tenants).

**Endpoints:**
| Method | Path | Role Required |
|--------|------|---------------|
| GET | `/api/v1/plans` | Public |
| POST | `/api/v1/plans` | SUPER_ADMIN |
| POST | `/api/v1/tenants/{id}/subscribe` | SUPER_ADMIN |
| GET | `/api/v1/tenants/{id}/subscription` | SUPER_ADMIN |
| DELETE | `/api/v1/tenants/{id}/subscription` | SUPER_ADMIN |
| POST | `/api/v1/payments` | SUPER_ADMIN |
| GET | `/api/v1/payments/tenant/{id}` | SUPER_ADMIN |


---

## 4. Frontend Architecture

### 4.1 Directory Structure

```
frontend/src/
├── api/              Axios client + endpoint constants
├── app/              App shell: providers, routes, query keys
├── components/       Shared UI: DashboardLayout, DataTable, FormInput, FormSelect
├── features/         Feature modules (auth, student, teacher, fees, …)
├── hooks/            Custom React hooks
├── lib/              cn.ts — Tailwind class merging utility
├── types/            Shared TypeScript types (ApiResponse, PageResponse)
└── utils/            localStorage helper, toast helper
```

### 4.2 Feature Module Pattern

Each feature follows this consistent structure:

```
features/<domain>/
├── api/         HTTP calls (getStudents, createStudent)
├── hooks/       TanStack Query hooks (useStudents, useCreateStudent)
├── pages/       Page-level React components
├── components/  Domain UI components (StudentTable, StudentForm)
└── types.ts     TypeScript interfaces for request/response
```

### 4.3 Data Fetching Pattern

```
Page Component
    ↓ calls
TanStack Query Hook  (useStudents)
    ↓ wraps
API function  (studentApi.getStudents)
    ↓ uses
Axios client instance  (JWT + X-Tenant-ID interceptors)
    ↓ hits
Backend REST API
```

### 4.4 Auth Context

- JWT stored in `localStorage` via `storage.ts`
- Auth state managed via React Context (`AuthContext`)
- `PrivateRoute` guards all authenticated routes
- `PublicRoute` redirects authenticated users away from `/login`
- Role-based rendering: Super Admin routes only shown for `SUPER_ADMIN` role

### 4.5 Frontend Routes

| Path | Component | Role Access |
|------|-----------|-------------|
| `/login` | `LoginPage` | Public |
| `/super-admin/login` | `SuperAdminLoginPage` | Public |
| `/dashboard` | `DashboardPage` | All authenticated |
| `/students` | `StudentsPage` | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER |
| `/teachers` | `TeachersPage` | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER |
| `/academic` | `AcademicPage` | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER |
| `/attendance` | `AttendanceHubPage` | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER |
| `/fees` | `FeesHubPage` | SUPER_ADMIN, SCHOOL_ADMIN |
| `/marks` | `MarksHubPage` | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER |
| `/homework` | `HomeworkPage` | All authenticated |
| `/timetable` | `TimetablePage` | All authenticated |
| `/parent/children` | `MyChildrenPage` | PARENT |
| `/profile` | `ProfilePage` | All authenticated |
| `/bulk-upload` | `BulkUploadPage` | SCHOOL_ADMIN |
| `/super-admin/dashboard` | `SuperAdminDashboardPage` | SUPER_ADMIN |
| `/super-admin/tenants` | `TenantsPage` | SUPER_ADMIN |
| `/super-admin/users` | `UsersPage` | SUPER_ADMIN |

---

## 5. Multi-Tenant Architecture

### 5.1 Tenancy Model

CampusCloud uses **schema-per-tenant** isolation. Each school receives a dedicated PostgreSQL schema containing all its domain tables. There are no shared data tables between tenants and no discriminator columns.

```
PostgreSQL Database: campuscloud
├── public schema
│   ├── tenants                 (global tenant registry)
│   └── flyway_schema_history   (Flyway migration tracking)
│
├── greenwood schema            (Greenwood High School)
│   ├── users, students, teachers
│   ├── classes, subjects, sections
│   ├── attendance_records
│   ├── fee_assignments, fee_payments
│   ├── exams, exam_results
│   ├── homework_assignments
│   ├── timetable_slots
│   └── parent_students
│
├── sunrise schema              (Sunrise Academy — fully isolated)
│   └── (identical 13 tables, no shared data)
│
└── ...  (one schema per onboarded school)
```

### 5.2 Tenant Resolution Flow

```
1. Client sends HTTP request:
       X-Tenant-ID: greenwood

2. TenantRequestFilter intercepts every request:
       String tenantId = request.getHeader("X-Tenant-ID");
       TenantContext.setTenant(tenantId);    // ThreadLocal

3. Hibernate resolves schema on every query:
       TenantIdentifierResolver.resolveCurrentTenantIdentifier()
           → returns TenantContext.getTenant()  → "greenwood"

4. SchemaMultiTenantConnectionProvider:
       conn.createStatement().execute("SET search_path = greenwood");

5. All JPA queries execute against the greenwood schema.

6. After request completes (in finally block):
       TenantContext.clear();   // Prevents ThreadLocal memory leak
```

### 5.3 Tenant Provisioning

When `POST /api/v1/tenants` is called:

1. Record inserted into `public.tenants` (tenant registry)
2. `TenantServiceImpl.initializeTenantTables()` creates all 13 domain tables in the new schema
3. Schema name is validated (alphanumeric + underscore only) to prevent SQL injection
4. Tenant is immediately ready — use `X-Tenant-ID: <schemaName>` in all subsequent requests

### 5.4 Required Headers

| Header | Required On | Example |
|--------|-------------|---------|
| `X-Tenant-ID` | All tenant-scoped endpoints | `greenwood` |
| `Authorization` | All authenticated endpoints | `Bearer eyJhbGci...` |

Endpoints that do **not** require `X-Tenant-ID`:
- `POST /api/v1/auth/login` (Super Admin bootstraps against `public` schema)
- `GET/POST /api/v1/tenants` (Super Admin only)

---

## 6. Database Design

### 6.1 Public Schema

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `tenants` | Global tenant registry | `id` (UUID PK), `tenant_id` (business key), `school_name`, `schema_name`, `active`, `logo_url`, `primary_color`, `created_at` |

### 6.2 Tenant Schema Tables (13 tables per tenant)

| Table | Purpose | Key Constraints |
|-------|---------|----------------|
| `users` | Staff accounts | UNIQUE(username), UNIQUE(email) |
| `students` | Enrolled students | UNIQUE(admission_no) |
| `teachers` | School teachers | UNIQUE(employee_no), UNIQUE(email) |
| `classes` | Class levels (e.g., Grade 10) | UNIQUE(code) |
| `subjects` | Academic subjects | UNIQUE(code) |
| `sections` | Sections within a class | FK→classes |
| `attendance_records` | Daily attendance | UNIQUE(student_id, attendance_date) |
| `fee_assignments` | Fee assignments | FK→students |
| `fee_payments` | Payment records | FK→fee_assignments |
| `exams` | Scheduled exams | UNIQUE(title, exam_date, class_id, section_id, subject_id) |
| `exam_results` | Student exam results | UNIQUE(exam_id, student_id) |
| `homework_assignments` | Homework tasks | FK→classes, FK→users |
| `timetable_slots` | Weekly schedule | day_of_week (1–7) |
| `parent_students` | Parent-child links | UNIQUE(parent_user_id, student_id) |

### 6.3 Entity Relationships

```
classes ──< sections
classes ──< timetable_slots >── subjects
classes ──< exams >── subjects
classes ──< homework_assignments

students ──< attendance_records
students ──< fee_assignments ──< fee_payments
students ──< exam_results >── exams

users ──< students          (user_id FK, optional)
users ──< teachers          (user_id FK, optional)
users ──< parent_students ──> students
```

### 6.4 Flyway Migrations

| File | Purpose |
|------|---------|
| `V1__init_public_tenants.sql` | Creates `public.tenants` table with indexes |
| `V2__baseline_public_schema_extensions.sql` | Adds `logo_url` and `primary_color` columns to tenants |

---

## 7. Authentication & Authorization

### 7.1 Authentication Flow

```
POST /api/v1/auth/login
Body: { "username": "admin", "password": "secret" }

1. DatabaseUserDetailsService loads user:
       - Bootstrap admin (from env vars) for SUPER_ADMIN
       - OR users table in tenant schema (requires X-Tenant-ID)

2. BCryptPasswordEncoder validates hash.

3. JwtServiceImpl generates HS256 JWT with claims:
       {
         "sub":           "admin",
         "role":          "SCHOOL_ADMIN",
         "tenant":        "greenwood",
         "user_id":       "<uuid>",
         "tenant_schema": "greenwood",
         "iat":           <timestamp>,
         "exp":           <timestamp + 3600s>
       }

4. Response (200 OK):
       {
         "accessToken": "<jwt>",
         "tokenType":   "Bearer",
         "expiresIn":   3600,
         "username":    "admin",
         "role":        "SCHOOL_ADMIN",
         "userId":      "<uuid>",
         "tenantId":    "greenwood"
       }
```

### 7.2 Request Authorization

```
All authenticated requests:
  Authorization: Bearer <JWT>
  X-Tenant-ID:   greenwood

1. TenantRequestFilter  → TenantContext.setTenant("greenwood")
2. JwtAuthenticationFilter → validates JWT, populates SecurityContext
3. @PreAuthorize annotation evaluated on controller method
4. 401 → ApiAuthenticationEntryPoint (no/invalid token)
5. 403 → ApiAccessDeniedHandler (insufficient role)
6. Service layer re-validates TenantContext (defence in depth)
7. TenantContext.clear() always runs in filter finally block
```

### 7.3 Role-Permission Matrix

| Endpoint | SUPER_ADMIN | SCHOOL_ADMIN | TEACHER | STUDENT | PARENT |
|----------|:-----------:|:------------:|:-------:|:-------:|:------:|
| POST /auth/login | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /auth/me | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /tenants | ✅ | — | — | — | — |
| GET /tenants | ✅ | — | — | — | — |
| POST /users | ✅ | ✅ | — | — | — |
| GET /users | ✅ | ✅ | — | — | — |
| POST /students | ✅ | ✅ | ✅ | — | — |
| GET /students | ✅ | ✅ | ✅ | — | — |
| POST /teachers | ✅ | ✅ | — | — | — |
| GET /teachers | ✅ | ✅ | ✅ | — | — |
| POST/GET /academics/* | ✅ | ✅ | ✅/GET | — | — |
| POST /attendances | ✅ | ✅ | ✅ | — | — |
| GET /attendances | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /fees/assignments | ✅ | ✅ | — | — | — |
| POST /fees/payments | ✅ | ✅ | — | — | — |
| GET /fees/students/:id/assignments | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /exams | ✅ | ✅ | ✅ | — | — |
| GET /exams | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /exams/results | ✅ | ✅ | ✅ | — | — |
| GET /exams/{id}/results | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /homework | ✅ | ✅ | ✅ | — | — |
| GET /homework/classes/:id | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /timetable/slots | ✅ | ✅ | ✅ | — | — |
| GET /timetable/classes/:id/sections/:id | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /parents/me/children | — | — | — | — | ✅ |
| GET /dashboard/tenant-summary | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /dashboard/super-admin-summary | ✅ | — | — | — | — |
| POST /bulk/upload | ✅ | ✅ | — | — | — |

---

## 8. Request Lifecycle

```
HTTP Request arrives
│
├── Headers: Authorization: Bearer <JWT>
│             X-Tenant-ID: greenwood
│
▼
TenantRequestFilter
  Reads X-Tenant-ID → TenantContext.setTenant("greenwood")
  (ThreadLocal — cleared in finally block)
│
▼
JwtAuthenticationFilter
  Extracts Bearer token from Authorization header
  Validates HS256 signature and expiry
  Populates SecurityContextHolder
│
▼
Spring Security @PreAuthorize
  Evaluates role expression (e.g., hasRole('TEACHER'))
  → 403 if role check fails  (JSON via ApiAccessDeniedHandler)
  → 401 if no/invalid token  (JSON via ApiAuthenticationEntryPoint)
│
▼
Controller Method
  @Valid validates DTO → 400 on constraint violation
  Calls service method
│
▼
Service Implementation
  validateTenantContext() → throws if schema is "public"
  Executes business logic
  Calls repository
│
▼
Spring Data JPA Repository
  TenantIdentifierResolver → resolves schema from TenantContext
  SchemaMultiTenantConnectionProvider → SET search_path = greenwood
  SQL executes in greenwood schema
│
▼
Response
  Wrapped in ApiResponse<T>
  TenantContext.clear() runs in filter finally block
  JSON returned to client
```

---

## 9. Integration Points

### 9.1 REST API

- Base path: `/api/v1`
- Content type: `application/json`
- Auth: `Authorization: Bearer <JWT>`
- Tenant: `X-Tenant-ID` header

### 9.2 Swagger / OpenAPI

Available at runtime:

| URL | Description |
|-----|-------------|
| `http://localhost:8080/swagger-ui.html` | Interactive Swagger UI |
| `http://localhost:8080/v3/api-docs` | Raw OpenAPI JSON spec |

### 9.3 File Processing

`POST /api/v1/bulk/upload` — multipart Excel upload:
- Parser: Apache POI 5.3.0
- Supported sheets: Students, Teachers, Classes, Sections
- Returns: `{ successCount, failedCount, errors[] }` with row-level detail
- Sample template: `GET /api/v1/bulk/sample`

### 9.4 External Services

As of v1.0, there are **no external third-party integrations**:

| Service | Status |
|---------|--------|
| Email notifications | Pending |
| Payment gateway | Pending (fees are manually recorded) |
| SMS / Push notifications | Pending |

---

## 10. Deployment Architecture

### 10.1 Docker Compose Stack

```
docker-compose.yml
│
├── postgres  (campuscloud-postgres)
│   ├── Image:       postgres:16-alpine
│   ├── Port:        5432:5432
│   ├── Volume:      postgres_data (persistent)
│   └── Health:      pg_isready
│
├── backend   (campuscloud-backend)
│   ├── Build:       ./backend/Dockerfile
│   ├── Port:        8080:8080
│   ├── Depends on:  postgres (healthy)
│   └── Restart:     unless-stopped
│
└── frontend  (campuscloud-frontend)
    ├── Image:       node:22-alpine
    ├── Port:        5173:5173
    ├── Command:     npm install && npm run dev -- --host 0.0.0.0
    └── Depends on:  backend
```

### 10.2 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DB_URL` | Yes | `jdbc:postgresql://localhost:5432/campuscloud` | PostgreSQL JDBC URL |
| `DB_USERNAME` | Yes | `postgres` | Database username |
| `DB_PASSWORD` | Yes | — | Database password |
| `JWT_SECRET` | Yes | — | JWT signing secret (minimum 32 bytes) |
| `JWT_ACCESS_TOKEN_EXPIRATION_MS` | No | `3600000` | Token TTL in ms (default: 1 hour) |
| `BOOTSTRAP_ADMIN_USERNAME` | No | `superadmin` | Initial Super Admin username |
| `BOOTSTRAP_ADMIN_PASSWORD` | Yes | — | Initial Super Admin password |
| `BOOTSTRAP_ADMIN_ROLE` | No | `SUPER_ADMIN` | Bootstrap admin role |
| `SERVER_PORT` | No | `8080` | Backend HTTP server port |

### 10.3 Build & Run Commands

```bash
# Full project build
./scripts/build.sh

# Start development (backend + frontend concurrently)
./scripts/start-dev.sh

# Docker Compose (production-like local)
docker compose up --build

# Backend only
cd backend && mvn clean package -DskipTests
cd backend && mvn spring-boot:run

# Frontend only
cd frontend && npm install
cd frontend && npm run dev
```
