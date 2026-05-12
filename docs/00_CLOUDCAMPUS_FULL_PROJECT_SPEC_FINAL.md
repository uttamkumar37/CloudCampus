# CloudCampus — Full Product Specification

**Version:** v3 (E11 Finance complete — ongoing implementation)
**Date:** 2026-05-12 (last updated: 2026-05-12 — E11 complete)
**Status:** Living document — update on every architecture decision

---

## Purpose

Single, implementation-ready specification for CloudCampus as an enterprise multi-tenant SaaS education operating system, covering:

- Product scope and modules
- Tenancy and governance model
- Technical architecture standards (as-built)
- AI platform approach
- Execution roadmap structure and milestones

---

## 1. Vision & Product Principles

### Vision

Build CloudCampus as a world-class, enterprise-grade, AI-ready, multi-tenant SaaS education operating system capable of powering:

- 1,000+ schools
- 1,000,000+ students
- 100,000+ teachers and staff
- High-volume academic, finance, communication, and operational transactions
- Fully digital school operations
- Complete UI-driven management
- Zero code customization for tenant operations

### Product Principles

The platform must be:

| Principle | Meaning |
|-----------|---------|
| **Multi-tenant first** | Every entity, query, and permission is tenant-scoped |
| **Configuration driven** | Behaviour changes via config, not code |
| **Feature driven** | Every capability is a feature flag — on/off per tenant |
| **Scalable by design** | Architecture decisions made for 1M users, not just 1K |
| **Event driven** | Async patterns for notifications, reports, bulk ops |
| **API first** | Every feature has a versioned REST API before any UI |
| **Mobile ready** | All APIs work for native iOS/Android clients |
| **Secure by default** | Security headers, JWT, RBAC, audit logs from day one |
| **UI controlled** | Super Admin and Tenant Admin manage everything from UI |
| **Future ready** | Modular monolith → microservices extraction path is clear |

### Zero-Code Customization Guarantee

No tenant customization should ever require:
- Backend code changes
- Frontend code changes
- Manual deployments
- SQL modifications
- Environment variable edits
- Hardcoded configurations

Everything must be manageable from the UI.

---

## 2. Actors & Boundaries

### Actors

| Actor | Description |
|-------|-------------|
| **Super Admin** | Platform operator — manages the entire CloudCampus ecosystem |
| **Tenant Owner / School Group Owner** | Customer account owner — billing boundary |
| **School Admin** | Manages day-to-day operations of one school/campus |
| **Teacher / Staff** | Operational users within a school |
| **Parent** | External stakeholder — read/receive access |
| **Student** | End learner — limited interactive access |

### Boundaries

- **Tenant boundary** = billing + governance + data isolation boundary
- **School/Campus boundary** = operational unit inside a tenant
- A tenant can contain **one or many schools** (SMB vs Enterprise)

---

## 3. Tenancy Model

### Key Definitions

#### Tenant
The billing and isolation boundary for a customer account. A tenant can represent:

- **(A) One school** — most common for SMB pricing
- **(B) A school group / organization** containing multiple schools or campuses (enterprise)

#### School / Campus (inside a Tenant)
A first-class functional unit inside a tenant (branch, campus, school unit).

Modelled as a first-class entity so that:
- One tenant can contain multiple schools
- Cross-school comparison is possible within the same tenant safely
- School merges happen inside the tenant via controlled workflows

#### Cross-School Access
- **Within the same tenant:** Allowed for authorized roles via explicit access model.
- **Across tenants:** Super Admin only, or via a governance-controlled relationship model — always audited and revocable.

### Tenancy Strategy: **Option A — Implemented**

> **Decision made:** Single DB + shared schema + `tenant_id` on all tenant-scoped tables.

This is the default strategy for CloudCampus. It keeps onboarding and operations cost-effective at 1,000+ tenants.

| Strategy | Status | Use case |
|----------|--------|---------|
| **Option A** — Single DB + shared schema | ✅ **Implemented** | Default for all tenants |
| **Option B** — Schema per tenant | Future option | Stronger isolation without per-tenant infra |
| **Option C** — DB per tenant | Enterprise tier | Dedicated isolation, custom backup SLA, compliance |

**Tenant isolation enforcement points (Option A):**
1. Tenant resolution at request time (`X-Tenant-Id` header → JWT claim in CC-0102)
2. `TenantContextFilter` sets `RequestContext.tenantId` for every request
3. Service/repository layer applies `tenant_id` filters (CC-0203)
4. Automated cross-tenant read/write test suite (CC-0210)

