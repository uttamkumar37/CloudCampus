# CloudCampus — Enterprise Master Architecture

**Version:** v4 (E28 Teacher/Student/Parent portals complete — API fully verified)
**Date:** 2026-05-13 (last updated: 2026-05-13 — full API audit + E28 complete)
**Status:** Living document — update on every architecture or stack decision

---

## Implementation Status (as of 2026-05-13 — E28 complete, all APIs verified)

### Platform & Infrastructure

| Layer | Component | Status |
|-------|-----------|--------|
| Runtime | Java 21 LTS | ✅ Active |
| Framework | Spring Boot 3.4.5 | ✅ Active |
| Security | Spring Security 6.x — **Full RBAC enforcement active** (CC-0113 complete) | ✅ Active |
| Auth | JJWT 0.12.6 — `JwtUtil` + `JwtAuthenticationFilter` + `FilterRegistrationBean` fix | ✅ Active |
| Password | `BCryptPasswordEncoder(12)` | ✅ Active |
| Logging | logstash-logback-encoder 8.0 | ✅ Active |
| Metrics | Micrometer + Prometheus | ✅ Active |
| Migrations | Flyway 10 (V1–V36) | ✅ Active |
| Cache | Spring Data Redis — fail-open for auth, rate-limit, tenant suspension cache | ✅ Active |
| Local dev infra | `application-local.yml` — local PG16 + Docker Redis | ✅ Active |
| Tenant resolution | JWT claim (`tenant_id`) → `RequestContext` → Hibernate `@Filter` | ✅ Active |
| Tenant suspension | `TenantSuspensionFilter` — Redis-cached 60s, fail-open on Redis down | ✅ Active |
| Security headers | `SecurityHeadersFilter` (7 OWASP headers) | ✅ Active |
| Rate limiting | `LoginRateLimiterService` — Redis sliding window, fail-open | ✅ Active |
| RBAC enforcement | `SecurityConfig` — path matchers + `@PreAuthorize` method-level | ✅ Active |

### Backend Domain Packages (`com.cloudcampus.*`)

| Package | Domain | Entities / Key Classes | Status |
|---------|--------|----------------------|--------|
| `tenant` | Tenant lifecycle | `Tenant`, `TenantService`, `SuperAdminTenantController` (suspend/activate) | ✅ Active |
| `auth` | Authentication | `AuthController`, `AuthServiceImpl`, `JwtAuthenticationFilter`, `LoginRateLimiterService` | ✅ Active |
| `audit` | Audit logging | `AuditLog`, `AuditLogService` (`@Async`), `AuditAction` enum | ✅ Active |
| `feature` | Feature flags | `FeatureFlag`, `TenantFeature`, `FeatureFlagService`, `@RequiresFeature` AOP | ✅ Active |
| `school` | School/Campus | `School`, `SchoolSettings`, `AcademicYear`, `ClassRoom`, `Section`, `Subject`, `Department` | ✅ Active |
| `student` | Student lifecycle | `Student`, `StudentParentLink`, `StudentController`, `ParentLinkController` | ✅ Active |
| `staff` | Staff & HR | `Staff`, `StaffService`, `StaffController` | ✅ Active |
| `attendance` | Attendance | `AttendanceSession`, `AttendanceRecord`, `AttendanceService`, `AttendanceController` | ✅ Active |
| `finance` | Fees & Payments | `FeeCategory`, `FeeStructure`, `StudentFeeRecord`, `FeePayment`, `FeeService`, `FeeController` | ✅ Active |
| `exam` | Examinations | `Exam`, `ExamSubject`, `StudentMark`, `ExamResult`, `ExamController`, `MarksController`, `ResultController` | ✅ Active |
| `timetable` | Timetable | `TimetableSlot`, `TimetableService`, `TimetableController`, `TeacherTimetableController` | ✅ Active |
| `homework` | Homework | `HomeworkAssignment`, `HomeworkSubmission`, `HomeworkController`, `StudentHomeworkController`, `TeacherHomeworkController` | ✅ Active |
| `assignment` | Assignments | `Assignment`, `AssignmentSubmission`, `AssignmentController` | ✅ Active |
| `notice` | Notice Board | `SchoolNotice`, `NoticeController` | ✅ Active |
| `mobile` | Parent Portal | `ParentController` — children, attendance, results | ✅ Active |
| `notification` | Notifications | `NotificationLog`, `NotificationService`, `WhatsAppMessageLog`, `WhatsAppService` | ✅ Active |
| `config` | App configuration | `JwtProperties`, `RateLimitProperties`, `OtpProperties`, `AsyncConfig`, `SecurityConfig` | ✅ Active |
| `common` | Shared utilities | `ApiResponse`, `ApiError`, `PageResponse`, `RequestContext`, `TenantSuspensionFilter` | ✅ Active |

