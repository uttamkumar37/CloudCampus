# CloudCampus — Enterprise Execution Roadmap

**Purpose:** Divides the entire CloudCampus enterprise SaaS ERP vision into small, trackable, AI-friendly implementation tasks.

---

## Progress Summary (as of 2026-05-12 — session 5)

| Metric | Count |
|--------|-------|
| **Total tasks** | 193 |
| **Completed** | 31 (16.1%) |
| **In Progress** | 4 |
| **Not Started** | 158 |

### Session 5 Completions (2026-05-12) — Phase B1, B2, B3 Complete

| Task | What was built |
|------|---------------|
| CC-0213 ✅ | `School` entity + `V6__create_schools.sql`; `SchoolRepository`, `SchoolStatus` enum; auto-created by `TenantServiceImpl` on tenant onboarding (code = "MAIN") |
| CC-0203 ✅ | Hibernate `@Filter` + `@FilterDef` tenant isolation — `TenantFilter` constants, `TenantFilterAspect` (`@Before` AOP on all `JpaRepository` methods), `@Filter` on `School`, `User`, `AuditLog` entities; `@FilterDef` declared once on `User`; `@ParamDef` type changed to `UUID.class` for PostgreSQL compatibility |
| CC-0210 ✅ | Tenant isolation automated test suite — `TenantIsolationTest` (6 tests) with Testcontainers PostgreSQL 16 + Redis 7; Docker API 1.41 compatibility via `DockerApiVersionFixStrategy` + Surefire argLine; `findByIdFiltered()` JPQL query in `SchoolRepository` respects `@Filter`; `@Transactional` on test class ensures aspect fires inside active session; all 6 tests **pass** |

### Session 4 Completions (2026-05-12) — Phase A Complete