---

## 4. Layer 1 — Super Admin (Platform Governance)

### Purpose
Manage and govern the entire CloudCampus ecosystem from a single interface.

### Super Admin Controls

- Tenant lifecycle (create / suspend / archive / delete)
- Feature governance (enable / disable / rollout per tenant)
- Subscription engine (plans, limits, trials, add-ons)
- Tenant configurations (branding, domains, limits, integrations)
- Platform monitoring (API health, queues, DB, cache, storage)
- Global analytics (tenant growth, revenue, adoption)
- Security policies (rate limits, session policies, MFA requirements)
- Infrastructure monitoring (error logs, worker health, alerts)
- AI feature rollout (model policies per tenant, budget limits)
- System health (readiness probes, uptime tracking)
- Marketplace / templates (CBSE, International, College, etc.)

### Super Admin Modules

#### 1. Global Overview Dashboard
Displays: total schools, active tenants, active users, daily logins, total students, total teachers, revenue metrics, API traffic, queue health, database performance, storage usage, error tracking, system uptime, active sessions, feature adoption, subscription analytics.

#### 2. Tenant Management System
Super Admin can: create, suspend, archive, delete tenants; activate/deactivate modules; configure school settings, branding, custom domains, limits, subscriptions, workflows, integrations; apply templates.

#### 3. Feature Catalog Engine
Controls all platform capabilities centrally.

| Feature Type | Description |
|-------------|-------------|
| **CORE** | Always enabled. Cannot be disabled. |
| **OPTIONAL** | Tenant-configurable on/off. |
| **PREMIUM** | Subscription-gated. |
| **BETA** | Controlled rollout — canary by tenant. |

**DB foundation:** V3 migration — `features` table + `tenant_features` mapping table. 13 seed features pre-loaded.

Feature governance rules: enable, disable, assign, create templates, rollout beta modules, manage dependencies, configure access rules.

#### 4. Subscription Management
Manages: plans, billing cycles, feature bundles, usage limits, trial access, enterprise contracts, renewal workflows, add-on modules.

#### 5. Template Marketplace
Templates: CBSE School, International School, Coaching Institute, College, Small School Lite.

Each template auto-configures: features, menus, permissions, branding, workflows, reports.

#### 6. Infrastructure Monitoring
Monitors: queue systems, API health, database performance, cache performance, storage usage, error logs, failed jobs, security alerts, background workers.

#### 7. Global Analytics Engine
Analytics: tenant growth, revenue, feature usage, API usage, login analytics, device analytics, geographic analytics, storage analytics, subscription conversion.

#### 8. Enterprise Audit System
Tracks (via `audit_log` table — V4 migration):

| Category | Events |
|----------|--------|
| `AUTH` | Login, logout, failed attempts, token refresh |
| `TENANT` | Create, suspend, archive, config changes |
| `PERMISSION` | Role assignment, permission changes |
| `FINANCE` | Fee collection, payments, refunds |
| `CONFIG` | Feature toggles, branding changes |
| `SECURITY` | Rate limit hits, suspicious patterns |
| `DATA` | Bulk imports, exports, deletions |
| `SYSTEM` | Bootstrap events, migration runs |

---

## 5. Layer 2 — Tenant / School Admin ERP

### Purpose
Each tenant gets a fully independent, UI-driven ERP management system for one or more schools or campuses.

### School Admin Controls

Students · Teachers · Parents · Academics · Operations · Finance · Communication · Online Activities · Reports · Settings · Workflows · Branding · Security

### School Admin Modules

#### 1. Dashboard
Shows: student count, attendance summary, fee collection, notifications, upcoming exams, homework status, teacher activity, parent engagement, online classes, transport activity, hostel activity, staff attendance.

#### 2. Student Lifecycle Management
Manages: admissions, profiles, documents, academic history, attendance, discipline, certificates, transfers, alumni, medical records, fee records, parent mapping.

#### 3. Teacher & Staff Management
Manages: profiles, departments, attendance, leave requests, payroll, timetables, performance reviews, permissions, documents.

#### 4. Parent Management
Parents can: view attendance, view fees, view homework, view exams, communicate with school, track transport, receive notifications.

#### 5. Academic Management
Manages: classes, sections, subjects, timetables, syllabus, homework, lesson plans, assignments, projects, academic calendar.

#### 6. Attendance Management
Supports: manual, QR, GPS, biometric, RFID, face recognition.