### Frontend (`React 19 + TypeScript + Vite`)

| Feature | Pages / Routes | Status |
|---------|---------------|--------|
| `auth` | `/login` — Login, forgot/reset password, token store, Axios interceptor + refresh | ✅ Active |
| `super-admin` | `/super-admin/dashboard`, `/tenants`, `/tenants/new`, `/tenants/:id` | ✅ Active |
| `school-admin` | Dashboard, academic years, classes, sections, subjects, departments | ✅ Active |
| `student` | Student list, admit, bulk import CSV, profile (with parent links) | ✅ Active |
| `staff` | Staff list, create, profile | ✅ Active |
| `attendance` | Session list, create session, mark attendance | ✅ Active |
| `finance` | Fee structure list/create, fee collection, student fee detail + receipt | ✅ Active |
| `exam` | Exam list/create/detail, marks entry spreadsheet, results, report card | ✅ Active |
| `timetable` | Weekly grid (Mon–Sat × Period 1–8), add/delete slot, teacher conflict detection | ✅ Active |
| `homework` | Homework list (filters + overdue badge), create, status advance | ✅ Active |
| `assignment` | Assignment list, create, detail (inline grade modal, submissions table) | ✅ Active |
| `notice-board` | Notice board list and detail | ✅ Active |
| `teacher` | `/teacher/timetable` — Teacher self-service timetable view | ✅ Active |
| `notification` | Notification log (3 tabs), WhatsApp log + send | ✅ Active |
| `settings` | School settings page | ✅ Active |
| `reports` | Stub page | 🔴 Stub |
| `communication` | Stub page | 🔴 Stub |
| Student portal | Student homework list, submit (backend complete, no frontend page yet) | 🟡 Backend only |
| Parent portal | Parent children, attendance, results (backend complete, no frontend page yet) | 🟡 Backend only |

**Build:** `npm run build` → **287 modules, 0 errors** (as of 2026-05-13)
**Dev server:** `npm run dev` → `http://localhost:5174`
**Backend:** `SPRING_PROFILES_ACTIVE=local mvn spring-boot:run` → `http://localhost:8080`
**CORS:** Configured for `http://localhost:*` and `https://*.cloudcampus.io`

---

## Vision

Build CloudCampus as a world-class, enterprise-grade, AI-ready, multi-tenant SaaS education operating system capable of powering:

- 1,000+ schools
- 1,000,000+ students
- 100,000+ teachers and staff
- Millions of academic, financial, communication, and operational transactions
- Fully digital school operations
- Complete UI-driven management
- Zero code customization for tenant operations

### Core Product Philosophy

The platform must be: multi-tenant first · configuration driven · feature driven · scalable by design · event driven · API first · mobile ready · secure by default · UI controlled · future ready.

No tenant customization should require backend code changes, frontend code changes, manual deployments, SQL modifications, environment variable edits, or hardcoded configurations. **Everything must be manageable from the UI.**

---

## Layer 1 — Super Admin Platform Governance

### Purpose
Manage and govern the entire CloudCampus ecosystem.

### Super Admin Controls

- Tenant lifecycle
- Feature governance
- Subscription engine
- Tenant configurations
- Platform monitoring
- Global analytics
- Security policies
- Infrastructure monitoring
- AI feature rollout
- System health
- Marketplace / templates

### Super Admin Modules

#### 1. Global Overview Dashboard
Shows: total schools, active tenants, active users, daily logins, total students, total teachers, revenue metrics, API traffic, queue health, database performance, storage usage, error tracking, system uptime, active sessions, feature adoption, subscription analytics.

#### 2. Tenant Management System
Super Admin can: create, suspend, archive, delete tenants; activate/deactivate modules; configure school settings, branding, custom domains, limits, subscriptions, workflows, integrations; apply templates.

#### 3. Feature Catalog Engine

**Purpose:** Control all platform capabilities centrally.

| Feature Type | Behaviour |
|-------------|-----------|
| **CORE** | Always enabled. Cannot be disabled. |
| **OPTIONAL** | Tenant-configurable on/off. |
| **PREMIUM** | Subscription-gated. |
| **BETA** | Controlled rollout — canary by tenant. |

**Feature governance:** enable, disable, assign, create templates, rollout beta modules, manage dependencies, configure access rules.

