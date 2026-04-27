# CampusCloud

**Production-grade multi-tenant SaaS school management platform.**

Each school runs in a fully isolated PostgreSQL schema. A single deployment serves unlimited schools. The platform covers students, teachers, academics, attendance, fees, and exams — secured with JWT and role-based access control.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Tech Stack](#3-tech-stack)
4. [Architecture](#4-architecture)
5. [Multi-Tenancy](#5-multi-tenancy)
6. [Project Structure](#6-project-structure)
7. [Prerequisites](#7-prerequisites)
8. [Local Setup](#8-local-setup)
9. [Docker Setup](#9-docker-setup)
10. [Environment Variables](#10-environment-variables)
11. [Authentication](#11-authentication)
12. [Role-Based Access Control](#12-role-based-access-control)
13. [API Reference](#13-api-reference)
14. [Database Schema](#14-database-schema)
15. [Business Rules](#15-business-rules)
16. [Error Handling](#16-error-handling)
17. [Running Tests](#17-running-tests)
18. [CI / CD](#18-ci--cd)
19. [Frontend](#19-frontend)
20. [Swagger / Postman](#20-swagger--postman)
21. [Troubleshooting](#21-troubleshooting)
22. [Roadmap](#22-roadmap)

---

## 1. Project Overview

CampusCloud is a multi-tenant SaaS platform for school management. A single deployment serves multiple schools simultaneously. Each school (tenant) is isolated in its own PostgreSQL schema — no data sharing, no discriminator columns, complete structural isolation.

| Property | Value |
|---|---|
| Architecture | Modular Monolith (microservice-ready domain boundaries) |
| Multi-tenancy | Schema-per-tenant |
| Tenant resolution | `X-Tenant-ID` HTTP header → `ThreadLocal` → Hibernate schema router |
| Authentication | Stateless JWT (HS256) |
| Authorisation | `@PreAuthorize` on every controller method |
| API style | REST JSON, `/api/v1/` prefix, uniform `ApiResponse<T>` envelope |
| Base package | `com.campuscloud` |

---

## 2. Features

| Domain | Capabilities |
|---|---|
| **Tenant Management** | Create school tenants; auto-provision PostgreSQL schema + 11 domain tables in one transaction; list and get tenants |
| **User Accounts** | Create staff accounts with roles; BCrypt password hashing; username and email normalised to lowercase; paginated list |
| **Student Enrollment** | Enroll students; admission number normalised to uppercase and enforced unique; gender enum; optional email/phone; paginated list; get by ID |
| **Teacher Management** | Add teachers; employee number normalised to uppercase; email normalised to lowercase; both unique; paginated list; get by ID |
| **Academic Structure** | Create classes, subjects, sections; section has FK to class; code uniqueness per entity |
| **Attendance** | Mark daily attendance per student; UNIQUE(student_id, attendance_date) enforced in service; status enum (PRESENT/ABSENT/LATE/EXCUSED); get by ID or date |
| **Fee Management** | Assign fees to students; record payments; automatic PENDING→PARTIALLY_PAID→PAID transitions; overpayment blocked; get assignments by student |
| **Exams & Results** | Schedule exams with duplicate-guard; enter results with marks-overflow guard; one result per student per exam; get results by exam |
| **Security** | JWT stateless auth; method-level `@PreAuthorize` on every endpoint; bootstrap super-admin from env vars; fail-fast secret validation |
| **API Docs** | Swagger UI; OpenAPI 3 schema; Postman collection with auto-captured JWT |
| **DevOps** | Multi-stage Docker build; non-root container user; Docker Compose with health checks; GitHub Actions CI + GHCR image publish |
| **Testing** | 33 unit tests (Mockito, no Spring context) covering all service-layer business rules |

---

## 3. Tech Stack

### Backend

| Technology | Version | Role |
|---|---|---|
| Java | 17 | Language |
| Spring Boot | 3.x | Application framework |
| Spring Security | 6.x | Auth & authorisation filter chain |
| Spring Data JPA | 3.x | Repository layer |
| Hibernate | 6.x | JPA provider; custom `CurrentTenantIdentifierResolver` |
| PostgreSQL | 16 | Primary datastore |
| Flyway | Latest | Manages `public` schema migrations |
| JJWT | Latest | JWT generation and validation |
| Maven | 3.8+ | Build and dependency management |
| Lombok | Latest | `@Slf4j`, `@Getter`, `@Builder` boilerplate reduction |
| SpringDoc OpenAPI | 2.x | Swagger UI + OpenAPI 3 JSON |
| Docker / Compose | Latest | Container build and orchestration |

### Frontend

| Technology | Version | Role |
|---|---|---|
| React | 18.x | UI library |
| TypeScript | 5.x | Type safety |
| Vite | Latest | Build tool and HMR dev server |
| Tailwind CSS | 3.x | Utility-first styling |
| React Router | v6 | Client-side routing |
| Axios | Latest | HTTP client with interceptors |
| TanStack Query | v5 | Server-state caching and mutations |

---

## 4. Architecture

### System Diagram

```
+-------------------------------------------------------+
|           React SPA  (port 5173 in dev)               |
|                                                       |
|  React Router v6  |  TanStack Query  |  Tailwind CSS  |
|                                                       |
|  Axios interceptors on every request:                 |
|    Authorization: Bearer <JWT>                        |
|    X-Tenant-ID:   <schema-name>                       |
+------------------------+------------------------------+
                         | HTTPS / REST JSON
+------------------------v------------------------------+
|           Spring Boot API  (port 8080)                |
|                                                       |
|  Filter Chain (ordered):                              |
|    1. TenantRequestFilter                             |
|         X-Tenant-ID -> TenantContext (ThreadLocal)    |
|         clears in finally block                       |
|    2. JwtAuthenticationFilter                         |
|         Bearer token -> JwtService.validate()         |
|         -> SecurityContextHolder                      |
|                                                       |
|  Controllers  (@PreAuthorize on every method)         |
|    /api/v1/auth  /tenants  /users  /students          |
|    /teachers  /academic  /attendance  /fees  /exams   |
|                                                       |
|  Services  (validateTenantContext + business rules)   |
|                                                       |
|  Spring Data JPA Repositories                         |
|    CurrentTenantIdentifierResolver reads ThreadLocal  |
|    -> all SQL targets the correct schema              |
+------------------------+------------------------------+
                         | JDBC
+------------------------v------------------------------+
|                   PostgreSQL 16                       |
|                                                       |
|  public schema  (Flyway-managed)                      |
|    tenants | flyway_schema_history                    |
|                                                       |
|  greenwood schema  (auto-provisioned)                 |
|    users | students | teachers | classes | subjects   |
|    sections | attendance_records | fee_assignments    |
|    fee_payments | exams | exam_results                |
|                                                       |
|  riverside schema  (another tenant, fully isolated)   |
|    (same 11 tables, zero shared data)                 |
+-------------------------------------------------------+
```

### Backend Module Map

```
com.campuscloud/
+-- auth/
|   +-- controller/    AuthController            POST /api/v1/auth/login
|   +-- filter/        JwtAuthenticationFilter   OncePerRequestFilter
|   +-- service/       JwtServiceImpl            token gen/validate
|   |                  DatabaseUserDetailsService bootstrap-first lookup
|   +-- dto/           LoginRequest, LoginResponse
+-- common/
|   +-- ApiResponse<T>                           universal response envelope
|   +-- PageResponse<T>                          pagination wrapper
|   +-- GlobalExceptionHandler                   @RestControllerAdvice
+-- config/
|   +-- SecurityConfig                           filter chain, @EnableMethodSecurity
|   +-- SwaggerConfig                            OpenAPI 3 bean
|   +-- PasswordConfig                           BCryptPasswordEncoder bean
+-- tenant/
|   +-- controller/    TenantController          /api/v1/tenants
|   +-- service/       TenantServiceImpl         schema + table provisioning
|   +-- entity/        Tenant                    public schema entity
|   +-- TenantContext                            ThreadLocal<String>
|   +-- TenantRequestFilter                      reads X-Tenant-ID header
+-- user/              UserController            /api/v1/users
+-- student/           StudentController         /api/v1/students
+-- teacher/           TeacherController         /api/v1/teachers
+-- academic/          AcademicController        /api/v1/academic/classes|subjects|sections
+-- attendance/        AttendanceController      /api/v1/attendance
+-- fees/              FeesController            /api/v1/fees/assignments|payments
+-- exam/              ExamController            /api/v1/exams
```

For the full architecture deep-dive see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 5. Multi-Tenancy

### Strategy: Schema-Per-Tenant

Each school gets its own PostgreSQL schema. No WHERE-tenant_id columns anywhere. No cross-schema joins. Complete structural isolation.

### How It Works

```
1.  Client sends:
      X-Tenant-ID: greenwood
      Authorization: Bearer <jwt>

2.  TenantRequestFilter (runs first):
      schema = request.getHeader("X-Tenant-ID")   // "greenwood"
      TenantContext.setTenant(schema)              // ThreadLocal<String> set

3.  JwtAuthenticationFilter (runs second):
      extracts + validates Bearer token
      populates SecurityContextHolder

4.  Controller:
      @PreAuthorize("hasAnyRole('SUPER_ADMIN','SCHOOL_ADMIN')")

5.  Service:
      validateTenantContext()   // throws if schema = "public" or blank
      repository.findAll(...)

6.  Hibernate CurrentTenantIdentifierResolver:
      return TenantContext.getTenant()   // "greenwood"
      SQL executes as: SELECT * FROM greenwood.students ...

7.  After response sent:
      TenantContext.clear()   // ThreadLocal cleaned - no cross-tenant bleed
```

### Tenant Provisioning (SQL executed on POST /api/v1/tenants)

`TenantServiceImpl.initializeTenantTables()` runs these statements via `JdbcTemplate`:

```sql
CREATE SCHEMA IF NOT EXISTS greenwood;

CREATE TABLE IF NOT EXISTS greenwood.users (
    id            UUID         PRIMARY KEY,
    full_name     VARCHAR(255) NOT NULL,
    username      VARCHAR(100) UNIQUE NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(50)  NOT NULL,
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL
);

CREATE TABLE IF NOT EXISTS greenwood.students (
    id            UUID         PRIMARY KEY,
    admission_no  VARCHAR(50)  UNIQUE NOT NULL,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender        VARCHAR(20),
    email         VARCHAR(255),
    phone         VARCHAR(30),
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL
);

CREATE TABLE IF NOT EXISTS greenwood.teachers (
    id          UUID         PRIMARY KEY,
    employee_no VARCHAR(50)  UNIQUE NOT NULL,
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    phone       VARCHAR(30),
    hire_date   DATE,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL
);

CREATE TABLE IF NOT EXISTS greenwood.classes (
    id         UUID        PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    code       VARCHAR(20)  UNIQUE NOT NULL,
    active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ  NOT NULL
);

CREATE TABLE IF NOT EXISTS greenwood.subjects (
    id         UUID         PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    code       VARCHAR(20)  UNIQUE NOT NULL,
    active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ  NOT NULL
);

CREATE TABLE IF NOT EXISTS greenwood.sections (
    id         UUID        PRIMARY KEY,
    name       VARCHAR(50) NOT NULL,
    class_id   UUID        REFERENCES greenwood.classes(id),
    active     BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS greenwood.attendance_records (
    id                UUID        PRIMARY KEY,
    student_id        UUID        NOT NULL,
    class_id          UUID        NOT NULL,
    section_id        UUID        NOT NULL,
    attendance_date   DATE        NOT NULL,
    status            VARCHAR(20) NOT NULL,
    remarks           TEXT,
    marked_by_user_id UUID,
    created_at        TIMESTAMPTZ NOT NULL,
    UNIQUE(student_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS greenwood.fee_assignments (
    id         UUID           PRIMARY KEY,
    student_id UUID           NOT NULL,
    fee_title  VARCHAR(255)   NOT NULL,
    amount     NUMERIC(12, 2) NOT NULL,
    due_date   DATE           NOT NULL,
    status     VARCHAR(30)    NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ    NOT NULL
);

CREATE TABLE IF NOT EXISTS greenwood.fee_payments (
    id                  UUID           PRIMARY KEY,
    fee_assignment_id   UUID           NOT NULL REFERENCES greenwood.fee_assignments(id),
    amount_paid         NUMERIC(12, 2) NOT NULL,
    payment_date        DATE           NOT NULL,
    payment_method      VARCHAR(50),
    reference_no        VARCHAR(100),
    received_by_user_id UUID,
    created_at          TIMESTAMPTZ    NOT NULL
);

CREATE TABLE IF NOT EXISTS greenwood.exams (
    id         UUID         PRIMARY KEY,
    title      VARCHAR(255) NOT NULL,
    exam_date  DATE         NOT NULL,
    class_id   UUID         NOT NULL,
    section_id UUID         NOT NULL,
    subject_id UUID         NOT NULL,
    max_marks  INTEGER      NOT NULL,
    active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ  NOT NULL,
    UNIQUE(title, exam_date, class_id, section_id, subject_id)
);

CREATE TABLE IF NOT EXISTS greenwood.exam_results (
    id             UUID           PRIMARY KEY,
    exam_id        UUID           NOT NULL REFERENCES greenwood.exams(id),
    student_id     UUID           NOT NULL,
    marks_obtained NUMERIC(8, 2)  NOT NULL,
    grade          VARCHAR(5),
    remarks        TEXT,
    published      BOOLEAN        NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMPTZ    NOT NULL,
    UNIQUE(exam_id, student_id)
);
```

### Public Schema (Flyway V1)

```sql
CREATE TABLE IF NOT EXISTS public.tenants (
    id          UUID         PRIMARY KEY,
    name        VARCHAR(255) UNIQUE NOT NULL,
    schema_name VARCHAR(100) UNIQUE NOT NULL,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL
);
```

---

## 6. Project Structure

```
CampusCloud/
+-- .github/
|   +-- workflows/
|       +-- ci.yml                    # CI: PostgreSQL service + mvn verify on every PR/push
|       +-- docker-publish.yml        # Publish Docker image to GHCR on main + tags
+-- docs/
|   +-- API.md                        # Complete API reference (all modules)
|   +-- ARCHITECTURE.md              # Architecture deep-dive
|   +-- PROJECT_TRACKER.md           # Living tracker, AI context, roadmap
+-- frontend/
|   +-- src/
|   |   +-- app/
|   |   |   +-- App.tsx               # Root component
|   |   |   +-- routes.tsx            # All React Router v6 route definitions
|   |   |   +-- providers.tsx         # QueryClientProvider + AuthProvider
|   |   +-- api/
|   |   |   +-- axiosClient.ts        # Axios instance + JWT/X-Tenant-ID interceptors
|   |   |   +-- endpoints.ts          # All API URL constants
|   |   +-- components/
|   |   |   +-- layout/
|   |   |   |   +-- DashboardLayout.tsx  # Persistent sidebar + main shell
|   |   |   +-- ui/
|   |   |       +-- PageHeader.tsx    # Reusable page title bar
|   |   |       +-- DataTable.tsx     # Generic paginated table component
|   |   |       +-- FormInput.tsx     # Labelled input primitive
|   |   |       +-- FormSelect.tsx    # Labelled select primitive
|   |   +-- features/
|   |   |   +-- auth/                 # Login, AuthContext, PrivateRoute, PublicRoute
|   |   |   +-- student/              # Student list + create (complete)
|   |   |   +-- teacher/              # Scaffolded (types, API stub, page)
|   |   |   +-- academic/             # Scaffolded (types, API stub, page)
|   |   +-- types/
|   |   |   +-- pagination.ts         # ApiResponse<T>, PageResponse<T>
|   |   +-- utils/
|   |       +-- storage.ts            # localStorage helpers (token, tenantId)
|   +-- package.json
|   +-- vite.config.ts
+-- postman/
|   +-- CampusCloud.postman_collection.json
|   +-- CampusCloud.local.postman_environment.json
+-- src/
|   +-- main/
|   |   +-- java/com/campuscloud/     # All backend source (see module map above)
|   |   +-- resources/
|   |       +-- application.yml
|   |       +-- db/migration/
|   |           +-- V1__init_public_schema.sql
|   |           +-- V2__baseline_public_schema_extensions.sql
|   +-- test/
|       +-- java/com/campuscloud/
|           +-- user/UserServiceImplTest.java    7 tests
|           +-- fees/FeesServiceImplTest.java    10 tests
|           +-- exam/ExamServiceImplTest.java    16 tests
+-- .env.example
+-- .gitignore
+-- docker-compose.yml
+-- Dockerfile
+-- pom.xml
```

Each backend module follows this internal layout:

```
com.campuscloud.<module>/
    controller/    REST layer only, no business logic
    service/       Interface + @Service implementation
    repository/    Spring Data JPA interface
    entity/        JPA entities — never returned from controllers
    dto/           Java records (request/response contracts)
```

---

## 7. Prerequisites

| Tool | Min Version | Check |
|---|---|---|
| Java | 17 | `java -version` |
| Maven | 3.8 | `mvn -version` |
| Docker + Compose | Latest | `docker -v && docker compose version` |
| Node.js | 18 | `node -v` |
| PostgreSQL | 16 | Only needed for local non-Docker setup |

---

## 8. Local Setup

### Step 1 — Clone

```bash
git clone https://github.com/your-org/campuscloud.git
cd campuscloud
```

### Step 2 — Configure secrets

```bash
cp .env.example .env
```

Generate a 32-byte JWT secret:

```bash
openssl rand -hex 32
```

Edit `.env` and fill in all values (see [Section 10](#10-environment-variables)).

### Step 3 — Create the database

```sql
CREATE DATABASE campuscloud;
```

### Step 4 — Start the backend

```bash
# Load env vars into the shell
export $(grep -v '^#' .env | xargs)

# Start Spring Boot — Flyway runs automatically on startup
mvn spring-boot:run
```

- API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

### Step 5 — Start the frontend

```bash
cd frontend
npm install
npm run dev
```

- Frontend: `http://localhost:5173`

---

## 9. Docker Setup

```bash
# 1. Configure
cp .env.example .env
# Edit .env with real values

# 2. Build and start full stack
docker compose up --build

# Detached mode
docker compose up --build -d

# View logs
docker compose logs -f app

# Stop
docker compose down
```

| Service | URL |
|---|---|
| API | `http://localhost:8080` |
| Swagger UI | `http://localhost:8080/swagger-ui.html` |
| PostgreSQL | `localhost:5432` |

### docker-compose.yml

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB:       ${DB_NAME}
      POSTGRES_USER:     ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME} -d ${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: .
    ports:
      - "8080:8080"
    depends_on:
      db:
        condition: service_healthy
    env_file: .env
    environment:
      DB_HOST: db

volumes:
  postgres_data:
```

### Dockerfile

```dockerfile
# Stage 1 - Build
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn clean package -DskipTests -q

# Stage 2 - Runtime (minimal Alpine JRE)
FROM eclipse-temurin:17-jre-alpine
RUN addgroup -S spring && adduser -S spring -G spring
USER spring
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", "app.jar"]
```

Build and run manually:

```bash
mvn clean package -DskipTests
java -jar target/digital-school-saas-0.0.1-SNAPSHOT.jar

docker build -t campuscloud:latest .
docker run -p 8080:8080 --env-file .env campuscloud:latest
```

---

## 10. Environment Variables

Copy `.env.example` to `.env`. **Never commit `.env`.**

```dotenv
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=campuscloud
DB_USERNAME=postgres
DB_PASSWORD=changeme

# JWT — generate with: openssl rand -hex 32 (MUST be >= 32 bytes)
JWT_SECRET=replace-with-openssl-rand-hex-32-output
JWT_ACCESS_TOKEN_EXPIRATION_MS=3600000

# Bootstrap Super Admin — created at startup from these values, no SQL needed
# App refuses to start if any of these are blank
BOOTSTRAP_ADMIN_USERNAME=superadmin
BOOTSTRAP_ADMIN_PASSWORD=changeme
BOOTSTRAP_ADMIN_ROLE=SUPER_ADMIN
```

| Variable | Required | Description |
|---|---|---|
| `DB_HOST` | Yes | PostgreSQL host (`db` inside Docker Compose) |
| `DB_PORT` | Yes | PostgreSQL port |
| `DB_NAME` | Yes | Database name |
| `DB_USERNAME` | Yes | Database user |
| `DB_PASSWORD` | Yes | Database password |
| `JWT_SECRET` | Yes | HS256 signing key — **minimum 32 bytes** |
| `JWT_ACCESS_TOKEN_EXPIRATION_MS` | Yes | Token TTL in ms — `3600000` = 1 hour |
| `BOOTSTRAP_ADMIN_USERNAME` | Yes | Initial SUPER_ADMIN login name |
| `BOOTSTRAP_ADMIN_PASSWORD` | Yes | Initial SUPER_ADMIN password |
| `BOOTSTRAP_ADMIN_ROLE` | Yes | Must be `SUPER_ADMIN` |

The application **refuses to start** if any variable is missing or empty.

### application.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: none
    properties:
      hibernate:
        multi_tenancy: SCHEMA
        tenant_identifier_resolver: com.campuscloud.tenant.TenantIdentifierResolver
        multi_tenant_connection_provider: com.campuscloud.tenant.SchemaMultiTenantConnectionProvider
  flyway:
    enabled: true
    locations: classpath:db/migration
    schemas: public

app:
  jwt:
    secret: ${JWT_SECRET}
    access-token-expiration-ms: ${JWT_ACCESS_TOKEN_EXPIRATION_MS}
  security:
    bootstrap-admin:
      username: ${BOOTSTRAP_ADMIN_USERNAME}
      password: ${BOOTSTRAP_ADMIN_PASSWORD}
      role:     ${BOOTSTRAP_ADMIN_ROLE}
```

---

## 11. Authentication

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json
```

```json
{
  "username": "superadmin",
  "password": "your-password"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdXBlcmFkbWluIiwicm9sZSI6IlJPTEVfU1VQRVJfQURNSU4iLCJpYXQiOjE3NDU3NDQ4MDAsImV4cCI6MTc0NTc0ODQwMH0.SIGNATURE",
    "username": "superadmin",
    "role": "SUPER_ADMIN"
  },
  "timestamp": "2026-04-27T10:00:00Z"
}
```

### Using the Token

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
X-Tenant-ID: greenwood
Content-Type: application/json
```

Both headers are required for all tenant-scoped endpoints. `X-Tenant-ID` is the `schema_name` of an active tenant.

### Token Properties

| Property | Value |
|---|---|
| Algorithm | HS256 |
| Subject claim | `username` |
| Custom claim | `role` (e.g. `ROLE_SUPER_ADMIN`) |
| Expiry | `JWT_ACCESS_TOKEN_EXPIRATION_MS` ms from issue |
| Secret | Minimum 32 bytes; from env var only, never hardcoded |

### Bootstrap Super Admin

- Created at startup via `@PostConstruct` from `BOOTSTRAP_ADMIN_*` env vars.
- Password BCrypt-hashed once at startup.
- `DatabaseUserDetailsService` intercepts this username before any DB query.
- Does **not** exist in the `users` table — lives only in memory.
- Does not require `X-Tenant-ID` for tenant management.

### Auth Pipeline

```
POST /api/v1/auth/login
  -> AuthController.login(LoginRequest)
  -> AuthenticationManager.authenticate(UsernamePasswordAuthenticationToken)
  -> DatabaseUserDetailsService.loadUserByUsername(username)
       if username == BOOTSTRAP_ADMIN -> return in-memory UserDetails
       else -> query users table in tenant schema
  -> JwtServiceImpl.generateToken(userDetails)
  -> LoginResponse { token, username, role }

All other requests:
  -> JwtAuthenticationFilter (OncePerRequestFilter)
  -> Extract "Bearer <token>" from Authorization header
  -> JwtServiceImpl.extractUsername(token)
  -> Load UserDetails
  -> JwtServiceImpl.isTokenValid(token, userDetails)
       - signature valid?
       - not expired?
  -> SecurityContextHolder.setAuthentication(...)
```

---

## 12. Role-Based Access Control

### Roles

```java
public enum UserRole {
    SUPER_ADMIN, SCHOOL_ADMIN, TEACHER, STUDENT, PARENT
}
```

### Role Capabilities

| Role | Scope | Key Permissions |
|---|---|---|
| `SUPER_ADMIN` | Platform | All tenant management; all domain modules |
| `SCHOOL_ADMIN` | School | Users, students, teachers, academics, fees |
| `TEACHER` | School | Read students/teachers; mark attendance; schedule exams; enter results |
| `STUDENT` | School | Own exam results *(ownership model — roadmap)* |
| `PARENT` | School | Own child's fees and results *(ownership model — roadmap)* |

### Endpoint Role Matrix

| Endpoint | SUPER_ADMIN | SCHOOL_ADMIN | TEACHER | STUDENT | PARENT |
|---|---|---|---|---|---|
| `POST /auth/login` | Public | Public | Public | Public | Public |
| `POST /tenants` | Yes | - | - | - | - |
| `GET /tenants` | Yes | - | - | - | - |
| `GET /tenants/{id}` | Yes | - | - | - | - |
| `POST /users` | Yes | Yes | - | - | - |
| `GET /users` | Yes | Yes | - | - | - |
| `POST /students` | Yes | Yes | - | - | - |
| `GET /students` | Yes | Yes | Yes | - | - |
| `GET /students/{id}` | Yes | Yes | Yes | - | - |
| `POST /teachers` | Yes | Yes | - | - | - |
| `GET /teachers` | Yes | Yes | Yes | - | - |
| `GET /teachers/{id}` | Yes | Yes | Yes | - | - |
| `POST /academic/classes` | Yes | Yes | - | - | - |
| `GET /academic/classes` | Yes | Yes | Yes | - | - |
| `POST /academic/subjects` | Yes | Yes | - | - | - |
| `GET /academic/subjects` | Yes | Yes | Yes | - | - |
| `POST /academic/sections` | Yes | Yes | - | - | - |
| `GET /academic/sections` | Yes | Yes | Yes | - | - |
| `POST /attendance` | Yes | Yes | Yes | - | - |
| `GET /attendance/{id}` | Yes | Yes | Yes | - | - |
| `GET /attendance/date/{date}` | Yes | Yes | Yes | - | - |
| `POST /fees/assignments` | Yes | Yes | - | - | - |
| `GET /fees/assignments/student/{id}` | Yes | Yes | - | - | - |
| `POST /fees/payments` | Yes | Yes | - | - | - |
| `POST /exams` | Yes | Yes | Yes | - | - |
| `GET /exams/class/{classId}` | Yes | Yes | Yes | - | - |
| `POST /exams/results` | Yes | Yes | Yes | - | - |
| `GET /exams/results/exam/{examId}` | Yes | Yes | Yes | - | - |

Every controller method has `@PreAuthorize`. No implicit permissions.

---

## 13. API Reference

**Base URL:** `http://localhost:8080/api/v1`

### Response Envelope

```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": { ... },
  "timestamp": "2026-04-27T10:00:00Z"
}
```

Paginated lists wrap `data` in `PageResponse<T>`:

```json
{
  "content": [ ... ],
  "page": 0,
  "size": 20,
  "totalElements": 87,
  "totalPages": 5,
  "last": false
}
```

Pagination query params on all list endpoints: `?page=0&size=20&sort=createdAt,desc`

---

### Auth

**POST /api/v1/auth/login** — no auth required

```json
// Request
{ "username": "superadmin", "password": "secret" }

// Response 200
{ "data": { "token": "eyJ...", "username": "superadmin", "role": "SUPER_ADMIN" } }
```

---

### Tenants (SUPER_ADMIN only, no X-Tenant-ID needed)

**POST /api/v1/tenants**

```json
// Request
{ "name": "Greenwood High School", "schemaName": "greenwood" }

// Response 200
{ "data": { "id": "uuid", "name": "Greenwood High School", "schemaName": "greenwood", "active": true, "createdAt": "..." } }
```

**GET /api/v1/tenants** — list of all TenantResponse

**GET /api/v1/tenants/{id}** — single TenantResponse

---

### Users (SCHOOL_ADMIN+, requires X-Tenant-ID)

**POST /api/v1/users**

```json
// Request
{
  "fullName": "Jane Smith",
  "username": "janesmith",         // stored lowercase
  "email": "jane@school.edu",      // stored lowercase
  "password": "SecurePass123!",    // stored as BCrypt hash
  "role": "SCHOOL_ADMIN"           // SUPER_ADMIN|SCHOOL_ADMIN|TEACHER|STUDENT|PARENT
}
```

**GET /api/v1/users?page=0&size=20** — paginated UserResponse

---

### Students (requires X-Tenant-ID)

**POST /api/v1/students** — min role SCHOOL_ADMIN

```json
// Request
{
  "admissionNo":  "STU2026001",     // stored UPPERCASE, must be unique
  "firstName":    "Alice",
  "lastName":     "Johnson",
  "dateOfBirth":  "2010-06-15",    // yyyy-MM-dd
  "gender":       "FEMALE",        // MALE|FEMALE|OTHER
  "email":        "alice@school.edu",  // optional
  "phone":        "+1-555-0100"        // optional
}

// Response 200
{
  "data": {
    "id": "uuid", "admissionNo": "STU2026001", "firstName": "Alice",
    "lastName": "Johnson", "dateOfBirth": "2010-06-15", "gender": "FEMALE",
    "email": "alice@school.edu", "phone": "+1-555-0100",
    "active": true, "createdAt": "..."
  }
}
```

**GET /api/v1/students?page=0&size=20** — min role TEACHER, paginated

**GET /api/v1/students/{id}** — min role TEACHER

---

### Teachers (requires X-Tenant-ID)

**POST /api/v1/teachers** — min role SCHOOL_ADMIN

```json
// Request
{
  "employeeNo": "EMP2026001",       // stored UPPERCASE, must be unique
  "firstName":  "Robert",
  "lastName":   "Williams",
  "email":      "r.w@school.edu",  // stored lowercase, must be unique
  "phone":      "+1-555-0200",     // optional
  "hireDate":   "2026-01-15"       // yyyy-MM-dd
}
```

**GET /api/v1/teachers?page=0&size=20** — min role TEACHER, paginated

**GET /api/v1/teachers/{id}** — min role TEACHER

---

### Academic (requires X-Tenant-ID)

**POST /api/v1/academic/classes** — min role SCHOOL_ADMIN

```json
{ "name": "Grade 10", "code": "G10" }   // code must be unique
```

**POST /api/v1/academic/subjects** — min role SCHOOL_ADMIN

```json
{ "name": "Mathematics", "code": "MATH101" }   // code must be unique
```

**POST /api/v1/academic/sections** — min role SCHOOL_ADMIN

```json
{ "name": "Section A", "classId": "uuid-of-existing-class" }
```

**GET /api/v1/academic/classes|subjects|sections** — min role TEACHER, returns list

---

### Attendance (requires X-Tenant-ID, min role TEACHER)

**POST /api/v1/attendance**

```json
// Request
{
  "studentId":      "uuid",
  "classId":        "uuid",
  "sectionId":      "uuid",
  "attendanceDate": "2026-04-27",         // yyyy-MM-dd
  "status":         "PRESENT",            // PRESENT|ABSENT|LATE|EXCUSED
  "remarks":        "On time"             // optional
}
// 400 if attendance already marked for this student on this date
```

**GET /api/v1/attendance/{id}** — single AttendanceResponse

**GET /api/v1/attendance/date/{date}** — all records for that date (yyyy-MM-dd)

---

### Fees (requires X-Tenant-ID, min role SCHOOL_ADMIN)

**POST /api/v1/fees/assignments**

```json
// Request
{
  "studentId": "uuid",
  "feeTitle":  "Term 1 Tuition Fee",
  "amount":    5000.00,
  "dueDate":   "2026-05-31"            // initial status always PENDING
}
```

**GET /api/v1/fees/assignments/student/{studentId}** — list of FeeAssignmentResponse

**POST /api/v1/fees/payments**

```json
// Request
{
  "feeAssignmentId": "uuid",
  "amountPaid":      2500.00,
  "paymentDate":     "2026-04-27",
  "paymentMethod":   "BANK_TRANSFER",   // optional
  "referenceNo":     "TXN20260427001"   // optional
}
// totalPaid + amountPaid  < amount  -> PARTIALLY_PAID
// totalPaid + amountPaid == amount  -> PAID
// totalPaid + amountPaid  > amount  -> 400 overpayment rejected
```

---

### Exams (requires X-Tenant-ID, min role TEACHER)

**POST /api/v1/exams**

```json
// Request
{
  "title":     "Mid-Term Mathematics",
  "examDate":  "2026-05-15",           // yyyy-MM-dd
  "classId":   "uuid",
  "sectionId": "uuid",
  "subjectId": "uuid",
  "maxMarks":  100
}
// 400 if UNIQUE(title, examDate, classId, sectionId, subjectId) already exists
```

**GET /api/v1/exams/class/{classId}** — list of ExamResponse

**POST /api/v1/exams/results**

```json
// Request
{
  "examId":        "uuid",
  "studentId":     "uuid",
  "marksObtained": 87,          // must be >= 0 and <= exam.maxMarks
  "grade":         "A",         // optional
  "remarks":       "Well done"  // optional
}
// 400 if result already exists for this student in this exam
// 400 if marksObtained > exam.maxMarks
```

**GET /api/v1/exams/results/exam/{examId}** — list of ExamResultResponse

For the full reference with complete field schemas see [docs/API.md](docs/API.md).

---

## 14. Database Schema

### Entity Field Reference

**users**

| Column | Type | Constraint |
|---|---|---|
| `id` | UUID | PK, set in `@PrePersist` |
| `full_name` | VARCHAR(255) | NOT NULL |
| `username` | VARCHAR(100) | UNIQUE NOT NULL, lowercase |
| `email` | VARCHAR(255) | UNIQUE NOT NULL, lowercase |
| `password_hash` | VARCHAR(255) | BCrypt, NOT NULL |
| `role` | VARCHAR(50) | Enum: SUPER_ADMIN, SCHOOL_ADMIN, TEACHER, STUDENT, PARENT |
| `active` | BOOLEAN | DEFAULT TRUE |
| `created_at` | TIMESTAMPTZ | NOT NULL |

**students**

| Column | Type | Constraint |
|---|---|---|
| `id` | UUID | PK |
| `admission_no` | VARCHAR(50) | UNIQUE NOT NULL, uppercase |
| `first_name` | VARCHAR(100) | NOT NULL |
| `last_name` | VARCHAR(100) | NOT NULL |
| `date_of_birth` | DATE | nullable |
| `gender` | VARCHAR(20) | MALE, FEMALE, OTHER |
| `email` | VARCHAR(255) | nullable |
| `phone` | VARCHAR(30) | nullable |
| `active` | BOOLEAN | DEFAULT TRUE |
| `created_at` | TIMESTAMPTZ | NOT NULL |

**teachers**

| Column | Type | Constraint |
|---|---|---|
| `id` | UUID | PK |
| `employee_no` | VARCHAR(50) | UNIQUE NOT NULL, uppercase |
| `first_name` | VARCHAR(100) | NOT NULL |
| `last_name` | VARCHAR(100) | NOT NULL |
| `email` | VARCHAR(255) | UNIQUE NOT NULL, lowercase |
| `phone` | VARCHAR(30) | nullable |
| `hire_date` | DATE | nullable |
| `active` | BOOLEAN | DEFAULT TRUE |
| `created_at` | TIMESTAMPTZ | NOT NULL |

**attendance_records**

| Column | Type | Constraint |
|---|---|---|
| `id` | UUID | PK |
| `student_id` | UUID | NOT NULL |
| `class_id` | UUID | NOT NULL |
| `section_id` | UUID | NOT NULL |
| `attendance_date` | DATE | NOT NULL |
| `status` | VARCHAR(20) | PRESENT, ABSENT, LATE, EXCUSED |
| `remarks` | TEXT | nullable |
| `marked_by_user_id` | UUID | nullable |
| `created_at` | TIMESTAMPTZ | NOT NULL |
| — | — | UNIQUE(student_id, attendance_date) |

**fee_assignments**

| Column | Type | Constraint |
|---|---|---|
| `id` | UUID | PK |
| `student_id` | UUID | NOT NULL |
| `fee_title` | VARCHAR(255) | NOT NULL |
| `amount` | NUMERIC(12,2) | NOT NULL |
| `due_date` | DATE | NOT NULL |
| `status` | VARCHAR(30) | PENDING, PARTIALLY_PAID, PAID |
| `created_at` | TIMESTAMPTZ | NOT NULL |

**exams**

| Column | Type | Constraint |
|---|---|---|
| `id` | UUID | PK |
| `title` | VARCHAR(255) | NOT NULL |
| `exam_date` | DATE | NOT NULL |
| `class_id` | UUID | NOT NULL |
| `section_id` | UUID | NOT NULL |
| `subject_id` | UUID | NOT NULL |
| `max_marks` | INTEGER | NOT NULL |
| `active` | BOOLEAN | DEFAULT TRUE |
| `created_at` | TIMESTAMPTZ | NOT NULL |
| — | — | UNIQUE(title, exam_date, class_id, section_id, subject_id) |

**exam_results**

| Column | Type | Constraint |
|---|---|---|
| `id` | UUID | PK |
| `exam_id` | UUID | FK -> exams |
| `student_id` | UUID | NOT NULL |
| `marks_obtained` | NUMERIC(8,2) | NOT NULL, <= exam.max_marks |
| `grade` | VARCHAR(5) | nullable |
| `remarks` | TEXT | nullable |
| `published` | BOOLEAN | DEFAULT FALSE |
| `created_at` | TIMESTAMPTZ | NOT NULL |
| — | — | UNIQUE(exam_id, student_id) |

---

## 15. Business Rules

### Normalisation

| Field | Rule |
|---|---|
| `username` | Trimmed, lowercased before save and uniqueness check |
| `email` (User, Teacher) | Trimmed, lowercased before save and uniqueness check |
| `admissionNo` | Trimmed, uppercased before save and uniqueness check |
| `employeeNo` | Trimmed, uppercased before save and uniqueness check |

### Uniqueness Guards (enforced in service layer)

| Entity | Unique constraint |
|---|---|
| UserAccount | `username` (per tenant), `email` (per tenant) |
| Student | `admission_no` (per tenant) |
| Teacher | `employee_no` (per tenant), `email` (per tenant) |
| SchoolClass | `code` (per tenant) |
| Subject | `code` (per tenant) |
| AttendanceRecord | (`student_id`, `attendance_date`) |
| Exam | (`title`, `exam_date`, `class_id`, `section_id`, `subject_id`) |
| ExamResult | (`exam_id`, `student_id`) |

### Fee Payment Reconciliation

```
On every POST /api/v1/fees/payments:

1. totalAlreadyPaid = SUM(amount_paid) for all payments on this assignment
2. remaining = assignment.amount - totalAlreadyPaid
3. if amountPaid > remaining -> throw IllegalArgumentException (overpayment blocked)
4. Save payment record
5. newTotal = totalAlreadyPaid + amountPaid
6. if newTotal >= assignment.amount -> status = PAID
   else                             -> status = PARTIALLY_PAID
```

### Exam Marks Guard

```
On POST /api/v1/exams/results:

1. Load exam by examId
2. if marksObtained > exam.maxMarks -> throw IllegalArgumentException
3. Check UNIQUE(examId, studentId) -> throw if duplicate
4. Save result
```

### Tenant Context Guard

Every service method (except auth and tenant management) begins with:

```java
if (schema == null || schema.equals("public")) {
    throw new IllegalArgumentException("No valid tenant context");
}
```

---

## 16. Error Handling

All errors return `ApiResponse` with `success: false`:

```json
{
  "success": false,
  "message": "Admission number STU001 already exists",
  "data": null,
  "timestamp": "2026-04-27T10:00:00Z"
}
```

| Exception | HTTP Status | Cause |
|---|---|---|
| `IllegalArgumentException` | 400 Bad Request | Duplicate, business rule violation, missing tenant |
| `AccessDeniedException` | 403 Forbidden | Insufficient role |
| `Exception` (catch-all) | 500 Internal Server Error | Unexpected — logged at ERROR |

---

## 17. Running Tests

```bash
# All 33 unit tests
mvn test

# Specific class
mvn test -Dtest=UserServiceImplTest
mvn test -Dtest=FeesServiceImplTest
mvn test -Dtest=ExamServiceImplTest

# With Surefire HTML report
mvn verify
```

Tests use Mockito — no Spring context, no database needed. Fast and isolated.

### Coverage by Test Class

**UserServiceImplTest (7 tests)**

| Test | Covers |
|---|---|
| `createUser_success` | Happy path |
| `createUser_duplicateUsername_throws` | Username uniqueness |
| `createUser_duplicateEmail_throws` | Email uniqueness |
| `createUser_normalisesUsername` | Lowercased before save |
| `createUser_normalisesEmail` | Lowercased before save |
| `createUser_noTenantContext_throws` | Tenant context guard |
| `listUsers_returnsPage` | Paginated list |

**FeesServiceImplTest (10 tests)**

| Test | Covers |
|---|---|
| `assignFee_success` | Happy path |
| `recordPayment_partialPay_statusPartiallyPaid` | Partial -> PARTIALLY_PAID |
| `recordPayment_fullPay_statusPaid` | Full -> PAID |
| `recordPayment_topUpToPaid_statusPaid` | Multiple payments -> PAID |
| `recordPayment_overpay_throws` | Overpayment blocked |
| `recordPayment_noAssignment_throws` | Assignment not found |
| `recordPayment_noTenantContext_throws` | Tenant context guard |
| `getFeeAssignmentsByStudent_returnsAll` | List by student |
| `assignFee_noStudent_throws` | Student not found |
| `assignFee_noTenantContext_throws` | Tenant context guard |

**ExamServiceImplTest (16 tests)**

| Test | Covers |
|---|---|
| `scheduleExam_success` | Happy path |
| `scheduleExam_duplicate_throws` | Duplicate exam guard |
| `scheduleExam_noTenantContext_throws` | Tenant context guard |
| `getExamsByClass_returnsAll` | List by class |
| `enterResult_success` | Happy path result entry |
| `enterResult_marksExceedMax_throws` | Marks overflow guard |
| `enterResult_duplicateResult_throws` | One result per student per exam |
| `enterResult_examNotFound_throws` | Exam not found |
| `enterResult_noTenantContext_throws` | Tenant context guard |
| + 7 additional boundary and edge cases | — |

---

## 18. CI / CD

### CI — `.github/workflows/ci.yml`

Triggers on every push and pull request to `main`:

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: campuscloud_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
      - run: mvn verify
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: campuscloud_test
          DB_USERNAME: postgres
          DB_PASSWORD: postgres
          JWT_SECRET: test-secret-must-be-at-least-32-bytes-long-xx
          JWT_ACCESS_TOKEN_EXPIRATION_MS: 3600000
          BOOTSTRAP_ADMIN_USERNAME: superadmin
          BOOTSTRAP_ADMIN_PASSWORD: testpassword
          BOOTSTRAP_ADMIN_ROLE: SUPER_ADMIN
```

### Docker Publish — `.github/workflows/docker-publish.yml`

Triggers on push to `main` and version tags:

```yaml
name: Docker Publish
on:
  push:
    branches: [main]
    tags: ['v*']
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/${{ github.repository }}:latest
```

---

## 19. Frontend

### Commands

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173 with HMR
npm run build     # Production build -> dist/
npm run preview   # Preview production build locally
```

### Vite Config (dev proxy)

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})
```

### Routes

```
/login          -> PublicRoute  -> LoginPage
/dashboard      -> PrivateRoute -> DashboardLayout
/students       -> PrivateRoute -> StudentListPage
/students/new   -> PrivateRoute -> StudentCreatePage
/teachers       -> PrivateRoute -> TeacherListPage   (scaffolded)
/academic       -> PrivateRoute -> AcademicPage      (scaffolded)
```

- `PrivateRoute` — redirects to `/login` if no JWT in `localStorage`
- `PublicRoute` — redirects to `/dashboard` if already authenticated

### Axios Interceptors

```typescript
axiosClient.interceptors.request.use((config) => {
  const token    = storage.getToken();
  const tenantId = storage.getTenantId();
  if (token)    config.headers['Authorization'] = `Bearer ${token}`;
  if (tenantId) config.headers['X-Tenant-ID']  = tenantId;
  return config;
});
```

### Auth Context Interface

```typescript
interface AuthContextType {
  user:            { username: string; role: string } | null;
  login:           (username: string, password: string, tenantId: string) => Promise<void>;
  logout:          () => void;
  isAuthenticated: boolean;
}
```

### Module Status

| Module | Status | Notes |
|---|---|---|
| App shell + routing | Complete | React Router v6, providers, layouts |
| Axios client | Complete | JWT + X-Tenant-ID interceptors |
| Auth | Complete | Login, AuthProvider, PrivateRoute, PublicRoute |
| Student | Complete | Paginated list + create form, TanStack Query |
| Teacher | Scaffolded | Types, API stub, page placeholder |
| Academic | Scaffolded | Types, API stub, page placeholder |

---

## 20. Swagger / Postman

### Swagger UI

With backend running:

- **UI:** `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON:** `http://localhost:8080/v3/api-docs`

All controllers are annotated with `@Tag` (module group) and `@Operation` (method description).

### Postman

Import both files:

```
postman/CampusCloud.postman_collection.json
postman/CampusCloud.local.postman_environment.json
```

Pre-configured environment variables:

| Variable | Value |
|---|---|
| `baseUrl` | `http://localhost:8080/api/v1` |
| `token` | auto-captured after login |
| `tenantId` | `greenwood` (update to your tenant) |

The login request runs this test script to auto-capture the JWT:

```javascript
const data = pm.response.json();
pm.environment.set("token", data.data.token);
```

---

## 21. Troubleshooting

### Application Won't Start

| Symptom | Cause | Fix |
|---|---|---|
| `Could not resolve placeholder 'JWT_SECRET'` | Missing env var | Copy `.env.example` -> `.env`, export all vars |
| `JWT secret must be at least 32 bytes` | Secret too short | `openssl rand -hex 32` and update `JWT_SECRET` |
| `BOOTSTRAP_ADMIN_USERNAME must not be blank` | Missing config | Set all three `BOOTSTRAP_ADMIN_*` vars |
| `Connection refused` to PostgreSQL | DB not running | `docker compose up db` or start PostgreSQL locally |
| Flyway error on startup | Wrong DB or schema | Ensure `DB_NAME` database exists |

### 401 Unauthorized

| Cause | Fix |
|---|---|
| Missing `Authorization` header | Add `Authorization: Bearer <token>` |
| Token expired | Re-login via `POST /api/v1/auth/login` |
| Wrong format | Must be `Bearer ` (with space) followed by the token |

### 400 Bad Request

| Cause | Fix |
|---|---|
| Duplicate admission number or employee number | Use a unique value |
| Duplicate exam schedule | Change title, date, class, section, or subject |
| Overpayment | `amountPaid` cannot exceed remaining fee balance |
| Marks overflow | `marksObtained` cannot exceed `exam.maxMarks` |
| Missing tenant context | Include `X-Tenant-ID` header |
| Attendance already marked | One record per student per day |

### 403 Forbidden

| Cause | Fix |
|---|---|
| Role too low | Check the endpoint's required role in Section 12 |
| Token for wrong role | Log in as the correct user role |

### Frontend Issues

| Symptom | Fix |
|---|---|
| CORS errors | Ensure backend is on port 8080; Vite proxy handles `/api` in dev |
| `X-Tenant-ID` missing errors | Re-login; tenant ID is captured at login and saved to `localStorage` |
| White screen after login | Check browser console for JS errors |

---

## 22. Roadmap

| Task | Priority | Description |
|---|---|---|
| Task 25 — Frontend Teacher Module | High | Teacher list + create, reusing student module patterns |
| Task 26 — Frontend Academic Module | High | Classes/subjects/sections tabs + create flows |
| Task 27 — Frontend UX Hardening | Medium | Toast notifications, pending states, client-side validation |
| Task 28 — Ownership-Aware Auth | High | STUDENT/PARENT object-level access checks |
| Task 29 — Consistent 401/403 Responses | Medium | `AuthenticationEntryPoint` + `AccessDeniedHandler` returning `ApiResponse` |
| Task 30 — Audit Logging | Medium | `@CreatedBy` / `@LastModifiedBy` via Spring Data JPA `AuditorAware` |
| Task 31 — Soft Delete | Medium | `deleted_at` column, filter `WHERE deleted_at IS NULL` |
| Task 32 — API Versioning | Low | Document `/api/v1/` convention, strategy for `/api/v2/` |
| Task 33 — Integration Tests | High | `@SpringBootTest` + Testcontainers for tenant provisioning + fees E2E |
| Task 34 — Student Self-Registration | High | One-time invite token -> password set -> account activation |

---

> Full architecture deep-dive: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
> Complete API field-level reference: [docs/API.md](docs/API.md)
> Project tracker and AI context: [docs/PROJECT_TRACKER.md](docs/PROJECT_TRACKER.md)