#### 7. Examination System
Supports: exam scheduling, marks entry, grading, report cards, rankings, result publishing, analytics, online exams, AI insights.

#### 8. Finance & Fee Management
Supports: fee structures, online payment, installments, late fees, discounts, scholarships, transport fees, hostel fees, payroll, accounting.

#### 9. Communication System
Supports: SMS, email, push notifications, WhatsApp, circulars, parent chat, teacher announcements, emergency alerts.

#### 10. Online Learning System
Supports: online classes, video uploads, assignments, notes, recorded sessions, digital library, live chat, AI tutoring.

#### 11. Transport Management
Supports: routes, vehicle tracking, driver management, GPS tracking, pickup/drop alerts, route optimization.

#### 12. Hostel Management
Supports: room allocation, attendance, visitor tracking, hostel fees, discipline.

#### 13. HRMS System
Supports: recruitment, leave management, attendance, payroll, employee lifecycle, performance management.

#### 14. Inventory & Asset Management
Tracks: lab assets, furniture, devices, books, uniform inventory, maintenance logs.

#### 15. Workflow Engine
UI-driven workflows: admission approvals, leave approvals, fee approvals, exam publishing, document verification.

#### 16. Dynamic Form Builder
Creates from UI: admission forms, feedback forms, staff forms, survey forms.

#### 17. Role & Permission Engine
Dynamic RBAC roles: Principal, Vice Principal, Teacher, Accountant, Librarian, Hostel Warden, Parent, Student.

#### 18. Branding Engine
Per-school support: logos, themes, colors, email branding, mobile branding, custom domain.

#### 19. Analytics & Reporting
Reports: attendance, fees, academics, teacher performance, parent engagement, student performance, financial analytics, operational analytics.

#### 20. Mobile App Ecosystem
Apps: Student App, Parent App, Teacher App, Admin App, Transport App.

---

## 6. Website Builder & Digital Experience Platform

### Goal
Full website + admissions + marketing experience managed entirely from UI — no developers needed.

Features: Pages, blogs, events, galleries, SEO, inquiries, funnels, branding, analytics, AI-generated content.

### Feature Tiers

| Tier | Features |
|------|---------|
| **FREE** | Basic pages, gallery, contact form |
| **GROWTH** | Blog, events, SEO tools, analytics, social proof |
| **PRO** | Teacher profiles, booking, admissions tools, communication widgets |
| **ELITE** | AI builder, AI SEO, multi-language, branding engine, chatbot, marketing automation, eCommerce |

### Architecture Decision

**Three options (decision pending — CC-2001):**

| Option | Description | Best for |
|--------|-------------|---------|
| **A** | Dynamic render (DB-driven) + aggressive caching | Real-time content, simpler ops |
| **B** | Static export to object storage + CDN | Max performance, SEO |
| **C** | **Hybrid** — static public pages + dynamic widgets/forms | Recommended — best of both |

**Required documentation before CC-2001:**
- Custom domain mapping + verification + SSL strategy
- Cache invalidation strategy when pages change
- SEO essentials: sitemap, meta tags, structured data

### Super Admin Website Governance
Controls: website templates, subscription mapping, premium widgets, global themes, AI feature rollout, marketplace sections, website feature access.

### School Admin Website Control
Manages: home page, about page, admissions pages, blogs, events, galleries, teacher profiles, branding, SEO, inquiry forms, marketing integrations, social embeds, custom sections — all from UI.

---

## 7. Technical Architecture (As-Built — 2026-05-12)

### Backend Stack

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| **Runtime** | Java | 21 LTS | Virtual Threads ready (CC-0011 completes `ScopedValue` migration) |
| **Framework** | Spring Boot | 3.4.5 | Upgraded from 3.3.5 |
| **Security** | Spring Security | 6.x | Permit-all Phase 1; JWT enforcement in CC-0102 |
| **JWT** | JJWT | 0.12.6 | HS256; access=15min, refresh=30 days |
| **ORM** | Spring Data JPA / Hibernate | included | Batch size 50, UTC timezone |
| **Migrations** | Flyway 10 | included | Requires `flyway-database-postgresql` explicit dep |
| **Logging** | logstash-logback-encoder | 8.0 | JSON async in prod, readable in dev |
| **Metrics** | Micrometer + Prometheus | included | Exposed at `/actuator/prometheus` |
| **Build** | Maven | 3.x | Layered JAR for Docker layer caching |

### Database Strategy — **Option A (Implemented)**