**DB implementation:** V3 migration creates `features` and `tenant_features` tables with 13 seed features pre-loaded (STUDENT_MANAGEMENT, TEACHER_MANAGEMENT, ATTENDANCE_MANUAL, FEE_COLLECTION as CORE; COMMUNICATION_SMS/EMAIL/PUSH as OPTIONAL; ATTENDANCE_QR/GPS, ONLINE_EXAMS, WEBSITE_BUILDER, AI_COPILOT, ANALYTICS_ADVANCED as PREMIUM).

#### 4. Subscription Management
Manages: plans, billing cycles, feature bundles, usage limits, trial access, enterprise contracts, renewal workflows, add-on modules.

#### 5. Template Marketplace
Templates: CBSE School, International School, Coaching Institute, College, Small School Lite.
Auto-configures: features, menus, permissions, branding, workflows, reports.

#### 6. Infrastructure Monitoring
Monitors: queue systems, API health, database performance, cache performance, storage usage, error logs, failed jobs, security alerts, background workers.

#### 7. Global Analytics Engine
Analytics: tenant growth, revenue, feature usage, API usage, login analytics, device analytics, geographic analytics, storage analytics, subscription conversion.

#### 8. Enterprise Audit System

**Design: append-only — never UPDATE or DELETE rows.**

`audit_log` table fields: `id` (UUID PK), `tenant_id` (nullable — null for platform events), `actor_id`, `actor_username`, `category`, `event_type`, `resource_type`, `resource_id`, `description`, `metadata` (JSONB), `ip_address` (INET), `user_agent`, `created_at`.

| Category | Examples |
|----------|---------|
| `AUTH` | Login, logout, failed auth, token refresh |
| `TENANT` | Create, suspend, archive, config changes |
| `PERMISSION` | Role assignment, access grants/revokes |
| `FINANCE` | Fee collection, payment, refunds |
| `CONFIG` | Feature toggle, branding change |
| `SECURITY` | Rate limit hit, suspicious pattern |
| `DATA` | Bulk import, export, deletion |
| `SYSTEM` | Bootstrap, migration run |

---

## Layer 2 — Tenant / School Admin ERP

### Purpose
Each school gets a fully independent, UI-driven ERP management system.

### Important: Tenant vs School (Future-Proofing)

#### Tenant
The billing and isolation boundary for a customer account. A tenant can represent:

- **(A)** One school — most common for SMB pricing
- **(B)** A school group/organization containing multiple schools/campuses — enterprise

#### School / Campus (inside a Tenant)
A first-class functional unit inside a tenant (campus, branch, school unit).
Recommended as a first-class entity so that:
- One tenant can contain multiple schools
- Cross-school comparison is possible within the same tenant safely

#### Cross-School / Cross-Tenant Access
- **Same tenant:** Allowed for authorized roles via explicit access model.
- **Cross-tenant:** Super Admin only, or via a governance-controlled relationship model — always audited and revocable.

#### School Merge Approach (Preferred)
Prefer "group multiple schools under one tenant" over merging tenants. If tenant merge is required, it must be an admin-only data migration workflow with: dry-run preview, conflict resolution, full audit logging, background job execution + rollback checkpoints.

### School Admin Modules

1. Dashboard
2. Student Lifecycle Management
3. Teacher & Staff Management
4. Parent Management
5. Academic Management
6. Attendance Management (manual, QR, GPS, biometric, RFID, face recognition)
7. Examination System
8. Finance & Fee Management
9. Communication System (SMS, email, push, WhatsApp, circulars, chat, emergency alerts)
10. Online Learning System
11. Transport Management
12. Hostel Management
13. HRMS System
14. Inventory & Asset Management
15. Workflow Engine
16. Dynamic Form Builder
17. Role & Permission Engine
18. Branding Engine
19. Analytics & Reporting
20. Mobile App Ecosystem

---

## Technical Architecture

### Backend Stack (as-built)

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| **Runtime** | Java | 21 LTS | Upgraded from 17. Virtual Threads planned in CC-0011 (`ThreadLocal → ScopedValue`). |
| **Framework** | Spring Boot | 3.4.5 | Upgraded from 3.3.5. |
| **Security** | Spring Security | 6.x | Permit-all Phase 1. JWT enforcement in CC-0102. |
| **JWT** | JJWT | 0.12.6 | HS256. Access token 15 min, refresh 30 days. Secret via `JWT_SECRET` env var. |
| **Password hashing** | BCrypt | — | `BCryptPasswordEncoder(12)` — ≈300ms/hash. |
| **ORM** | Spring Data JPA / Hibernate | included | Batch size 50, UTC timezone, slow query logging >200ms. |
| **Migrations** | Flyway | 10 | `flyway-database-postgresql` explicit dep required for Flyway 10 + PG. |
| **Logging** | logstash-logback-encoder | 8.0 | JSON async in prod, readable in dev. Profiles via `logback-spring.xml`. |
| **Metrics** | Micrometer + Prometheus | included | `/actuator/prometheus` endpoint. |
| **Build** | Maven | 3.x | Layered JAR for Docker layer caching. H2 excluded from prod fat JAR. |