| Task | What was built |
|------|---------------|
| CC-0103 ✅ | `POST /v1/auth/login` — `AuthController`, `AuthService`, `LoginRequest`, `LoginResponse`; constant-time BCrypt to prevent user enumeration |
| CC-0104 ✅ | `POST /v1/auth/logout` — refresh token revocation via Redis delete |
| CC-0105 ✅ | Redis refresh token system + `POST /v1/auth/refresh` — opaque UUID tokens, 30-day TTL, rotation on every use |
| CC-1801 ✅ | Brute-force protection — `LoginRateLimiterService` (Redis sliding window), `TooManyRequestsException` (429), `RateLimitProperties` |
| CC-1802 ✅ | `AuditLogService` (`@Async("auditExecutor")`, `REQUIRES_NEW` tx) — `AuditLog` entity, `AuditAction` enum, `AuditLogRepository`; `AsyncConfig` thread pool; wired into `AuthServiceImpl` for LOGIN_SUCCESS, LOGIN_FAILED, LOGIN_BLOCKED, LOGOUT, TOKEN_REFRESHED |
| CC-0113 ✅ | Full RBAC enforcement in `SecurityConfig` — `/v1/super-admin/**` → SUPER_ADMIN, `/v1/admin/**` → TENANT_ADMIN+, `/v1/school-admin/**` → SCHOOL_ADMIN+, `anyRequest().authenticated()` |
| CC-0114 ✅ | `JsonAuthEntryPoint` — JSON `ApiResponse` 401/403 for unauthenticated/unauthorized requests (replaces Spring's HTML error pages) |

> Update these counts whenever task statuses change.

---

## Task Template (Standard Format)

```
CC-XXXX | Title | P0/P1/P2/P3 | STATUS
Depends on: CC-YYYY, CC-ZZZZ
Scope:
  - API endpoints:
  - UI screens:
  - DB entities/migrations:
Definition of Done:
  - Unit tests:
  - Integration tests:
  - Audit logs:
  - Metrics/alerts:
  - Tenant isolation verified:
Notes/Risks:
```

---

## Status Definitions

| Status | Meaning |
|--------|---------|
| `NOT_STARTED` | Task not started |
| `PLANNED` | Planned for execution |
| `IN_PROGRESS` | Currently developing |
| `BLOCKED` | Waiting for dependency |
| `TESTING` | Under QA/testing |
| `COMPLETED` | Production ready |
| `OPTIMIZATION_PENDING` | Optimization required |
| `SCALING_PENDING` | Scaling improvements pending |
| `FUTURE_SCOPE` | Future roadmap |

---

## Priority Definitions

| Priority | Meaning |
|----------|---------|
| **P0** | Critical foundation — blocks everything else |
| **P1** | High importance — ships in current milestone |
| **P2** | Medium importance — ships in next milestone |
| **P3** | Optional / future enhancement |

---

## Execution Phases

| Phase | Domain |
|-------|--------|
| 1 | Foundation Architecture |
| 2 | Authentication & Security |
| 3 | Multi-Tenant Engine |
| 4 | Super Admin System |
| 5 | School Admin System |
| 6 | Student Management |
| 7 | Staff & HRMS |
| 8 | Academic Management |
| 9 | Attendance System |
| 10 | Finance & Fees |
| 11 | Communication System |
| 12 | Examination System |
| 13 | Online Learning |
| 14 | Mobile App APIs |
| 15 | Reporting & Analytics |
| 16 | Infrastructure & DevOps |
| 17 | AI & Automation |
| 18 | Performance Optimization |
| 19 | Security Hardening |
| 20 | Enterprise Scale Preparation |
| 21 | Website Builder & Digital Experience Platform |

---

## Phase 1 — Foundation Architecture

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0001 | Setup backend project structure | P0 | ✅ COMPLETED | Spring Boot 3.4.5, Java 21 |
| CC-0002 | Setup frontend architecture | P0 | NOT_STARTED | — |
| CC-0003 | Setup modular package structure | P0 | ✅ COMPLETED | `common/`, `tenant/`, `auth/`, `config/` packages |
| CC-0004 | Setup environment management | P0 | ✅ COMPLETED | `application.yml` + `application-dev.yml` with profile separation |
| CC-0005 | Setup logging framework | P0 | ✅ COMPLETED | `logback-spring.xml` — JSON async prod, readable dev |
| CC-0006 | Setup exception handling system | P0 | ✅ COMPLETED | `RestExceptionHandler`, `ForbiddenException`, `ConflictException`, `TenantSuspendedException` |
| CC-0007 | Setup API response standardization | P0 | ✅ COMPLETED | `ApiResponse`, `ApiError`, `PageResponse` |
| CC-0008 | Setup DTO architecture | P0 | ✅ COMPLETED | Request/response DTO separation per module |
| CC-0009 | Setup validation framework | P0 | ✅ COMPLETED | `@Pattern`, `@Size`, `@NotBlank` on all DTOs |
| CC-0010 | Setup configuration management | P0 | ✅ COMPLETED | `JwtProperties` (`@ConfigurationProperties`), `SecurityConfig` |
| CC-0011 | Setup tenant-aware architecture | P0 | ✅ COMPLETED | `TenantContextFilter`, `HeaderTenantResolver`, `RequestContext` (userId slot added, VThread docs) |
| CC-0012 | Setup feature flag architecture | P0 | 🔄 IN_PROGRESS | V3 migration (`features` + `tenant_features` tables, 13 seed features) done; service layer + API pending |
| CC-0013 | API versioning + pagination standard | P0 | ✅ COMPLETED | `/v1/` URI versioning, `PageResponse<T>` with `page`/`size`/`totalElements`/`totalPages` |
| CC-0014 | Global error schema standardization | P0 | ✅ COMPLETED | `ApiError` with `correlationId`, `status`, `code`, `message`, `timestamp` |
| CC-0015 | Request correlation IDs + structured logs | P0 | ✅ COMPLETED | `CorrelationIdFilter` with sanitization (`^[a-zA-Z0-9\-]{1,64}$`), MDC propagation |
| CC-0016 | Health/readiness endpoints + probes | P0 | ✅ COMPLETED | `/actuator/health/liveness`, `/actuator/health/readiness` |
| CC-0017 | Observability baseline (metrics + tracing) | P0 | 🔄 IN_PROGRESS | Prometheus + Micrometer done; Grafana dashboards + OpenTelemetry tracing pending |
| CC-0018 | DB migrations strategy (Flyway/Liquibase) | P0 | ✅ COMPLETED | Flyway 10 with `flyway-database-postgresql`; V1–V5 migrations applied |
| CC-0019 | Seed data + template bootstrapping | P1 | NOT_STARTED | — |

---

## Phase 2 — Authentication & Security

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0101 | User entity creation | P0 | ✅ COMPLETED | `User.java`, `UserRole` (7 roles), `UserStatus`, `UserRepository`; V5 migration |
| CC-0102 | JWT authentication setup | P0 | ✅ COMPLETED | `JwtUtil` + `JwtProperties` + `JwtAuthenticationFilter` done; filter registered in `SecurityConfig`; `SecurityContext` + `RequestContext` fully populated on valid token |
| CC-0103 | Login API | P0 | ✅ COMPLETED | `AuthController` + `AuthServiceImpl`; constant-time BCrypt dummy hash prevents user enumeration; returns `LoginResponse` with access + refresh tokens |
| CC-0104 | Logout API | P0 | ✅ COMPLETED | `POST /v1/auth/logout` — Redis refresh token delete; no-op if already expired |
| CC-0105 | Refresh token system | P0 | ✅ COMPLETED | `POST /v1/auth/refresh` — opaque UUID tokens stored in Redis (`rt:{uuid}` → userId), 30-day TTL, rotated on every use |
| CC-0106 | Password encryption | P0 | ✅ COMPLETED | `BCryptPasswordEncoder(12)` bean in `SecurityConfig`; `SuperAdminBootstrap` uses it |
| CC-0107 | Forgot password flow | P1 | NOT_STARTED | Depends on CC-0103, CC-1002 (email) |
| CC-0108 | OTP verification | P1 | NOT_STARTED | Redis-backed OTP with TTL |
| CC-0109 | Session management | P1 | NOT_STARTED | Stateless JWT; Redis for active token tracking |
| CC-0110 | Device tracking | P1 | NOT_STARTED | Device fingerprint + session binding |
| CC-0111 | Multi-device login control | P2 | NOT_STARTED | — |
| CC-0112 | Login audit logs | P1 | ✅ COMPLETED | `AuditLogService` (`@Async("auditExecutor")`) + `AuditLog` entity + `AuditAction` enum + `AuditLogRepository`; `AsyncConfig` named thread pool; wired for LOGIN_SUCCESS, LOGIN_FAILED, LOGIN_BLOCKED, LOGOUT, TOKEN_REFRESHED |
| CC-0113 | Role-based authorization | P0 | ✅ COMPLETED | `SecurityConfig` matchers — `/v1/super-admin/**` (SUPER_ADMIN), `/v1/admin/**` (TENANT_ADMIN+), `/v1/school-admin/**` (SCHOOL_ADMIN+), `anyRequest().authenticated()` |
| CC-0114 | Permission middleware | P0 | ✅ COMPLETED | `JsonAuthEntryPoint` — JSON `ApiResponse` 401/403 for Spring Security rejections |
| CC-0115 | API security middleware | P0 | NOT_STARTED | Depends on CC-0102, CC-0114 |
| CC-0116 | Password policy + account lockout | P1 | 🔄 IN_PROGRESS | `LoginRateLimiterService` (Redis sliding window, 429) + `RateLimitProperties` done (A4); full account lockout (N-strikes suspend) + complexity rules pending |
| CC-0117 | Session revocation strategy | P1 | NOT_STARTED | Redis token blacklist or JTI revocation |
| CC-0118 | Security headers + CORS policy | P1 | ✅ COMPLETED | `SecurityHeadersFilter` (7 headers), `SecurityConfig` CORS with origin allowlist |

---

## Phase 3 — Multi-Tenant Engine

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0201 | Tenant entity design | P0 | ✅ COMPLETED | `Tenant.java` with `updatedAt`, immutable `code`, `@PrePersist`/`@PreUpdate` |
| CC-0202 | Tenant resolver middleware | P0 | ✅ COMPLETED | `HeaderTenantResolver`, `TenantContextFilter`, `RequestContext` |
| CC-0203 | Tenant-aware database filters | P0 | ✅ COMPLETED | `TenantFilter` constants + `TenantFilterAspect` (`@Before` AOP); `@Filter`+`@FilterDef(UUID)` on `User`, `School`, `AuditLog`; `@FilterDef` declared once on `User` (Hibernate 6 constraint) |
| CC-0204 | Tenant onboarding flow | P0 | 🔄 IN_PROGRESS | `SuperAdminTenantController` + `TenantServiceImpl` done; full onboarding wizard + validation pending |
| CC-0205 | Tenant suspension system | P1 | NOT_STARTED | `TenantSuspendedException` created; suspension API + enforcement pending |
| CC-0206 | Tenant branding engine | P1 | NOT_STARTED | — |
| CC-0207 | Tenant configuration engine | P0 | NOT_STARTED | — |
| CC-0208 | Tenant theme management | P2 | NOT_STARTED | — |
| CC-0209 | Tenant feature mapping | P0 | 🔄 IN_PROGRESS | `tenant_features` table (V3) + 13 seed features done; feature toggle API + service layer pending |
| CC-0210 | Tenant isolation automated test suite | P0 | ✅ COMPLETED | `TenantIsolationTest` — 6 Testcontainers tests (PostgreSQL 16 + Redis 7); all pass; `findByIdFiltered()` JPQL added to `SchoolRepository` |
| CC-0211 | Tenant-aware seed data (roles/menus) | P1 | NOT_STARTED | — |
| CC-0212 | Custom domain verification workflow | P2 | NOT_STARTED | DNS verification + SSL provisioning |
| CC-0213 | School/Campus entity design (multi-school ready) | P1 | ✅ COMPLETED | `School` entity + `V6__create_schools.sql`; `SchoolRepository`; auto-created by `TenantServiceImpl` on onboarding |
| CC-0214 | Cross-school access model (within tenant) | P1 | NOT_STARTED | Depends on CC-0213 |

---

## Phase 4 — Super Admin System

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0301 | Super admin dashboard | P0 | NOT_STARTED | — |
| CC-0302 | Tenant listing page | P0 | NOT_STARTED | — |
| CC-0303 | Tenant profile management | P0 | NOT_STARTED | — |
| CC-0304 | Tenant create wizard | P0 | NOT_STARTED | — |
| CC-0305 | Tenant feature access UI | P0 | NOT_STARTED | — |
| CC-0306 | Feature catalog engine | P0 | NOT_STARTED | — |
| CC-0307 | Feature dependency engine | P0 | NOT_STARTED | — |
| CC-0308 | Subscription management UI | P1 | NOT_STARTED | — |
| CC-0309 | Tenant analytics dashboard | P1 | NOT_STARTED | — |
| CC-0310 | Global monitoring dashboard | P2 | NOT_STARTED | — |
| CC-0311 | Tenant merge/migration admin tool | P2 | NOT_STARTED | — |
| CC-0312 | Usage metering + limit enforcement | P1 | NOT_STARTED | — |

---

## Phase 5 — School Admin System

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0401 | School dashboard | P0 | NOT_STARTED | — |
| CC-0402 | Academic year management | P0 | NOT_STARTED | — |
| CC-0403 | Class management | P0 | NOT_STARTED | — |
| CC-0404 | Section management | P0 | NOT_STARTED | — |
| CC-0405 | Subject management | P0 | NOT_STARTED | — |
| CC-0406 | Department management | P1 | NOT_STARTED | — |
| CC-0407 | School settings module | P1 | NOT_STARTED | — |
| CC-0408 | Dynamic menu rendering | P0 | NOT_STARTED | Feature-flag-driven menu visibility |

---

## Phase 6 — Student Management

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0501 | Student entity | P0 | NOT_STARTED | — |
| CC-0502 | Student admission form | P0 | NOT_STARTED | — |
| CC-0503 | Student profile page | P0 | NOT_STARTED | — |
| CC-0504 | Student listing filters | P0 | NOT_STARTED | — |
| CC-0505 | Student document upload | P1 | NOT_STARTED | — |
| CC-0506 | Parent mapping system | P1 | NOT_STARTED | — |
| CC-0507 | Student ID generation | P1 | NOT_STARTED | — |
| CC-0508 | Bulk student import | P1 | NOT_STARTED | — |

---

## Phase 7 — Staff & HRMS

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0601 | Staff entity | P0 | NOT_STARTED | — |
| CC-0602 | Teacher profile management | P0 | NOT_STARTED | — |
| CC-0603 | Staff attendance system | P1 | NOT_STARTED | — |
| CC-0604 | Leave management | P1 | NOT_STARTED | — |
| CC-0605 | Payroll engine | P2 | NOT_STARTED | — |

---

## Phase 8 — Academic Management

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0701 | Timetable management | P1 | NOT_STARTED | — |
| CC-0702 | Homework management | P1 | NOT_STARTED | — |
| CC-0703 | Assignment engine | P1 | NOT_STARTED | — |
| CC-0704 | Lesson planning | P2 | NOT_STARTED | — |

---

## Phase 9 — Attendance System

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0801 | Manual attendance | P0 | NOT_STARTED | — |
| CC-0802 | QR attendance | P1 | NOT_STARTED | — |
| CC-0803 | GPS attendance | P2 | NOT_STARTED | — |
| CC-0804 | Biometric integration | P2 | NOT_STARTED | — |
| CC-0805 | Attendance reports | P1 | NOT_STARTED | — |

---

## Phase 10 — Finance & Fees

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0901 | Fee structure engine | P0 | NOT_STARTED | — |
| CC-0902 | Fee collection module | P0 | NOT_STARTED | — |
| CC-0903 | Online payment integration | P1 | NOT_STARTED | — |
| CC-0904 | Invoice generation | P1 | NOT_STARTED | — |
| CC-0905 | Receipt generation | P1 | NOT_STARTED | — |

---

## Phase 11 — Communication System

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1001 | SMS integration | P1 | NOT_STARTED | — |
| CC-1002 | Email integration | P1 | NOT_STARTED | MailHog available in dev (docker-compose) |
| CC-1003 | Push notification system | P1 | NOT_STARTED | — |
| CC-1004 | WhatsApp integration | P2 | NOT_STARTED | — |

---

## Phase 12 — Examination System

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1101 | Exam creation | P1 | NOT_STARTED | — |
| CC-1102 | Marks entry system | P1 | NOT_STARTED | — |
| CC-1103 | Result generation | P1 | NOT_STARTED | — |
| CC-1104 | Report card generation | P1 | NOT_STARTED | — |

---

## Phase 13 — Online Learning

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1201 | Online classes | P2 | NOT_STARTED | — |
| CC-1202 | Video upload system | P2 | NOT_STARTED | MinIO available in dev |
| CC-1203 | Assignment submissions | P2 | NOT_STARTED | — |

---

## Phase 14 — Mobile App APIs

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1301 | Student app APIs | P1 | NOT_STARTED | — |
| CC-1302 | Parent app APIs | P1 | NOT_STARTED | — |
| CC-1303 | Teacher app APIs | P1 | NOT_STARTED | — |

---

## Phase 15 — Reporting & Analytics

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1401 | Attendance reports | P1 | NOT_STARTED | — |
| CC-1402 | Fee reports | P1 | NOT_STARTED | — |
| CC-1403 | Student performance reports | P1 | NOT_STARTED | — |
| CC-1404 | Cross-school comparison dashboards (within tenant) | P2 | NOT_STARTED | — |
| CC-1405 | Super Admin anonymized benchmarking (optional) | P3 | NOT_STARTED | — |

---

## Phase 16 — Infrastructure & DevOps

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1501 | Docker setup | P0 | ✅ COMPLETED | `docker-compose.yml` — PostgreSQL 16, Redis 7, MinIO, MailHog with health checks |
| CC-1502 | CI/CD pipeline | P1 | NOT_STARTED | — |
| CC-1503 | Redis integration | P1 | 🔄 IN_PROGRESS | Spring Data Redis dependency + `application.yml` config done; `RedisTemplate` usage pending |
| CC-1504 | Queue integration | P1 | NOT_STARTED | RabbitMQ planned |

---

## Phase 17 — AI & Automation

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1600 | AI gateway service (provider abstraction + routing) | P0 | NOT_STARTED | — |
| CC-1601 | Prompt & policy registry (versioning + rollout + rollback) | P0 | NOT_STARTED | — |
| CC-1602 | Embeddings + vector store integration | P0 | NOT_STARTED | — |
| CC-1603 | Tenant knowledge base (RAG ingestion + retrieval) | P1 | NOT_STARTED | — |
| CC-1604 | AI audit logs + tracing + usage analytics | P1 | NOT_STARTED | — |
| CC-1605 | AI usage metering + budgets + plan limits | P1 | NOT_STARTED | — |
| CC-1606 | AI evaluation dataset + regression checks per module | P1 | NOT_STARTED | — |
| CC-1607 | ERP in-app AI copilot (admin/teacher/parent/student) | P2 | NOT_STARTED | — |
| CC-1608 | AI analytics insights (attendance/fees/academics) | P2 | NOT_STARTED | — |
| CC-1609 | AI performance prediction | P3 | NOT_STARTED | — |

---

## Phase 18 — Performance Optimization

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1701 | Query optimization | P1 | NOT_STARTED | Slow query logging > 200ms already active |
| CC-1702 | API caching | P1 | NOT_STARTED | Redis configured; caching strategy pending |
| CC-1703 | Load testing | P1 | NOT_STARTED | — |
| CC-1704 | Stress testing | P1 | NOT_STARTED | — |
| CC-1705 | Caching strategy definition (what/where/TTL) | P1 | NOT_STARTED | — |

---

## Phase 19 — Security Hardening

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1801 | Rate limiting | P1 | NOT_STARTED | Per-tenant + per-user throttles |
| CC-1802 | Security audit logging | P1 | NOT_STARTED | `audit_log` table (V4) done; audit writer service pending |
| CC-1803 | Data encryption validation | P1 | NOT_STARTED | At-rest encryption for PII fields |
| CC-1804 | Tenant isolation verification | P0 | ✅ COMPLETED | `TenantIsolationTest` (6 tests, Testcontainers) — all pass |
| CC-1805 | Abuse prevention (throttles per tenant/user) | P1 | NOT_STARTED | — |
| CC-1806 | PII handling policy + retention | P1 | NOT_STARTED | GDPR/PDPA compliance |

---

## Phase 20 — Enterprise Scale Preparation

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1901 | Database partitioning | P1 | NOT_STARTED | Partition by `tenant_id` for large tables |
| CC-1902 | Read replica support | P1 | NOT_STARTED | — |
| CC-1903 | Horizontal scaling preparation | P2 | NOT_STARTED | — |
| CC-1904 | Backup automation | P1 | NOT_STARTED | — |
| CC-1905 | Backup/restore drill automation | P1 | NOT_STARTED | — |
| CC-1906 | Secrets management standard | P1 | NOT_STARTED | HashiCorp Vault or AWS Secrets Manager |

---

## Final Goal

> CloudCampus should become a **fully scalable enterprise-grade multi-tenant SaaS operating system** for educational institutions.

---

## Thin-Slice MVP Milestones

### M1 — Tenant Onboarding + Secure Access

- Tenant entity + resolver + tenant-aware DB filters (CC-0201, CC-0202, CC-0203)
- User + JWT + RBAC + permission middleware (CC-0101, CC-0102, CC-0113, CC-0114)
- Super Admin: create tenant + assign plan/features (CC-0304, CC-0305)

### M2 — School Admin Basics

- Academic year + class/section/subject (CC-0402–CC-0405)
- Student entity + admission + listing (CC-0501–CC-0504)
- Basic dashboard (CC-0401)

### M3 — Operational Core

- Manual attendance + attendance report (CC-0801, CC-0805)
- Fee structure + collection + receipt (CC-0901, CC-0902, CC-0905)
- SMS/email notification baseline (CC-1001, CC-1002)

### M4 — Enterprise Guardrails

- Audit logs + observability + backups (CC-1802, CC-1904)
- Rate limiting + tenant isolation test suite (CC-1801, CC-0210)

---

## Phase 21 — Website Builder & Digital Experience Platform

### Core Architecture

| Task ID | Title | Priority | Status |
|---------|-------|----------|--------|
| CC-2001 | Setup website builder architecture | P0 | NOT_STARTED |
| CC-2002 | Create dynamic page engine | P0 | NOT_STARTED |
| CC-2003 | Create dynamic section engine | P0 | NOT_STARTED |
| CC-2004 | Create navigation builder | P1 | NOT_STARTED |
| CC-2005 | Create theme engine | P1 | NOT_STARTED |
| CC-2006 | Create layout engine | P1 | NOT_STARTED |

### Content Modules

| Task ID | Title | Priority | Status |
|---------|-------|----------|--------|
| CC-2010 | Blog management system | P1 | NOT_STARTED |
| CC-2011 | Events calendar module | P1 | NOT_STARTED |
| CC-2012 | Photo gallery module | P1 | NOT_STARTED |
| CC-2013 | Teacher profile pages | P1 | NOT_STARTED |
| CC-2014 | Student achievement showcase | P2 | NOT_STARTED |
| CC-2015 | Dynamic homepage sections | P1 | NOT_STARTED |

### Marketing Modules

| Task ID | Title | Priority | Status |
|---------|-------|----------|--------|
| CC-2020 | SEO management engine | P1 | NOT_STARTED |
| CC-2021 | Meta tag management | P1 | NOT_STARTED |
| CC-2022 | Sitemap generation | P2 | NOT_STARTED |
| CC-2023 | Analytics integration | P1 | NOT_STARTED |
| CC-2024 | Inquiry form builder | P1 | NOT_STARTED |
| CC-2025 | Lead tracking system | P2 | NOT_STARTED |
| CC-2026 | CTA management engine | P2 | NOT_STARTED |

### Communication Modules

| Task ID | Title | Priority | Status |
|---------|-------|----------|--------|
| CC-2030 | WhatsApp website integration | P2 | NOT_STARTED |
| CC-2031 | Newsletter integration | P2 | NOT_STARTED |
| CC-2032 | Social media embeds | P2 | NOT_STARTED |
| CC-2033 | Contact form workflows | P2 | NOT_STARTED |

### AI Modules

| Task ID | Title | Priority | Status |
|---------|-------|----------|--------|
| CC-2040 | AI content generator | P3 | NOT_STARTED |
| CC-2041 | AI SEO assistant | P3 | NOT_STARTED |
| CC-2042 | AI page generator | P3 | NOT_STARTED |
| CC-2043 | AI admissions campaign generator | P3 | NOT_STARTED |

### Template Marketplace

| Task ID | Title | Priority | Status |
|---------|-------|----------|--------|
| CC-2050 | Template marketplace engine | P2 | NOT_STARTED |
| CC-2051 | Modern school template | P2 | NOT_STARTED |
| CC-2052 | International school template | P2 | NOT_STARTED |
| CC-2053 | College template | P2 | NOT_STARTED |
| CC-2054 | Coaching institute template | P2 | NOT_STARTED |

### Subscription & Feature Access

| Task ID | Title | Priority | Status |
|---------|-------|----------|--------|
| CC-2060 | Website feature subscription mapping | P1 | NOT_STARTED |
| CC-2061 | Website premium feature controls | P1 | NOT_STARTED |
| CC-2062 | Website plan upgrade flows | P2 | NOT_STARTED |
| CC-2063 | Dynamic website module visibility | P1 | NOT_STARTED |

### Performance & Infrastructure

| Task ID | Title | Priority | Status |
|---------|-------|----------|--------|
| CC-2070 | CDN integration | P1 | NOT_STARTED |
| CC-2071 | Image optimization pipeline | P1 | NOT_STARTED |
| CC-2072 | Static page optimization | P2 | NOT_STARTED |
| CC-2073 | Website cache optimization | P1 | NOT_STARTED |
| CC-2074 | Lazy loading implementation | P1 | NOT_STARTED |

### Analytics

| Task ID | Title | Priority | Status |
|---------|-------|----------|--------|
| CC-2080 | Visitor analytics | P2 | NOT_STARTED |
| CC-2081 | Conversion tracking | P2 | NOT_STARTED |
| CC-2082 | Lead analytics dashboard | P2 | NOT_STARTED |
| CC-2083 | SEO performance dashboard | P2 | NOT_STARTED |

---

---

## Next Session — Exact Implementation Order

Follow this order strictly. One task per session. Stop after each and confirm.

### 🔴 Phase A — Auth Enforcement (✅ COMPLETE)

| Session | Task ID | What to build | Status |
|---------|---------|--------------|--------|
| ✅ Done | CC-0102 | `JwtAuthenticationFilter` | ✅ DONE |
| ✅ Done | CC-0103 | `POST /v1/auth/login` — `AuthController`, `AuthService`, `AuthServiceImpl`, `LoginRequest` DTO, `LoginResponse` DTO | ✅ DONE |
| ✅ Done | CC-0105 | Redis refresh token system — `POST /v1/auth/refresh`, `POST /v1/auth/logout` | ✅ DONE |
| ✅ Done | CC-1801 | Brute-force protection — Redis sliding window rate limiter on login, `RateLimiterService` | ✅ DONE |
| ✅ Done | CC-1802 | `AuditLogService` — `@Async` writer, log auth events (login, logout, failed, token refresh) | ✅ DONE |
| ✅ Done | CC-0113/CC-0114 | RBAC enforcement in `SecurityConfig` — progressively lock down `/v1/super-admin/**` etc. | ✅ DONE |

### 🟠 Phase B — Foundation Completeness (After Phase A)

| Session | Task ID | What to build | Status |
|---------|---------|---------------|--------|
| B1 | CC-0213 | `School` entity + `V6__create_schools.sql` + auto-create on tenant onboarding | ✅ DONE |
| B2 | CC-0203 | Hibernate `@Filter` tenant isolation on all entities | ✅ DONE |
| B3 | CC-0210 | Tenant isolation automated test suite (Testcontainers) | ✅ DONE |
| B4 | CC-0012 | `FeatureFlagService` + `@RequiresFeature` AOP + Redis cache | 🔲 NEXT |
| B5 | EUP-013 | `V8__add_indexes.sql` — composite indexes for common query patterns | NOT_STARTED |
| B6 | EUP-012 | Soft delete — `deleted_at` column + `V9__soft_delete.sql` | NOT_STARTED |
| B7 | EUP-006 | OpenAPI/Swagger setup (springdoc) | NOT_STARTED |
| B8 | EUP-061 | Multi-stage `Dockerfile` (non-root user, layered JAR) | NOT_STARTED |
| B9 | CC-1502 | GitHub Actions CI pipeline (build + test + Docker push) | NOT_STARTED |
| B10 | CC-0107/CC-0108 | Forgot password / OTP reset flow | NOT_STARTED |

### 🟡 Phase C — Frontend (After Phase B)

| Session | Task ID | What to build |
|---------|---------|---------------|
| C1 | EUP-040 | React + TypeScript + Vite + TanStack Router scaffold |
| C2 | EUP-042 | Auth module: Login page, in-memory token store, Axios interceptor, refresh flow |
| C3 | EUP-043/044 | Route protection, role guard, feature flag hook |
| C4 | CC-0302/304 | Super Admin: Tenant list page + Tenant create form |
| C5 | CC-0401 | School Admin: Dashboard shell |

### 🔵 Phase D — Mobile (After Phase C)

| Session | Task ID | What to build |
|---------|---------|---------------|
| D1 | EUP-050 | React Native + Expo scaffold, navigation, shared auth store |
| D2 | EUP-052 | Secure token storage (Expo SecureStore), token refresh interceptor |
| D3 | EUP-051 | Offline-first attendance (WatermelonDB + sync queue) |
| D4 | CC-1003 | Push notifications (FCM/APNs via Expo Notifications) |

---

*End of Roadmap — updated 2026-05-12 session 5*