Single PostgreSQL database, shared schema, `tenant_id` column on all tenant-scoped tables.

**PostgreSQL version:** 16 (production). H2 in-memory (dev profile only — limited PostgreSQL semantics).

#### Database Migrations (Flyway)

| Version | Description | Status |
|---------|-------------|--------|
| `V1__init.sql` | Initial schema — `tenants` table | ✅ Done |
| `V2__add_tenant_updated_at.sql` | Add `updated_at` to tenants, backfill, NOT NULL | ✅ Done |
| `V3__create_features_tables.sql` | `features` + `tenant_features`, 13 seed features | ✅ Done |
| `V4__create_audit_log.sql` | Append-only audit trail, 8 event categories | ✅ Done |
| `V5__create_users_table.sql` | `users` table, UUID PK, `tenant_id` nullable for SUPER_ADMIN | ✅ Done |
| `V6__create_schools.sql` | `schools` table — first-class school/campus entity inside tenant | ✅ Done |
| `V7__fix_audit_log_ip_address.sql` | Fix `ip_address` column type to `VARCHAR` for compatibility | ✅ Done |
| `V8__add_indexes.sql` | Composite indexes on all high-cardinality tenant-scoped queries | ✅ Done |
| `V9__soft_delete.sql` | `deleted_at` column on soft-deletable entities | ✅ Done |
| `V10__create_device_tokens.sql` | `device_tokens` table for push notification registration | ✅ Done |
| `V11__create_academic_years.sql` | `academic_years` — per-school year management | ✅ Done |
| `V12__create_classes.sql` | `classes` — grade/class definitions per school | ✅ Done |
| `V13__create_sections.sql` | `sections` — sections inside a class | ✅ Done |
| `V14__create_subjects.sql` | `subjects` — subject catalog per school | ✅ Done |
| `V15__create_departments.sql` | `departments` — staff department structure | ✅ Done |
| `V16__create_school_settings.sql` | `school_settings` — per-school configuration store | ✅ Done |
| `V17__create_students.sql` | `students` — student lifecycle, admission, profile | ✅ Done |
| `V18__create_student_parent_links.sql` | `student_parent_links` — parent-to-student mapping | ✅ Done |
| `V19__create_staff.sql` | `staff` — staff profiles, roles, departments | ✅ Done |
| `V20__create_attendance_sessions.sql` | `attendance_sessions` — per-class session tracking | ✅ Done |
| `V21__create_attendance_records.sql` | `attendance_records` — per-student attendance per session | ✅ Done |
| `V22__create_fee_categories.sql` | `fee_categories` — fee head definitions per school | ✅ Done |
| `V23__create_fee_structures.sql` | `fee_structures` — amount/frequency per category/class/year | ✅ Done |
| `V24__create_fee_payments.sql` | `student_fee_records` (invoices) + `fee_payments` (transactions) | ✅ Done |

### Tenant Resolution

**Current:** `X-Tenant-Id` request header → `TenantContextFilter` → `RequestContext.tenantId` (ThreadLocal).

**Next (CC-0102):** JWT claims take precedence; header used only for pre-auth flows.

**Precedence order:** JWT claim > custom domain > subdomain > `X-Tenant-Id` header.

### Cache Layer

**Technology:** Spring Data Redis (lazy-connect — app starts even if Redis is temporarily down).

**Uses:**
- Session cache (CC-0109)
- Feature flag cache (CC-0012)
- Permission cache (CC-0114)
- Dashboard cache (CC-0401)
- OTP cache (CC-0108)
- Refresh token store (CC-0105)

### Queue Architecture

**Technology (planned):** RabbitMQ (primary) + Redis Queue (lightweight jobs).

**Async operations:** notifications, reports, attendance processing, email/SMS jobs, bulk imports, audit log writes (high volume).

**Patterns:** at-least-once delivery, exponential backoff, dead-letter queues, idempotent job handlers, Outbox pattern for DB + event bus consistency.

### File Storage

**Technology (local dev):** MinIO (S3-compatible). **Production:** AWS S3 / compatible object storage.

**Requirements:** CDN integration, signed URLs with TTL, tenant-scoped paths (`/{tenant_id}/{school_id}/...`), compression, media optimization, optional malware scanning for enterprise.

### Security Architecture

#### Implemented (as of 2026-05-12)