### Multi-Tenancy Architecture

#### Decision: Option A — Single DB + Shared Schema (Implemented)

Every tenant-owned table contains a `tenant_id` column. Tenant isolation enforced at:
1. **Request layer:** `TenantContextFilter` resolves tenant from `X-Tenant-Id` header → populates `RequestContext.tenantId` (ThreadLocal).
2. **Service/repository layer:** All queries filter by `tenant_id` from `RequestContext` (CC-0203).
3. **Authorization layer:** Permission evaluation checks tenant membership before any resource access.
4. **Test layer:** Automated cross-tenant read/write test suite (CC-0210) — cross-tenant access must be blocked deterministically.

**Tenant-aware indexing:** All high-cardinality queries use composite indexes starting with `tenant_id`.

#### Tenant Resolution Precedence

```
JWT claim (tenant_id) > custom domain > subdomain > X-Tenant-Id header
```

*Current:* `X-Tenant-Id` header only (Phase 1).
*CC-0102:* JWT claim takes precedence once auth enforcement is live.

#### Option B — Schema per Tenant
Requires schema orchestration for migrations, backups, and cross-tenant reporting. Available as a mid-tier option.

#### Option C — Database per Tenant
Strongest isolation. Automated provisioning, upgrades, monitoring. Available as the **Enterprise / Dedicated** tier when a tenant pays for dedicated isolation, custom backup SLA, or special compliance requirements.

### Database Strategy

**Primary:** PostgreSQL 16 (staging and production).
**Dev:** H2 in-memory with `MODE=PostgreSQL` (limited PostgreSQL semantics — plan to replace with Testcontainers in CC-0210).

**DB Configuration:**
```yaml
jpa:
  properties:
    hibernate:
      jdbc:
        batch_size: 50
      order_inserts: true
      order_updates: true
      session.events.log.LOG_QUERIES_SLOWER_THAN_MS: 200
```

**HikariCP (dev):** pool size 10, min-idle 2, connection-timeout 3s.

#### Database Migrations (V1–V36)

| Migration | File | Change |
|-----------|------|--------|
| V1 | `V1__init.sql` | Initial schema — `tenants` table |
| V2 | `V2__add_tenant_updated_at.sql` | Add `updated_at` column, backfill from `created_at`, NOT NULL |
| V3 | `V3__create_features_tables.sql` | `features` + `tenant_features` tables, 13 seed features |
| V4 | `V4__create_audit_log.sql` | Append-only `audit_log` table, 8 event categories, 4 indexes |
| V5 | `V5__create_users_table.sql` | `users` table — UUID PK, `tenant_id` nullable for SUPER_ADMIN |
| V6 | `V6__create_schools.sql` | `schools` table — first-class campus/school entity inside tenant |
| V7 | `V7__fix_audit_log_ip_address.sql` | Fix `ip_address` type to `VARCHAR` |
| V8 | `V8__add_indexes.sql` | Composite indexes on all high-cardinality tenant-scoped queries |
| V9 | `V9__soft_delete.sql` | `deleted_at` column on soft-deletable entities |
| V10 | `V10__create_device_tokens.sql` | `device_tokens` for push notification registration |
| V11 | `V11__create_academic_years.sql` | `academic_years` — per-school year management |
| V12 | `V12__create_classes.sql` | `classes` — grade/class definitions per school |
| V13 | `V13__create_sections.sql` | `sections` — sections inside a class |
| V14 | `V14__create_subjects.sql` | `subjects` — subject catalog per school |
| V15 | `V15__create_departments.sql` | `departments` — staff department structure |
| V16 | `V16__create_school_settings.sql` | `school_settings` — per-school configuration JSONB store |
| V17 | `V17__create_students.sql` | `students` — student lifecycle, admission, profile |
| V18 | `V18__create_student_parent_links.sql` | `student_parent_links` — parent-to-student mapping |
| V19 | `V19__create_staff.sql` | `staff` — staff profiles, roles, departments |
| V20 | `V20__create_attendance_sessions.sql` | `attendance_sessions` — per-class session tracking |
| V21 | `V21__create_attendance_records.sql` | `attendance_records` — per-student attendance per session |
| V22 | `V22__create_fee_categories.sql` | `fee_categories` — fee head definitions per school |
| V23 | `V23__create_fee_structures.sql` | `fee_structures` — amount/frequency per category/class/year |
| V24 | `V24__create_fee_payments.sql` | `student_fee_records` (invoices) + `fee_payments` (transactions) |
| V25 | `V25__create_notification_logs.sql` | `notification_logs` — SMS/email/push delivery log |
| V26 | `V26__create_whatsapp_message_logs.sql` | `whatsapp_message_logs` — WhatsApp dispatch records |
| V27 | `V27__create_exams.sql` | `exams` table — status lifecycle DRAFT→SCHEDULED→ONGOING→COMPLETED |
| V28 | `V28__create_exam_subjects.sql` | `exam_subjects` — per-class/subject paper entries |
| V29 | `V29__create_student_marks.sql` | `student_marks` — per-student per-paper marks with absent flag |
| V30 | `V30__create_exam_results.sql` | `exam_results` — aggregated result with grade, rank, pass/fail |
| V31 | `V31__create_timetable.sql` | `timetable_slots` — weekly schedule, UNIQUE per section+day+period |
| V32 | `V32__create_homework.sql` | `homework_assignments` — DRAFT/PUBLISHED/CLOSED lifecycle |
| V33 | `V33__create_assignments.sql` | `assignments` + `assignment_submissions` — graded workflow |
| V34 | `V34__create_school_notices.sql` | `school_notices` — notice board entries |
| V35 | `V35__create_homework_submissions.sql` | `homework_submissions` — student submit → teacher review |
| V36 | `V36__fix_notice_priority_type.sql` | Fix `priority` column SMALLINT → INTEGER for Hibernate |

### Cache Layer

**Technology:** Spring Data Redis 7. Configured with lazy-connect — app starts even if Redis is temporarily unavailable; caches miss-through to DB until reconnected.

```yaml
spring.data.redis:
  connect-timeout: 2s
  timeout: 1s
  repositories.enabled: false   # Use RedisTemplate directly
```

**Cache uses:**

| Cache | Key pattern | TTL | Status |
|-------|------------|-----|--------|
| Feature flags | `cc:features:{tenant_id}` | 5 min | Pending CC-0012 |
| Permissions | `cc:perms:{user_id}` | 5 min | Pending CC-0114 |
| Sessions | `cc:session:{token_id}` | 15 min | Pending CC-0109 |
| Refresh tokens | `cc:refresh:{jti}` | 30 days | Pending CC-0105 |
| OTP | `cc:otp:{user_id}` | 5 min | Pending CC-0108 |
| Dashboard | `cc:dash:{tenant_id}:{school_id}` | 2 min | Pending CC-0401 |

### Queue Architecture

**Technology (planned):** RabbitMQ (primary async bus) + Redis Queue (lightweight background jobs).

**Async operations:**
- Notifications (SMS / email / push / WhatsApp)
- Report generation jobs
- Attendance bulk processing
- Bulk imports (students, teachers)
- Audit log writes (high volume)
- Email delivery jobs

**Standards:**
- At-least-once delivery — all handlers must be idempotent
- Exponential backoff with jitter — max 5 retries
- Dead-letter queue for all critical job types — alert on DLQ depth
- **Outbox pattern** recommended for DB + event bus consistency

### File Storage

| Environment | Technology | Access |
|-------------|-----------|--------|
| Local dev | MinIO (docker-compose) | `localhost:9000`, console `localhost:9001` |
| Staging / Production | AWS S3 or S3-compatible | Signed URLs with TTL |

**Storage path convention:** `/{tenant_id}/{school_id}/{module}/{filename}`
**CDN:** Required for production — fronts object storage for all public assets.
**Allowed upload size:** 10MB per file, 10MB per request (enforced at servlet layer + Tomcat layer).

### Security Architecture

#### Implemented Controls