| Control | Implementation |
|---------|---------------|
| **JWT auth** | JJWT 0.12.6 — `JwtUtil` generates/validates HS256 tokens |
| **Password hashing** | `BCryptPasswordEncoder(12)` — cost factor 12 ≈ 300ms/hash |
| **Security headers** | `SecurityHeadersFilter` — 7 OWASP headers on every response |
| **CORS** | `SecurityConfig` — origin pattern allowlist, preflight cache 1h |
| **Correlation ID sanitization** | `CorrelationIdFilter` — regex `^[a-zA-Z0-9\-]{1,64}$`, invalid IDs silently replaced |
| **Input validation** | `@Pattern`, `@Size` on all DTOs; tenant code enforced to slug format |
| **Audit log schema** | V4 migration — append-only, never updated or deleted |
| **Session management** | STATELESS — no server-side sessions, no CSRF needed |

#### Security Headers (applied to every response)

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
Cache-Control: no-store, no-cache, must-revalidate
```

#### Planned (CC-0102 onwards)

- `JwtAuthenticationFilter` — populates `SecurityContext` from `Authorization: Bearer` header
- Login API (`/v1/auth/login`) with credential validation + token pair issuance
- Redis-backed refresh token rotation (single-use, rotating)
- Rate limiting (CC-1801)
- Device tracking (CC-0110)
- Account lockout after N failed attempts (CC-0116)
- MFA for Super Admin (CC-0116)

### Platform API Contracts

| Contract | Standard |
|----------|---------|
| **API versioning** | URI-based: `/v1/`, `/v2/` — deprecation via `Sunset` header |
| **Pagination** | Offset-based; `PageResponse<T>` envelope with `page`, `size`, `totalElements`, `totalPages` |
| **Error response** | `ApiError` with `correlationId`, `status`, `code`, `message`, `timestamp` |
| **Idempotency** | Idempotency key header required for payments, bulk imports, notification dispatch |
| **Tenant scoping** | `tenant_id` filter applied at service layer — never bypass |

### Observability

| Signal | Implementation |
|--------|---------------|
| **Structured logs** | logback-spring.xml — JSON in prod (AsyncAppender, queue=1024), readable in dev |
| **Correlation IDs** | MDC key `correlationId` — sanitized input, propagated to all log lines |
| **Metrics** | Micrometer → Prometheus → `/actuator/prometheus` |
| **Slow query logging** | Hibernate: queries > 200ms logged in all environments |
| **Health probes** | `/actuator/health/liveness` + `/actuator/health/readiness` |
| **Tracing** | Planned: OpenTelemetry for login, onboarding, payment, notification flows |

### Local Development Infrastructure

```bash
# Start all local services
docker compose up -d
```

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| **PostgreSQL 16** | `postgres:16-alpine` | 5432 | Primary database |
| **Redis 7** | `redis:7-alpine` | 6379 | Cache + refresh tokens |
| **MinIO** | `minio/minio:latest` | 9000 / 9001 | S3-compatible file storage |
| **MailHog** | `mailhog/mailhog:latest` | 1025 / 8025 | SMTP catcher — inspects outbound emails |

```bash
# Run backend with dev profile
export JAVA_HOME=/path/to/jdk-21
export JWT_SECRET="your-strong-secret-minimum-32-chars"
export BOOTSTRAP_ADMIN_PASSWORD="InitialPassword123!"
mvn spring-boot:run
```

### Background Jobs Standard

- **Delivery semantics:** At-least-once (idempotent handlers mandatory)
- **Retry policy:** Exponential backoff with jitter; max 5 retries
- **Dead-letter:** Failed jobs → DLQ with alert; manual replay support
- **Outbox pattern:** Recommended for DB + event bus consistency

---

## 8. AI Technology Layer (Enterprise AI Platform)

### AI Goal
Deliver safe, configurable, tenant-scoped AI across ERP, Website Builder, and all user portals.

### AI Requirements

- **Feature-flagged** and subscription-controlled per tenant
- **Configuration-driven** — no tenant-specific code forks
- **Tenant-scoped** — data, prompts, and knowledge bases are isolated per tenant
- **Audited** — who asked what, which sources, which actions
- **Cost-controlled** — per-tenant budgets and usage metering

### AI Platform Building Blocks

#### 1. AI Gateway Service (CC-1600)
- Provider-agnostic interface for all AI calls (chat, embeddings, reranking, multimodal)
- Per-tenant routing policies (latency/cost tiers, allowed models)
- Per-tenant usage tracking (tokens, requests, latency)

#### 2. Prompt & Policy Registry (CC-1601)
- Versioned configuration: draft → publish → rollback
- Role-aware instructions (Super Admin / School Admin / Teacher / Parent / Student)
- Structured outputs for automation flows (JSON schema-driven)
- Rollout controls: beta/canary by tenant with feature flags

#### 3. Tenant Knowledge Base — RAG (CC-1602, CC-1603)
- Pipeline: source → parse → chunk → embed → index
- Metadata on every chunk: `tenant_id`, `school_id`, `module`, `audience`, `permissions`, `source_type`, `updated_at`
- Retrieval always filtered by `tenant_id` (and `school_id` where applicable)
- Permission-aware retrieval: role-based visibility at chunk level
- Citations to source documents provided in responses

#### 4. AI Tools / Actions (ERP + Website Automation)
- Controlled tool layer calling internal APIs
- Actions: create leads, draft notifications, generate reports, summarize logs, assist admins
- All actions: RBAC-checked + audit-logged + optionally approval-gated

#### 5. AI Quality & Continuous Improvement (CC-1606)
- Evaluation dataset per module (questions + expected behaviour)
- Quality signals: thumbs up/down feedback, citation coverage, response latency, cost per request
- Config changes tested before wide rollout

#### 6. AI Cost & Safety Controls (CC-1605)
- Meter AI usage per tenant (tokens, tool calls, embedding storage)
- Enforce plan-based limits (daily/monthly budgets, rate limits, concurrency)
- Super Admin visibility: top tenants by usage/cost/adoption, pause AI per tenant

### AI Implementation Sequence

1. Build AI gateway service + tenant-scoped routing (CC-1600)
2. Add prompt/policy registry with versioning + rollout control (CC-1601)
3. Implement tenant knowledge base — RAG with permission-aware retrieval (CC-1602, CC-1603)
4. Release internal copilots — Super Admin + School Admin — for controlled adoption (CC-1607)
5. Expand to Teacher/Parent/Student assistants + Website AI modules
6. Add AI analytics insights + automation workflows (approval-gated) (CC-1608)

---

## 9. Performance Targets

| Metric | Target |
|--------|--------|
| **Concurrent users** | 100,000+ |
| **Total students** | 1,000,000+ |
| **API response (p95)** | < 200ms for read, < 500ms for write |
| **Dashboard load (p95)** | < 1s (cached), < 3s (cold) |
| **Queue processing** | Stable under 10K notifications/minute |
| **Import throughput** | 10,000 student records in < 60s |

**Scaling plan:**

| Scale | Action |
|-------|--------|
| 1K–10K users | Tune HikariCP pool, add Redis caching for hot queries |
| 10K–100K users | Read replicas, async report generation, queue workers |
| 100K–500K users | Extract notification-service and ai-service as microservices |
| 500K–1M+ users | Extract report-service and attendance-service; DB partitioning by `tenant_id` |

---

## 10. Execution Roadmap Structure

See [`02_CLOUDCAMPUS_EXECUTION_ROADMAP_TASKS_UPDATED.md`](./02_CLOUDCAMPUS_EXECUTION_ROADMAP_TASKS_UPDATED.md) for full task list.

### Task ID Convention

```
CC-XXXX | Title | P0/P1/P2/P3 | STATUS
Depends on: CC-YYYY
Scope (API / UI / DB):
Definition of Done (tests / audit / metrics / tenant isolation verified):
```

### Phases

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

### MVP Milestones (Thin Slice)

| Milestone | Deliverables |
|-----------|-------------|
| **M1** — Tenant Onboarding + Secure Access | Tenant entity + resolver + DB filters; User + JWT + RBAC + permission middleware; Super Admin: create tenant + assign plan/features |
| **M2** — School Admin Basics | Academic year + class/section/subject; Student entity + admission + listing; Basic dashboard |
| **M3** — Operational Core | Manual attendance + attendance report; Fee structure + collection + receipt; SMS/email notification baseline |
| **M4** — Enterprise Guardrails | Audit logs + observability + backups; Rate limiting + tenant isolation test suite |

---

## 11. Pricing & Cost Control

Target: keep onboarding and per-school costs predictable (goal: ≤ $1,000/school).

**Strategy:**
- Default to Option A tenancy (single DB) for all standard schools
- Enforce plan-based limits for all expensive operations:
  - AI usage budgets (tokens/tools per month)
  - Notification quotas (SMS/WhatsApp/email per month)
  - Storage limits (documents/media per school)
  - Report job concurrency limits
- Provide usage metering dashboard + self-serve upgrade flows in Tenant Admin

---

*End of Specification — v2*