| Control | Class / File | Detail |
|---------|-------------|--------|
| Security headers | `SecurityHeadersFilter` | 7 OWASP headers on every response |
| CORS | `SecurityConfig.corsConfigurationSource()` | Origin allowlist, preflight cache 1h |
| Session | `SecurityConfig` | `STATELESS` — no `HttpSession`, no CSRF token |
| JWT infrastructure | `JwtUtil`, `JwtProperties` | JJWT 0.12.6, HS256, access 15min, refresh 30 days |
| Password hashing | `SecurityConfig.passwordEncoder()` | BCrypt cost 12 |
| Correlation ID sanitization | `CorrelationIdFilter` | Regex `^[a-zA-Z0-9\-]{1,64}$` — prevents log injection |
| Tenant code validation | `TenantCreateRequest` | `@Pattern(regexp="^[a-z0-9][a-z0-9\\-]{1,62}[a-z0-9]$")` |
| TOCTOU race protection | `TenantServiceImpl` | Pre-check + `DataIntegrityViolationException` catch → 409 |
| Exception logging | `RestExceptionHandler` | SLF4J + MDC `correlationId` on all unhandled exceptions |

#### Security Headers (applied to every HTTP response)

```
X-Content-Type-Options:     nosniff
X-Frame-Options:            DENY
X-XSS-Protection:           1; mode=block
Referrer-Policy:            strict-origin-when-cross-origin
Permissions-Policy:         camera=(), microphone=(), geolocation=(), payment=()
Strict-Transport-Security:  max-age=31536000; includeSubDomains
Cache-Control:              no-store, no-cache, must-revalidate
```

#### Planned Security Controls (CC-0102+)

- `JwtAuthenticationFilter` — populates `SecurityContext` from `Authorization: Bearer` header
- Login API `/v1/auth/login` — credential validation + token pair issuance
- Refresh token rotation — single-use, Redis-backed, rotating
- Progressive `SecurityConfig` hardening: `/v1/super-admin/**` → `SUPER_ADMIN`; `/v1/admin/**` → `TENANT_ADMIN + SUPER_ADMIN`
- Rate limiting (CC-1801) — per-tenant + per-user throttles
- Device tracking (CC-0110) — device fingerprint + session binding
- Account lockout after N failed attempts (CC-0116)
- MFA for Super Admin (CC-0116)
- Password policy enforcement (CC-0116)

### Platform Contracts

#### API Contract

| Standard | Implementation |
|----------|---------------|
| **Versioning** | URI-based: `/v1/`, `/v2/`. Deprecation via `Sunset` response header. |
| **Pagination** | Offset-based. `PageResponse<T>` envelope: `page`, `size`, `totalElements`, `totalPages`, `content[]`. |
| **Error response** | `ApiError`: `correlationId`, `status`, `code`, `message`, `timestamp`. |
| **Idempotency** | `Idempotency-Key` header required for payments, bulk imports, notification dispatch. |

#### Authorization Contract

- RBAC model with dynamic permission engine (CC-0113, CC-0114)
- Permission evaluation at service layer (source of truth) + API layer (fast fail)
- Permission cache in Redis; invalidated on role/permission change
- **Feature / subscription gating** enforcement points:
  1. UI visibility (menu rendering driven by feature flags)
  2. API authorization layer (fast fail before business logic)
  3. Service layer business rules (authoritative source)

#### Audit Logging Contract

- **What to log:** auth events, permission changes, all financial operations, all configuration changes, bulk data operations, security events
- **Tenant-scoped access:** tenants can access only their own audit logs
- **Retention:** platform-level = indefinite; tenant-level = configurable per plan (minimum 90 days)
- **Schema:** append-only `audit_log` table (V4 migration) — no UPDATE, no DELETE

---

## Observability & Reliability Baseline

### Mandatory from Day 1

| Signal | Technology | Status |
|--------|-----------|--------|
| Structured logs | logstash-logback-encoder 8.0 | ✅ Active |
| Correlation IDs | MDC `correlationId` in all log lines | ✅ Active |
| API metrics | Micrometer (latency, error rate) | ✅ Active |
| Prometheus scrape | `/actuator/prometheus` | ✅ Active |
| Slow query logging | Hibernate > 200ms | ✅ Active |
| Health probes | `/actuator/health/liveness`, `/actuator/health/readiness` | ✅ Active |
| Tracing | OpenTelemetry (login, onboarding, payment, notifications) | Planned |

### Logging Configuration

**Dev profile:** `ConsoleAppender` with color pattern, `DEBUG` for `com.cloudcampus`, SQL logging available.

**Non-dev profiles (staging, prod):** `LogstashEncoder` JSON output, `AsyncAppender` (queue size=1024, never block), MDC fields (`correlationId`, `tenantId`, `userId`), stack trace depth 10 frames.

### Disaster Recovery

| Target | Definition |
|--------|-----------|
| **RPO** | Recovery Point Objective — maximum data loss acceptable (define per plan tier) |
| **RTO** | Recovery Time Objective — maximum downtime acceptable (define per plan tier) |
| **Backup automation** | CC-1904 — automated daily backups with verification |
| **Restore drills** | CC-1905 — automated restore drill pipeline |

---

## Background Jobs & Messaging

### Delivery Semantics
- At-least-once (default) — all job handlers must be idempotent
- Exactly-once: use Outbox pattern + deduplication keys for financial operations

### Retry Policy
- Exponential backoff with jitter
- Maximum 5 retries per job
- Dead-letter queue with alerting on depth > threshold

### Idempotency Requirements
Every job handler must: accept a `jobId`, check for prior completion before processing, update completion state atomically.

### Event Publishing Consistency
**Outbox pattern (recommended):** Write event to `outbox` table in same transaction as domain change → separate relay process publishes to message bus → guarantee: event is published if and only if the transaction committed.

---

## File / Media Pipeline

| Concern | Standard |
|---------|---------|
| Allowed types | Defined per module (e.g. images: jpg/png/webp; docs: pdf/docx) |
| Max size | 10MB per file, 10MB per request |
| Storage paths | `/{tenant_id}/{school_id}/{module}/{yyyy-mm}/{filename}` |
| URL access | Signed URLs with TTL (never expose raw S3 URLs) |
| Retention | Documents: 7 years; media: configurable per plan |
| Virus scanning | Required for enterprise compliance tier |

---

## AI Technology Layer

### AI Goal
Deliver safe, configurable, tenant-scoped AI across all user portals and the Website Builder.

### AI Requirements
- Feature-flagged and subscription-controlled per tenant
- Fully configuration-driven — no tenant-specific code forks
- Tenant-scoped for data, prompts, and knowledge bases
- Audited: who asked what, which sources, which actions
- Cost-controlled: per-tenant budgets, rate limits, usage metering

### AI Platform Building Blocks

#### 1. AI Gateway Service (CC-1600)
- One internal service for all AI calls (chat, embeddings, reranking, multimodal)
- Provider-agnostic routing — supports multiple LLM providers behind one interface
- Per-tenant routing policies (latency/cost tiers, allowed models)
- Per-tenant usage tracking (tokens, requests, latency)

#### 2. Prompt & Policy Registry (CC-1601)
- Prompts stored as versioned configuration: draft → publish → rollback
- Role-aware instructions per portal (Super Admin / School Admin / Teacher / Parent / Student)
- Structured outputs for automation flows (JSON schemas for actions and data extraction)
- Rollout controls: beta/canary by tenant with feature flags

#### 3. Tenant Knowledge Base — RAG (CC-1602, CC-1603)
- Default approach: Retrieval-Augmented Generation (RAG) for tenant documents and platform knowledge
- Pipeline: source connect → parse → chunk → embed → index
- Metadata on every chunk: `tenant_id`, `school_id`, `module`, `audience`, `permissions`, `source_type`, `updated_at`
- Retrieval always filtered by `tenant_id` (and `school_id` where applicable)
- Permission-aware retrieval — role-based visibility at chunk level
- Citations to source documents wherever possible

#### 4. AI Tools / Actions (CC-1607)
- AI can call internal APIs through a controlled tool layer
- Example actions: create leads, draft notifications, generate reports, summarize logs, assist admins
- All actions: RBAC-checked + audit-logged + optionally approval-gated (workflow engine integration)

#### 5. AI Quality + Continuous Improvement (CC-1606)
- Evaluation dataset per module (questions + expected behaviour)
- Quality signals: user feedback (thumbs up/down), citation coverage, response latency, cost per request
- Prompt and retrieval configuration changes tested before wide rollout

#### 6. AI Cost & Safety Controls (CC-1605)
- Meter usage per tenant: tokens, tool calls, embedding storage
- Enforce plan-based limits: daily/monthly budgets, rate limits, concurrency
- Super Admin visibility: top tenants by usage, cost, adoption; ability to pause AI per tenant

### AI Implementation Sequence

1. Build AI gateway service + tenant-scoped routing (CC-1600)
2. Add prompt/policy registry with versioning + rollout control (CC-1601)
3. Implement tenant knowledge base — RAG with permission-aware retrieval (CC-1602, CC-1603)
4. Release internal copilots first — Super Admin + School Admin (CC-1607)
5. Expand to Teacher/Parent/Student assistants + Website AI modules
6. Add AI analytics insights + automation workflows, approval-gated (CC-1608)

---

## Performance Goals

| Metric | Target |
|--------|--------|
| Students | 1M+ |
| Concurrent users | 100K+ |
| API response p95 | < 200ms read, < 500ms write |
| Dashboard load p95 | < 1s cached, < 3s cold |
| Queue throughput | Stable at 10K notifications/min |
| Bulk import | 10K student records in < 60s |

**Scaling roadmap:**

| Users | Actions |
|-------|---------|
| 1K–10K | HikariCP tuning, Redis for hot read paths |
| 10K–100K | Read replicas, async report generation, dedicated queue workers |
| 100K–500K | Extract notification-service + ai-service as microservices |
| 500K–1M+ | Extract report-service + attendance-service; DB partitioning by `tenant_id` |

---

## Local Development Infrastructure

```bash
# Start all services
docker compose up -d
```

| Service | Image | Ports | Purpose |
|---------|-------|-------|---------|
| PostgreSQL 16 | `postgres:16-alpine` | 5432 | Primary database |
| Redis 7 | `redis:7-alpine` | 6379 | Cache + refresh token store |
| MinIO | `minio/minio:latest` | 9000 (API), 9001 (console) | S3-compatible file storage |
| MailHog | `mailhog/mailhog:latest` | 1025 (SMTP), 8025 (web UI) | Email catcher — inspect outbound emails |

```bash
# Run backend
export JAVA_HOME=/Users/uttamkumar/Library/Java/JavaVirtualMachines/temurin-21.0.9/Contents/Home
export JWT_SECRET="your-strong-secret-minimum-32-chars!!"
export BOOTSTRAP_ADMIN_PASSWORD="InitialPassword123!"
cd backend && mvn spring-boot:run
```

---

## Ultimate Product Goal

> **CloudCampus should become: "The Complete Digital Operating System for Educational Institutions"**

Where:
- Super Admin controls the SaaS ecosystem
- School Admin controls institution operations
- Teachers manage academics digitally
- Parents stay connected in real time
- Students operate digitally
- Everything works from the UI
- Everything scales centrally
- Everything remains configurable

Without rewriting the platform architecture in the future.

---

## Website Builder & Digital Experience Platform

### Vision
A complete School Digital Experience Platform inside CloudCampus. Each school manages their public website, admissions pages, marketing pages, blogs, events, SEO, branding, and AI-generated content — completely from the UI, without developers.

### Feature Tiers

| Tier | Features |
|------|---------|
| **FREE** | General information, contact page, basic gallery |
| **GROWTH** | Blog, events calendar, SEO tools, analytics, social proof |
| **PRO** | Teacher profiles, booking systems, admissions tools, communication widgets |
| **ELITE** | AI website builder, AI SEO, multi-language, branding engine, store/eCommerce, AI chatbot, marketing automation |

### Super Admin Website Governance
Controls: website templates, subscription mapping, premium widgets, global themes, AI feature rollout, marketplace sections, website feature access.

### School Admin Website Control
Manages from UI: home page, about, admissions pages, blogs, events, galleries, teacher profiles, branding, SEO, inquiry forms, marketing integrations, social embeds, custom sections.

### Website Builder Modules

#### Core
Dynamic page engine · dynamic section engine · navigation builder · theme engine · layout engine.

#### Content
Blog system · events calendar · gallery engine · teacher showcase · student achievements.

#### Marketing
SEO management · meta tags · analytics integration · inquiry forms · lead tracking · CTA engine.

#### AI
AI content writer · AI design generator · AI SEO optimizer · AI admissions campaigns.

#### Infrastructure
CDN support · image optimization · cache layer · static optimization · lazy loading.

### Architecture Decision (CC-2001 — pending)

| Option | Description | Recommendation |
|--------|-------------|---------------|
| **A** | Dynamic render (DB-driven) + aggressive caching | Simpler ops, real-time content |
| **B** | Static export to object storage + CDN | Max SEO, max performance |
| **C** | **Hybrid** — static public pages + dynamic widgets/forms | **Recommended** |

**Required before CC-2001:**
- Custom domain mapping flow (verification + SSL strategy + tenant binding)
- Cache invalidation strategy when pages change
- SEO essentials: sitemap, meta tags, structured data

### Website Template Marketplace
Templates: Modern School · Traditional School · International School · College · Coaching Institute.
Auto-configure: sections, colors, menus, branding, pages, layouts, animations.

### Website Analytics
Tracks: visitors, leads, conversion rates, device usage, campaign performance, SEO performance, engagement metrics.

### Enterprise Positioning

> CloudCampus Website Builder should become: **"A standalone SaaS-grade website and marketing platform integrated with ERP."**

This becomes: revenue engine · marketing engine · school acquisition tool.

---

*End of Architecture Document — v2*
