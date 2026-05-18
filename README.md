# CloudCampus

Enterprise Digital School SaaS — multi-tenant, schema-based architecture.

**Stack:** Java 21 · Spring Boot 3.4.5 · Spring AI 1.0.0 · React 19 · Expo (React Native) · PostgreSQL 16 + pgvector · Redis 7 · MinIO · Prometheus · Grafana · Tempo

---

## Project Layout

```
CloudCampus/
├── backend/          # Spring Boot API (Java 21)
├── frontend/         # React 19 + TypeScript web app (Vite)
├── mobile/           # Expo / React Native mobile app (SDK 54)
├── infra/
│   ├── prometheus/   # Prometheus config + alert rules
│   └── grafana/      # Grafana provisioning + dashboards
├── docs/             # Consolidated architecture, audit, and remediation docs
└── docker-compose.yml
```

---

## Architecture

CloudCampus uses a **multi-tenant, schema-based** model. Every tenant gets row-level isolation via Hibernate `@Filter`. A `RequestContext` (ThreadLocal) carries `tenantId`, `schoolId`, and `userId` through every request.

```
Browser / Mobile
      │
      ▼
  Load Balancer (HTTPS)
      │
      ▼
  Spring Boot API  ──► PostgreSQL 16 + pgvector (per-tenant row isolation)
      │              ──► Redis 7     (sessions / cache / QR tokens)
      │              ──► MinIO       (file storage)
      │              ──► SMTP / SES  (email)
      │              ──► Anthropic / OpenAI (AI gateway — mocked in dev)
      │
      ▼
  Prometheus ──► Grafana dashboards
```

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Java 21 (Temurin) |
| Framework | Spring Boot 3.4.5 |
| AI | Spring AI 1.0.0 · Anthropic Claude · OpenAI Embeddings · pgvector |
| Database | PostgreSQL 16 + pgvector · Flyway migrations V1–V86 |
| Cache / Session | Redis 7 |
| Object Storage | MinIO (S3-compatible) |
| Auth | JWT (HS256) · Spring Security |
| Web App | React 19 · TypeScript · Vite · TanStack Query v5 |
| Mobile | Expo SDK 54 · React Native 0.81.5 (New Architecture) |
| Offline sync | WatermelonDB + custom sync queue |
| Push notifications | Expo Notifications + FCM / APNs |
| Observability | Micrometer · OpenTelemetry (OTLP) · Prometheus · Grafana · Tempo |
| Local infra | Docker Compose |

---

## Getting Started

### Prerequisites

- **Java 21** (Temurin recommended)
- **Maven 3.9+**
- **Node 20 / npm 10**
- **Docker + Docker Compose** (for local services)

### 1 — Start local services

```bash
docker compose up -d   # pgvector/pgvector:pg16, Redis, MinIO, MailHog, Prometheus, Grafana, Tempo
```

> **Note:** The `postgres` service uses `pgvector/pgvector:pg16` (not `postgres:16-alpine`) to support the AI vector store (V46 migration). If you were previously on `postgres:16-alpine`, run `docker compose down` then `docker compose up -d` to recreate the container.

| Service | URL |
|---------|-----|
| Public website | http://localhost:5173 |
| Public website home alias | http://localhost:5173/home |
| Admin login | http://localhost:5173/login |
| API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| MailHog | http://localhost:8025 |
| MinIO console | http://localhost:9001 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3100 (admin / admin) |
| Tempo | http://localhost:3200 |

### 2 — Run the backend

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

AI runs in **mock mode** in dev (no API keys required, no external calls):
- `spring.ai.anthropic.chat.enabled=false` → `MockChatModel` registered via `@ConditionalOnMissingBean`
- `spring.ai.openai.embedding.enabled=false` → `MockEmbeddingModel` registered similarly

### 3 — Run the web frontend

```bash
cd frontend
npm install
npm run dev           # http://localhost:5173
```

Public web routes:
- `/` and `/home` render the CloudCampus public marketing website.
- `/login` remains the authenticated portal entry point.
- `/features`, `/platform`, `/ai`, `/investors`, `/pricing`, `/about`, and `/contact` reuse the public website shell.

### 4 — Run the mobile app

```bash
cd mobile
npm install --legacy-peer-deps
npx expo start
```

---

## Environment Profiles

| Profile | DB | When to use |
|---------|----|-------------|
| `dev` | PostgreSQL (Docker Compose) | Local development |
| `test` | Testcontainers PostgreSQL | CI / automated tests |
| `staging` | PostgreSQL via env vars | Pre-production validation |
| `prod` | PostgreSQL via env vars (SSL) | Live traffic |

Select profile at startup:

```bash
SPRING_PROFILES_ACTIVE=staging java -jar cloudcampus-backend.jar
```

### Required environment variables (staging / prod)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | JDBC URL, e.g. `jdbc:postgresql://host:5432/cloudcampus` |
| `DATABASE_USERNAME` | DB user |
| `DATABASE_PASSWORD` | DB password |
| `REDIS_HOST` / `REDIS_PORT` | Redis host and port |
| `JWT_SECRET` | ≥ 32 chars (≥ 64 for prod); no default in prod — app refuses to start if unset |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USERNAME` / `MAIL_PASSWORD` | SMTP credentials |
| `BOOTSTRAP_ADMIN_EMAIL` / `BOOTSTRAP_ADMIN_PASSWORD` | First-boot super-admin |
| `ANTHROPIC_API_KEY` | Claude API key (set `APP_AI_ENABLED=true` to activate) |
| `OPENAI_API_KEY` | OpenAI embeddings key (set `APP_AI_ENABLED=true` to activate) |
| `FRONTEND_BASE_URL` | Frontend origin for QR deep-links (default: `http://localhost:5173`) |

---

## Feature Status

> **As of 2026-05-19 — ~219 of 232 tasks done (94%) — TASK-001–019 complete**

### Backend (Java / Spring Boot)

| Area | Status |
|------|--------|
| Multi-tenant row isolation (Hibernate `@Filter`) | ✅ Done |
| JWT authentication filter | ✅ Done |
| Login / logout / refresh token API | ✅ Done |
| Change password + forced-change guard | ✅ Done |
| User management (CRUD + roles) | ✅ Done |
| Tenant management (super-admin) | ✅ Done |
| Flyway migrations V1–V46 | ✅ Done |
| Security headers (7 OWASP) | ✅ Done |
| Structured JSON logging (Logback) | ✅ Done |
| Prometheus + Micrometer metrics | ✅ Done |
| Device token registration (push) | ✅ Done |
| Staging + production Spring profiles | ✅ Done |
| Academic year / class / section / subject management | ✅ Done |
| Student admission + profile + listing APIs | ✅ Done |
| Student document upload (MinIO presigned URLs) | ✅ Done |
| Staff profiles + staff attendance + leave management | ✅ Done |
| Attendance sessions + bulk mark (school-admin + teacher) | ✅ Done |
| **QR Attendance** — teacher generates deep-link QR (5-min Redis token), students scan → self-mark PRESENT | ✅ Done (CC-0802) |
| Student attendance self-view | ✅ Done |
| Fee structure + collection + receipts | ✅ Done |
| Student fee self-view + parent child fee records | ✅ Done |
| **Subscription plan management** — plan catalog, assign plan to tenant, usage limits wired | ✅ Done (CC-0308) |
| Timetable management (weekly grid, conflict detection) | ✅ Done |
| Homework management (DRAFT→PUBLISHED→CLOSED lifecycle) | ✅ Done |
| Assignment engine (submissions + grading) | ✅ Done |
| Examination system (exams, papers, marks entry, results) | ✅ Done |
| SMS / email / push / WhatsApp notification services | ✅ Done |
| Parent portal APIs (children list + per-child detail) | ✅ Done |
| Teacher dashboard + school-admin live dashboard | ✅ Done |
| Rate limiting (login + per-user/per-tenant API) + audit logging + account lockout | ✅ Done |
| Tenant isolation (Hibernate filters + Testcontainers tests) | ✅ Done |
| Attendance / fee / performance reports (JSON + CSV export) | ✅ Done |
| Cross-school comparison dashboard | ✅ Done |
| Platform analytics dashboard (`/v1/super-admin/analytics`) | ✅ Done |
| Tenant configuration engine (config keys + usage limit enforcer) | ✅ Done |
| Tenant branding engine (logo, favicon, primary/secondary colors) | ✅ Done |
| Feature dependency engine (auto-enable dependencies, block disable if dependents active) | ✅ Done |
| Redis API caching — `@Cacheable` on reference data | ✅ Done |
| Query optimisation — composite covering indexes (V39) | ✅ Done |
| At-rest PII encryption — AES-256-GCM on Student/Staff phone, email, address | ✅ Done |
| GDPR/PDPA data retention — nightly purge of expired soft-deleted users | ✅ Done |
| RabbitMQ queue integration (email/SMS notification delivery) | ✅ Done |
| **AI Foundation** — Spring AI 1.0.0 + pgvector + Anthropic chat + OpenAI embeddings + mock mode | ✅ Done (CC-1600/1601/1602) |
| **AI Prompt Registry** — versioned prompt templates, activate/deactivate, render playground | ✅ Done (CC-1601) |
| **AI Gateway** — wraps ChatModel, logs token usage to `ai_usage_logs` | ✅ Done (CC-1600) |
| **AI Embedding Service** — tenant-scoped similarity search via pgvector | ✅ Done (CC-1602) |
| JNV Lucknow demo seed (V42) — 560 students, 23 staff, 5 working logins | ✅ Done |
| **AI Copilot (CC-1603)** — `POST /v1/school-admin/ai/query`: natural-language Q&A for school admins, feature-gated, CRIT-15 prompt injection compliant | ✅ Done |
| **Experience Studio — Analytics** — `GET /v1/super-admin/experience/analytics?days=N`: aggregates PAGE_VIEW / CTA_CLICK / DEMO_START / INVESTOR_ROOM_VIEW event counts | ✅ Done |
| **Experience Studio — AI Content Generation** — `POST /v1/super-admin/experience/content-blocks/{id}/ai-generate`: AI-powered copy generation with mock fallback | ✅ Done |
| **Experience Studio — Brand System** — tenant branding CRUD + seed data (V75/V76) | ✅ Done |
| **Experience Studio — Stakeholder Journey Engine** — journey + audience segmentation CRUD | ✅ Done |
| **Experience Studio — Story Scene Engine** — scene builder with type, content, CTA | ✅ Done |
| **Experience Studio — Trust Module Engine** — trust/social-proof module management | ✅ Done |
| **Experience Studio — Website Route & Template Marketplace** — route configs + template catalog (V77/V78) | ✅ Done |
| **Experience Studio — Marketing Campaign Engine** — drip campaign builder with steps | ✅ Done |
| **Experience Studio — Seed Health Monitor** — `/v1/super-admin/experience/seed-health` reports seeded entity counts | ✅ Done |
| **Experience Studio — Public Render Profile** — `/v1/experience/public/render-profile` unified public API | ✅ Done |
| **Public Website** — platform_public_website tables + seed (V79/V80) | ✅ Done |
| **Public SaaS Website UI** — investor-ready landing page with hero, stats, role showcase, feature grid, platform previews, investor, demo, pricing, footer | ✅ Done |
| **Super Admin Public Website Link** — dynamic live-site link generated from current `window.location.origin` for local/staging/prod | ✅ Done |
| Experience event partition extension through 2028 (V81) | ✅ Done |
| Payment gateway idempotency keys (V82) | ✅ Done |
| **Upload audit log** (V83) — `upload_audit_log`: UPLOAD / DOWNLOAD_URL / DELETE events with tenant, actor, correlation ID; TASK-010 | ✅ Done |
| **Tenant storage quota** — per-tenant byte cap via `TenantConfigKey.MAX_STORAGE_BYTES`; upload rejected before MinIO write when exceeded; TASK-011 | ✅ Done |
| **Antivirus/quarantine design doc** — `docs/UPLOAD_ANTIVIRUS_QUARANTINE_DESIGN.md`; TASK-012 | ✅ Done |
| **Website rollback audit log** (V84) — immutable ledger of publish and rollback events; TASK-016 | ✅ Done |
| **Website audit timeline** (V85) — `website_audit_timeline`: PAGE/SECTION/NAVIGATION/THEME/WEBSITE events; `GET /v1/super-admin/public-website/audit-timeline`; TASK-018 | ✅ Done |
| **Investor room access audit** (V86) — `investor_room_access_log`: METADATA_ACCESS / CONTENT_ACCESS / UNLOCK_SUCCESS / UNLOCK_FAILURE / EXPIRED; EXPIRED uses `REQUIRES_NEW` to commit despite outer tx rollback; TASK-019 | ✅ Done |

### Web Frontend (React / TypeScript)

| Area | Status |
|------|--------|
| Auth (login · logout · token refresh · change password) | ✅ Done |
| **Tenant onboarding wizard** — 3-step (Identity → Plan selection → Review) | ✅ Done (CC-0204) |
| **Subscription management UI** — plan picker, billing cycle, assign plan in TenantDetailPage | ✅ Done (CC-0308) |
| **Plan upgrade page** — real plan catalog with pricing/limits from API | ✅ Done |
| Super-admin tenant management UI | ✅ Done |
| Super-admin analytics + cross-school comparison | ✅ Done |
| **Super-admin AI prompt registry** — list by key, version history, activate/deactivate | ✅ Done (CC-1601) |
| **Super-admin prompt detail + playground** — render prompt with live AI, countdown timer | ✅ Done (CC-1601) |
| **AI Copilot page** — school-admin chat UI, suggested-question chips, message history, token counter, export conversation | ✅ Done (CC-1603) |
| **Experience Control Center** — 10-domain Studio shell (Branding, Journeys, Stories, Trust, Routes, Templates, Campaigns, AI, Presentations, Seed Health) | ✅ Done |
| **BrandingSystemManager** — global brand config UI | ✅ Done |
| **StakeholderJourneyManager** — journey editor + audience picker | ✅ Done |
| **StorytellingManager** — scene cards + type badges | ✅ Done |
| **TrustPlatformManager** — trust module cards | ✅ Done |
| **WebsiteRouteManager** — route table + create/edit modal | ✅ Done |
| **TemplateMarketplaceManager** — template grid + usage count | ✅ Done |
| **MarketingAutomationManager** — campaign list + step count | ✅ Done |
| **AiExperienceManager** — AI content generation UI with block-ID picker, content-type selector, structured JSON preview, copy-to-clipboard | ✅ Done |
| **PresentationBuilderManager** — presentation list + slide builder | ✅ Done |
| **SeedHealthPanel** — entity count dashboard with status badges | ✅ Done |
| **RenderProfilePreview** — live preview of public-facing render profile | ✅ Done |
| **ExperienceAnalyticsDashboard** — stat cards + CSS bar chart for event funnel, period selector (7/14/30/90 days) | ✅ Done |
| **CloudCampus public homepage** — premium SaaS landing page at `/` and `/home`, config-driven sections for future Website Builder editing | ✅ Done |
| **Public Website Builder live link** — `View Public Website` in Super Admin shell and `View Live Website` in Public Website Builder shell | ✅ Done |
| **Website audit timeline panel** — last 12 change events displayed in `PublicWebsitePublishPage`; backed by `GET /v1/super-admin/public-website/audit-timeline`; TASK-018 | ✅ Done |
| School-admin dashboard (live stats), academic management | ✅ Done |
| Student management (admit / profile / list / bulk import / promotion) | ✅ Done |
| Staff management (list / create / profile) | ✅ Done |
| Attendance management (session list / create / mark) | ✅ Done |
| **QR Attendance panel** — teacher selects period → Generate QR → live countdown display | ✅ Done (CC-0802) |
| **Student QR scan page** — auto-submits token on mount, shows success/error/expired state | ✅ Done (CC-0802) |
| Fee management (structures / collection / receipts) | ✅ Done |
| Timetable, homework, assignment, exam, marks pages | ✅ Done |
| Communication pages (notifications / WhatsApp) | ✅ Done |
| Reports page (attendance / fee / performance, CSV export) | ✅ Done |
| Notice board | ✅ Done |
| Student portal (dashboard / homework / assignments / timetable / notices / results / fees / attendance) | ✅ Done |
| Teacher portal (dashboard / timetable / homework / assignments / attendance / notices / leave) | ✅ Done |
| Parent portal (dashboard / child detail: attendance / homework / results / timetable / fees) | ✅ Done |
| Role-based protected routes (Student / Teacher / Parent / SchoolAdmin / SuperAdmin) | ✅ Done |
| Feature-flag-driven sidebar navigation | ✅ Done |
| Tenant branding (logo, favicon, CSS custom properties applied at runtime) | ✅ Done |

### Mobile (Expo / React Native)

| Area | Status |
|------|--------|
| Navigation scaffold (Expo Router) | ✅ Done |
| Secure token storage (SecureStore + MMKV) | ✅ Done |
| Proactive JWT refresh | ✅ Done |
| Offline-first attendance (WatermelonDB) | ✅ Done |
| Push notifications (FCM / APNs) | ✅ Done |
| Role-aware dashboard (Student / Teacher / Parent sections) | ✅ Done |
| Student screens: assignments, results, fees, attendance, timetable | ✅ Done |
| Teacher screens: timetable, homework, assignments | ✅ Done |
| Parent screens: children list with attendance, homework, fees, exam results | ✅ Done |
| Forgot password + reset password (OTP-based) | ✅ Done |
| Change password screen + forced-change navigation guard | ✅ Done |
| **QR attendance scan screen** — deep-link handler: reads `?token=` from URL params, auto-submits to `POST /v1/student/attendance/qr-mark`, manual paste fallback | ✅ Done (CC-0802) |
| **Teacher QR display** — Generate QR Attendance button in attendance screen, shareable deep-link, 5-min countdown, Share API | ✅ Done (CC-0802) |
| **Student promotion screen** — school-admin bulk promotion with cascading class/section pickers, result card | ✅ Done |

### DevOps / Observability

| Area | Status |
|------|--------|
| Docker Compose (local stack — pgvector image) | ✅ Done |
| Prometheus scraping + alert rules | ✅ Done |
| Grafana dashboards (9 panels) | ✅ Done |
| Staging / production profiles | ✅ Done |
| pg_dump backup sidecar + disaster recovery drill script | ✅ Done |
| **Scheduled DR drill** — monthly GitHub Actions workflow (`dr-drill.yml`): spins up Postgres + MinIO, runs Flyway, seeds data, executes backup + restore drill; TASK-007 | ✅ Done |
| **Backup freshness monitoring** — Pushgateway (`prom/pushgateway:v1.9.0`, port 9091) in Docker Compose; `backup.sh` pushes `cc_backup_last_success_timestamp_seconds`; `BackupNotFresh` (>8h) and `BackupMetricAbsent` (>25h) Prometheus alerts; TASK-008 | ✅ Done |
| **Incident runbook** — `docs/INCIDENT_RUNBOOK.md`: PB-1 PostgreSQL restore, PB-2 Redis outage, PB-3 RabbitMQ backlog, PB-4 MinIO failure, PB-5 tenant comms; TASK-009 | ✅ Done |
| CI/CD pipeline (4-job GitHub Actions: backend / frontend / mobile / docker) | ✅ Done |

---

## Remaining Work (~13 tasks, 6% — TASK-020 onwards)

Production readiness roadmap: TASK-001–019 complete. Remaining tasks cover AI safety hardening, load testing, deployment gates, security compliance, and operational SOPs.

| Area | Task | Notes |
|------|------|-------|
| Investor room expiry validation tests | TASK-020 | Expired rooms must never expose protected content |
| Watermark / download control plan | TASK-021 | Design doc only |
| AI prompt injection test cases | TASK-022 | CRIT-15 regression suite |
| Cross-tenant RAG leakage tests | TASK-023 | Embedding isolation verification |
| AI usage audit dashboard | TASK-024 | Token spend per tenant |
| AI budget anomaly alert | TASK-025 | Prometheus alert on spend spike |
| k6 load test scenarios | TASK-027–028 | School admin + public website flows |
| Database index audit | TASK-029 | Query plan review on large tables |
| Migration gate + rollback playbook | TASK-031–032 | Zero-downtime deployment checklist |
| MFA / SSO readiness plan | TASK-035–037 | Super admin hardening + SAML/OIDC design |
| Alert routing + audit retention policy | TASK-038–039 | Alertmanager routes + data lifecycle |
| Experience Studio — Ephemeral tenant provisioning | Phase 5 — EUP-100 | Isolated school per demo session |
| AI Copilot ScopedValue migration | EUP-007 partial | `ScopedValue` refactor of `RequestContext` for virtual threads |

---

## Postman Collection

A comprehensive Postman collection is provided in `docs/postman/`:

| File | Description |
|------|-------------|
| `CloudCampus.postman_collection.json` | 8 folders, ~80 requests covering all roles |
| `CloudCampus.local.postman_environment.json` | 73 pre-filled variables (JNV Lucknow UUIDs, tokens) |

Login requests auto-save JWT tokens to environment variables. Import both files, run a login request, then execute any request in that role's folder.

Demo credentials and verified local URLs are documented in the consolidated **Demo Credentials** section of this README.

---

## API Reference

Swagger UI is available at **`/swagger-ui.html`** in `dev` profile only.

Base path: `/v1`

### Auth

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/v1/auth/login` | Obtain access + refresh tokens |
| `POST` | `/v1/auth/refresh` | Rotate refresh token |
| `POST` | `/v1/auth/logout` | Revoke refresh token |
| `POST` | `/v1/auth/change-password` | Change own password |
| `POST` | `/v1/auth/forgot-password` | Send OTP reset email |
| `POST` | `/v1/auth/reset-password` | Reset password with OTP |
| `POST` | `/v1/auth/revoke-all` | Revoke all sessions for current user |

### School Admin

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/v1/school-admin/schools/{id}/dashboard` | Live dashboard stats |
| `GET` | `/v1/school-admin/schools/{id}/academic-years` | List academic years |
| `GET` | `/v1/school-admin/academic-years/{id}/classes` | List classes |
| `GET` | `/v1/school-admin/classes/{id}/sections` | List sections |
| `GET` | `/v1/school-admin/schools/{id}/students` | List students |
| `GET` | `/v1/school-admin/schools/{id}/staff` | List staff |
| `GET` | `/v1/school-admin/schools/{id}/attendance/sessions?date=` | Sessions on a date |
| `GET` | `/v1/school-admin/classes/{id}/attendance/sessions?from=&to=` | Sessions date range |
| `GET` | `/v1/school-admin/schools/{id}/timetable?academicYearId=&classId=&sectionId=` | Timetable |
| `GET` | `/v1/school-admin/schools/{id}/exams` | List exams |
| `GET` | `/v1/school-admin/schools/{id}/fee-structures` | List fee structures |
| `GET` | `/v1/school-admin/schools/{id}/notices` | List notices |

### Teacher

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/v1/teacher/dashboard` | Teacher dashboard |
| `GET` | `/v1/teacher/timetable` | Own timetable |
| `GET` | `/v1/teacher/attendance/students?classId=&sectionId=` | Students for attendance |
| `POST` | `/v1/teacher/attendance/sessions` | Create session + bulk mark |
| `POST` | `/v1/teacher/attendance/sessions/with-qr` | Create session + generate QR (CC-0802) |
| `POST` | `/v1/teacher/attendance/sessions/{id}/qr` | Generate QR for existing session |

### Student / Parent

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/v1/student/fees` | Own fee records |
| `GET` | `/v1/student/timetable` | Own timetable |
| `GET` | `/v1/student/attendance` | Own attendance summary |
| `POST` | `/v1/student/attendance/qr-mark` | Self-mark via QR token (CC-0802) |
| `GET` | `/v1/parent/children` | Linked children list |
| `GET` | `/v1/parent/children/{studentId}/attendance?from=&to=` | Child attendance |
| `GET` | `/v1/parent/children/{studentId}/fees` | Child fee records |

### Super Admin

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/v1/super-admin/tenants` | List all tenants |
| `POST` | `/v1/super-admin/tenants` | Create tenant |
| `GET` | `/v1/super-admin/analytics` | Platform-wide analytics |
| `GET` | `/v1/super-admin/subscription-plans` | List subscription plans |
| `GET` | `/v1/super-admin/tenants/{id}/subscription` | Get tenant subscription |
| `PUT` | `/v1/super-admin/tenants/{id}/subscription` | Assign plan to tenant |
| `GET` | `/v1/super-admin/ai/prompts` | List AI prompt templates |
| `POST` | `/v1/super-admin/ai/prompts` | Create prompt version |
| `GET` | `/v1/super-admin/ai/prompts/{id}` | Get prompt detail |
| `PATCH` | `/v1/super-admin/ai/prompts/{id}/activate` | Activate prompt version |
| `PATCH` | `/v1/super-admin/ai/prompts/{id}/deactivate` | Deactivate prompt version |
| `POST` | `/v1/super-admin/ai/prompts/{id}/render` | Test render prompt with AI |
| `GET` | `/v1/super-admin/public-website/dashboard` | Public website dashboard |
| `GET` | `/v1/super-admin/public-website/pages` | Public website page list |
| `POST` | `/v1/super-admin/public-website/pages` | Create public website page |
| `POST` | `/v1/super-admin/public-website/pages/{id}/publish` | Publish a page |
| `GET` | `/v1/super-admin/public-website/branding/themes` | List website themes |
| `GET` | `/v1/super-admin/public-website/seo` | List SEO entries |
| `POST` | `/v1/super-admin/public-website/publish` | Publish full website snapshot |
| `GET` | `/v1/super-admin/public-website/audit-timeline?limit=N` | Last N website change events (PAGE/SECTION/NAVIGATION/THEME/WEBSITE) |
| `GET` | `/v1/super-admin/public-website/publish/rollback-audit` | Rollback audit log |
| `GET` | `/v1/super-admin/tenants/{tenantId}/storage/quota` | Tenant storage quota usage |
| `GET` | `/v1/school-admin/storage/quota` | Own school storage quota usage |

### Public Website

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | CloudCampus public SaaS homepage |
| `GET` | `/home` | Public homepage alias |
| `GET` | `/features`, `/platform`, `/ai`, `/investors`, `/pricing`, `/about`, `/contact` | Public website routes using the same configurable page shell |
| `GET` | `/v1/experience/public/website/pages/{slug}` | Published website page payload |
| `GET` | `/v1/experience/public/website/navigation` | Published navigation |
| `GET` | `/v1/experience/public/website/theme` | Published theme tokens |

### Actuator

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/actuator/health` | Health check |
| `GET` | `/actuator/prometheus` | Prometheus metrics |

---

## AI Foundation (CC-1600/1601/1602)

The AI layer is fully implemented but runs in **mock mode** by default in dev. No API keys or external calls are needed to start the server.

### How mock mode works

| Bean | Dev behavior | Prod behavior |
|------|-------------|---------------|
| `ChatModel` | `MockChatModel` — returns deterministic responses | Anthropic Claude (`claude-haiku-4-5`) |
| `EmbeddingModel` | `MockEmbeddingModel` — returns unit vector from text hash | OpenAI `text-embedding-3-small` |
| `VectorStore` | `PgVectorStore` — pgvector table in local PostgreSQL | Same (pgvector on RDS) |

### Enabling real AI (staging/prod)

```bash
APP_AI_ENABLED=true
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

### Prompt registry endpoints

The prompt registry stores versioned prompt templates in `ai_prompt_templates`. One version per key can be active at a time. The UI at `/super-admin/ai/prompts` lets you create, activate, deactivate, and test-render prompts.

---

## QR Attendance (CC-0802)

### Teacher flow
1. Select period in `/teacher/attendance`
2. Click **Generate QR** — calls `POST /v1/teacher/attendance/sessions/with-qr`
3. Session is created (open, not finalized); QR code displayed with 5-min countdown
4. Display QR on projector or share screen

### Student flow
1. Student opens camera → scans QR
2. Phone opens `{FRONTEND_BASE_URL}/student/attendance/scan?token=…`
3. `StudentQrScanPage` auto-submits → `POST /v1/student/attendance/qr-mark`
4. Student marked **PRESENT** — idempotent (safe to scan twice)

### Token mechanics
- Stored as `cc:qr:{token}` → `sessionId` in Redis with 5-min TTL
- QR encodes the full deep-link URL (not just token) for camera-app compatibility
- Expired tokens return 400 "QR token is invalid or has expired"
- Session must not be finalized for self-mark to succeed

---

## Observability

Prometheus scrapes `/actuator/prometheus` every 10 seconds. Five alert rules are configured:

| Alert | Condition | Severity |
|-------|-----------|----------|
| `HighErrorRate` | HTTP 5xx > 1% for 2 min | warning |
| `HighP95Latency` | p95 latency > 2s for 2 min | warning |
| `ConnectionPoolNearExhaustion` | HikariCP > 90% for 1 min | critical |
| `BackendDown` | App unreachable for 1 min | critical |
| `JvmHeapHigh` | JVM heap > 85% for 5 min | warning |

Grafana (port 3100) ships with a pre-provisioned **CloudCampus Backend** dashboard covering request rate, error rate, p50/p95/p99 latency, HikariCP pool, JVM heap, and per-tenant request volume.

---

## Security

- All secrets supplied via environment variables — never hardcoded.
- `prod` profile: JWT_SECRET has no default; app refuses to start if unset.
- `SecretsGuardConfig` validates secret strength at startup in non-dev profiles.
- Actuator in `prod` bound to internal port 8081 (not reachable from public LB).
- Seven OWASP security headers injected on every response.
- `ddl-auto: validate` in staging/prod — Hibernate cannot alter the schema.
- HTTPS enforced via `forward-headers-strategy: native` (LB offloads TLS).
- AES-256-GCM PII field encryption on Student/Staff phone, email, address columns.
- Nightly GDPR retention job hard-purges soft-deleted users after configurable window.

---

## Branch Strategy

```
main                  ← stable releases
release/cloudcampus-v1 ← current active development
feature/*             ← feature branches
```

---

## License

Proprietary — CloudCampus © 2026. All rights reserved.

---

## How to Contribute and Push Changes

1. **Update the README or any file as needed.**
2. **Stage your changes:**
    ```bash
    git add README.md
    ```
3. **Commit your changes:**
    ```bash
    git commit -m "Update README: <short description of your change>"
    ```
4. **Push to GitHub:**
    ```bash
    git push origin <your-branch-name>
    ```

> _Note: Make sure you are on the correct feature or release branch before pushing. For mainline changes, use `release/cloudcampus-v1`._


---

# Consolidated Developer Guide

_Former source: `docs/DEV_GUIDE.md`._


**Version:** 2.1 | **Updated:** 2026-05-19
> Local development reference — credentials, UUIDs, commands, known issues.

---

## 1. Quick Start

```bash
# 1. Start all infrastructure
docker compose up -d
# NOTE: postgres image MUST be pgvector/pgvector:pg16 (not postgres:16-alpine)
# Flyway V46 requires pgvector. If wrong image: docker compose down && docker compose up -d

# 2. Backend (Flyway auto-applies V1–V86 on first boot)
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
# Runs on http://localhost:8080

# 3. Frontend
cd frontend
npm install && npm run dev
# Runs on http://localhost:5173

# 4. Mobile (optional)
cd mobile
npm install --legacy-peer-deps
npx expo start
```

> **First boot:** `superadmin` is bootstrapped automatically from `BOOTSTRAP_ADMIN_PASSWORD`.
> Dev profile defaults to `Admin@123` via `application-dev.yml`.

---

## 2. All Login Credentials

**All accounts use password: `Admin@123`**

### Frontend login: [http://localhost:5173/login](http://localhost:5173/login)

| Role | Username | Password | Notes |
|------|----------|----------|-------|
| Super Admin | `superadmin` | `Admin@123` | No tenant header needed |
| School Admin | `schooladmin` | `Admin@123` | Tenant: `jnv-lucknow` |
| Teacher | `teacher1` | `Admin@123` | Rajesh Kumar Sharma — Maths, Class X-A |
| Student | `student1` | `Admin@123` | Arjun Sharma — Class X, Section A |
| Parent | `parent1` | `Admin@123` | Guardian of Arjun Sharma |

### API login

```bash
# Super Admin (no X-Tenant-Id)
curl -X POST http://localhost:8080/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"Admin@123"}'

# School Admin / Teacher / Student / Parent
curl -X POST http://localhost:8080/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: jnv-lucknow" \
  -d '{"username":"schooladmin","password":"Admin@123"}'
```

Response: `data.accessToken`, `data.refreshToken`, `data.role`, `data.features`

---

## 3. Local Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Backend API | http://localhost:8080 | — |
| Swagger UI | http://localhost:8080/swagger-ui.html | dev only |
| Frontend | http://localhost:5173 | — |
| MailHog | http://localhost:8025 | — |
| MinIO Console | http://localhost:9001 | `minioadmin` / `minioadmin` |
| Prometheus | http://localhost:9090 | — |
| Grafana | http://localhost:3100 | `admin` / `admin` |
| Tempo | http://localhost:3200 | — |
| RabbitMQ | http://localhost:15672 | `cloudcampus` / `cloudcampus_dev` |

### PostgreSQL direct access

```bash
PGPASSWORD=cloudcampus_dev psql -U cloudcampus -d cloudcampus -h localhost
# or via Docker:
docker exec -it cloudcampus-postgres psql -U cloudcampus -d cloudcampus
```

### Redis direct access

```bash
docker exec -it cloudcampus-redis redis-cli -a cloudcampus_dev
# Flush all caches:
docker exec cloudcampus-redis redis-cli -a cloudcampus_dev FLUSHALL
```

---

## 4. DSEP Public Pages (no login)

| Page | URL |
|------|-----|
| Interactive Demo | http://localhost:5173/demo |
| Investor Room (Series A) | http://localhost:5173/investor/CC-SEED-A1 |

### Super Admin Experience Console

Login as `superadmin`, then: http://localhost:5173/super-admin/experience

| Tab | Content |
|-----|---------|
| Content Blocks | 62 blocks — search, edit JSON, publish |
| Demo Scenarios | 3 scenarios — CBSE Urban, ICSE Boarding, IB International |
| Investor Rooms | CC-SEED-A1 — Series A Data Room with 6 sections |

> **Demo page note:** Clicking "Open CloudCampus Demo" after a demo starts leads to `/demo/login?token=...` which has no route yet (Phase 5). The credential reveal screen works — use `superadmin` credentials to explore a real instance instead.

---

## 5. Demo Tenant — JNV Lucknow

Fully seeded by Flyway migrations V57 (staff-user links) and V58 (complete school data).

| Field | Value |
|-------|-------|
| Tenant code | `jnv-lucknow` |
| Tenant UUID | `804d7650-c915-4236-8431-2d4aef5cd102` |
| School name | Jawahar Navodaya Vidyalaya Lucknow |
| School UUID | `9786d685-d4a8-4092-9d1f-8558632d7b32` |
| Academic Year | 2026-27 — `73f7aff8-dd77-44f3-8244-f4cc691f8b8a` |
| Classes | VI–XII (7 classes × 2 sections = 14 sections) |
| Students | 12 seeded |
| Staff | 10 total |

---

## 6. Key UUIDs

### Classes

| Class | UUID |
|-------|------|
| VI | `c0000006-0000-0000-0000-000000000001` |
| VII | `c0000007-0000-0000-0000-000000000001` |
| VIII | `c0000008-0000-0000-0000-000000000001` |
| IX | `c0000009-0000-0000-0000-000000000001` |
| X | `c0000010-0000-0000-0000-000000000001` |
| XI | `c0000011-0000-0000-0000-000000000001` |
| XII | `c0000012-0000-0000-0000-000000000001` |

Sections follow pattern: class UUID with `a` or `b` suffix.
Example: X-A = `c0000010-0000-0000-0000-00000000000a`

### Subjects

| Subject | UUID |
|---------|------|
| Mathematics | `5b000001-0000-0000-0000-000000000001` |
| Physics | `5b000002-0000-0000-0000-000000000001` |
| Chemistry | `5b000003-0000-0000-0000-000000000001` |
| Biology | `5b000004-0000-0000-0000-000000000001` |
| English | `5b000005-0000-0000-0000-000000000001` |
| Hindi | `5b000006-0000-0000-0000-000000000001` |
| Social Science | `5b000007-0000-0000-0000-000000000001` |
| Computer Science | `5b000008-0000-0000-0000-000000000001` |
| Sanskrit | `5b000009-0000-0000-0000-000000000001` |
| Physical Education | `5b000010-0000-0000-0000-000000000001` |

### Staff

| Name | Role | UUID |
|------|------|------|
| Rajesh Kumar Sharma (`teacher1`) | TEACHER — Maths | `073e320b-ad40-4d35-a971-3bd886a64aa0` |
| School Admin (`schooladmin`) | ADMIN_STAFF | `4719cb1d-94c3-41ba-81b0-dd8a92b59e67` |
| Suresh Kumar Verma | PRINCIPAL | `5f000001-0000-0000-0000-000000000001` |
| Sunita Devi Mishra | VICE_PRINCIPAL | `5f000002-0000-0000-0000-000000000001` |
| Anita Kumari Singh | TEACHER — Biology | `5f000003-0000-0000-0000-000000000001` |
| Robert Paul Thomas | TEACHER — English | `5f000004-0000-0000-0000-000000000001` |
| Pradeep Kumar Tiwari | TEACHER — Physics | `5f000005-0000-0000-0000-000000000001` |
| Kavita Rani Yadav | TEACHER — Hindi | `5f000006-0000-0000-0000-000000000001` |
| Manoj Kumar Bajpai | TEACHER — PE | `5f000007-0000-0000-0000-000000000001` |
| Dinesh Kumar Verma | ACCOUNTANT | `5f000008-0000-0000-0000-000000000001` |

### Students (Class X-A unless noted)

| Name | Section | UUID |
|------|---------|------|
| Arjun Sharma (`student1`) | X-A | `7d000001-0000-0000-0000-000000000001` |
| Priya Gupta | X-A | `7d000002-0000-0000-0000-000000000001` |
| Rahul Kumar Singh | X-A | `7d000003-0000-0000-0000-000000000001` |
| Neha Mishra | X-A | `7d000004-0000-0000-0000-000000000001` |
| Vikram Patel | X-A | `7d000005-0000-0000-0000-000000000001` |
| Pooja Rani Verma | X-B | `7d000006-0000-0000-0000-000000000001` |
| Rohan Agarwal | X-B | `7d000007-0000-0000-0000-000000000001` |
| Sneha Pandey | X-B | `7d000008-0000-0000-0000-000000000001` |
| Aditya Jha | IX-A | `7d000009-0000-0000-0000-000000000001` |
| Ritu Srivastava | IX-A | `7d000010-0000-0000-0000-000000000001` |
| Deepak Narayan | XII-A | `7d000011-0000-0000-0000-000000000001` |
| Meena Laxmi | XII-A | `7d000012-0000-0000-0000-000000000001` |

### Fee Structures (Class X)

| Item | UUID |
|------|------|
| Tuition ₹12,000 | `fe000001-0000-0000-0000-000000000001` |
| Examination ₹1,500 | `fe000002-0000-0000-0000-000000000001` |
| Library ₹500 | `fe000003-0000-0000-0000-000000000001` |
| Sports ₹750 | `fe000004-0000-0000-0000-000000000001` |

### Exam Records

| Item | UUID |
|------|------|
| Mid-Term April 2026 | `ex000001-0000-0000-0000-000000000001` |
| Maths exam paper (X-A) | `es000001-0000-0000-0000-000000000001` |
| English exam paper (X-A) | `es000002-0000-0000-0000-000000000001` |
| Physics exam paper (X-A) | `es000003-0000-0000-0000-000000000001` |
| Social Science exam paper | `es000004-0000-0000-0000-000000000001` |

---

## 7. Student1 Demo Data (Arjun Sharma, Class X-A)

| Data type | Detail |
|-----------|--------|
| Attendance | 5 sessions (7–14 Apr): 4 PRESENT, 1 ABSENT (80%) |
| Fees | Tuition PAID ₹12,000 · Exam PENDING ₹1,500 · Library PAID ₹500 · Sports OVERDUE ₹750 |
| Marks | Maths 78 · English 85 · Physics 71 · SST 88 (avg 80.5/100) |
| Homework | 3 published assignments (Maths, English, Physics) |
| Notices | 5 school notices visible |
| Timetable | Maths P1 Mon–Fri · English P2 Mon/Wed · Physics P2 Tue/Thu |
| Parent link | `parent1` linked as GUARDIAN |

---

## 8. Key API Endpoints

Use the JWT from `/v1/auth/login` as `Authorization: Bearer <token>`.

### School Admin (`X-Tenant-Id: jnv-lucknow`)

```
GET  /v1/school-admin/schools/{schoolId}/dashboard
GET  /v1/school-admin/schools/{schoolId}/academic-years
GET  /v1/school-admin/academic-years/{academicYearId}/classes
GET  /v1/school-admin/classes/{classId}/sections
GET  /v1/school-admin/schools/{schoolId}/subjects
GET  /v1/school-admin/schools/{schoolId}/staff
GET  /v1/school-admin/schools/{schoolId}/students
GET  /v1/school-admin/schools/{schoolId}/exams
GET  /v1/school-admin/schools/{schoolId}/fee-structures
GET  /v1/school-admin/schools/{schoolId}/notices
```

### Teacher (`X-Tenant-Id: jnv-lucknow`)

```
GET  /v1/teacher/dashboard
GET  /v1/teacher/timetable
POST /v1/teacher/attendance/sessions
POST /v1/teacher/attendance/sessions/with-qr
GET  /v1/teacher/lesson-plans?from=2026-04-01&to=2026-04-30
POST /v1/teacher/online-classes
POST /v1/teacher/videos/initiate
```

### Student (`X-Tenant-Id: jnv-lucknow`)

```
GET  /v1/student/fees
GET  /v1/student/timetable
GET  /v1/student/attendance?from=2026-04-01&to=2026-04-30
GET  /v1/student/homework
GET  /v1/student/results
POST /v1/student/attendance/qr-mark
```

### Parent (`X-Tenant-Id: jnv-lucknow`)

```
GET  /v1/parent/children
GET  /v1/parent/children/{studentId}/attendance?from=...&to=...
GET  /v1/parent/children/{studentId}/fees
GET  /v1/parent/children/{studentId}/results
GET  /v1/parent/children/{studentId}/timetable
GET  /v1/parent/children/{studentId}/homework
```
> Use student UUID (`7d000001-...`) not the user ID for child endpoints.

### DSEP Public (no auth)

```
GET  /v1/experience/public/content-blocks?keys=hero.headline,stats.schools
GET  /v1/experience/public/demo-scenarios
POST /v1/experience/public/demo/start
GET  /v1/experience/public/investor/CC-SEED-A1
POST /v1/experience/public/investor/{roomCode}/access
POST /v1/experience/public/events
```

---

## 9. Environment Variables

| Variable | Default (dev) | Description |
|----------|---------------|-------------|
| `BOOTSTRAP_ADMIN_USERNAME` | `superadmin` | Super admin username at first boot |
| `BOOTSTRAP_ADMIN_PASSWORD` | `Admin@123` | Empty string = skip bootstrap |
| `JWT_SECRET` | `changeme-dev-secret-minimum-32-chars!!` | **Must change in prod** |
| `ENCRYPTION_SECRET` | `dev-encryption-key-must-be-at-least-32ch` | AES-256-GCM key for PII |
| `REDIS_PASSWORD` | `cloudcampus_dev` | Redis auth password |
| `MAIL_HOST` / `MAIL_PORT` | `localhost` / `1025` | SMTP (MailHog in dev) |
| `APP_AI_ENABLED` | `false` | `true` = real Claude/OpenAI; `false` = mock |
| `ANTHROPIC_API_KEY` | `dev-placeholder` | Required when AI enabled |
| `OPENAI_API_KEY` | `dev-placeholder` | Required when AI enabled |
| `FRONTEND_BASE_URL` | `http://localhost:5173` | Origin for QR deep-links |

---

## 10. Known Issues & Fixes

| Symptom | Cause | Fix |
|---------|-------|-----|
| `@Cacheable` fails after backend restart | Stale Redis entry with old schema | `redis-cli -a cloudcampus_dev FLUSHALL` |
| `Could not resolve subtype @class` in Redis | Cached `List<JavaRecord>` — records are `final`, no `@class` emitted | Remove `@Cacheable` from that method; cache flat DTOs only |
| V46 migration fails — `extension "vector" does not exist` | Wrong postgres image | Use `pgvector/pgvector:pg16`; `docker compose down && up -d` |
| QR scan shows "Invalid QR Code" | Token expired (5-min TTL) | Teacher generates fresh QR; verify `FRONTEND_BASE_URL` matches browser origin |
| AI returns mock response | `APP_AI_ENABLED=false` | Set `true` + real `ANTHROPIC_API_KEY` |
| Teacher endpoints return "Staff record not found" | `teacher1` not linked to staff table | V57 migration links them; restart backend after migration runs |
| `school-admin/lesson-plans` returns 500 | `school_id` missing from SCHOOL_ADMIN JWT | Fixed in `AuthServiceImpl` — `user_school_access` row required |
| `GET /v1/student/results` returns empty | Results seeded in `student_marks` not `exam_results` | V58 seeds both tables; restart backend |
| `GET /v1/student/notices` returns 500 | No student-facing notices endpoint | Use `/v1/school-admin/schools/{schoolId}/notices` as school admin |
| Demo "Open CloudCampus Demo" button goes nowhere | `/demo/login?token=...` route not built (Phase 5) | Use `superadmin` credentials to explore a real instance |

---

## 11. Postman Collection

Import both files from `docs/postman/`:

| File | Purpose |
|------|---------|
| `CloudCampus.postman_collection.json` | ~180 requests across 9 folders |
| `CloudCampus.local.postman_environment.json` | All JNV UUIDs pre-filled |

Login requests auto-save tokens via test scripts — run login first.


---

# Demo Credentials

_Former source: `backend/docs/DEMO_CREDENTIALS.md`._


Enterprise demo tenant auto-seeded on every fresh startup when `app.demo.enabled=true`.

---

## Tenant Details

| Field        | Value                              |
|--------------|------------------------------------|
| Tenant Code  | `greenwood-demo`                   |
| School       | Greenwood International School     |
| Location     | Banjara Hills, Hyderabad, Telangana|
| Plan         | Enterprise (all features enabled)  |

---

## Login Credentials

All demo accounts share the same password: **`Demo@1234`**

| Role         | Username          | Portal                         |
|--------------|-------------------|--------------------------------|
| School Admin | `gw.admin`        | `/school-admin/dashboard`      |
| Teacher 1    | `gw.teacher001`   | `/teacher/dashboard`           |
| Teacher 2    | `gw.teacher002`   | `/teacher/dashboard`           |
| Student      | `gw.student001`   | `/student/dashboard`           |
| Parent       | `gw.parent001`    | `/parent/dashboard`            |

Additional teachers: `gw.teacher001` to `gw.teacher040` (all use `Demo@1234`).

---

## Demo Data Summary

| Module           | Count                                         |
|------------------|-----------------------------------------------|
| Grades           | 15 (Nursery, LKG, UKG, Class 1–12)           |
| Sections         | 45 (3 per grade: A, B, C)                    |
| Students         | 1 125 total (25 per section)                  |
| Teachers/Staff   | 40 teachers + 1 admin                         |
| Subjects         | 10 (Math, Science, English, Hindi, SST, CS, Physics, Chemistry, Biology, PE) |
| Attendance       | 20 working days (90% present rate)            |
| Exams            | 2 (Unit Test 1, Mid-Term)                     |
| Lesson Plans     | 10 (PUBLISHED)                               |
| Homework         | 3 assignments                                 |
| School Notices   | 5 (published)                                 |
| Fee Structures   | 3 tiers (Pre-Primary, Primary, Secondary)     |

---

## Read-Only Demo Mode

The demo tenant is **read-only for write operations**.  POST / PUT / PATCH / DELETE
requests from a `greenwood-demo` JWT are rejected with HTTP 403:

```json
{
  "success": false,
  "error": {
    "code": "DEMO_READ_ONLY",
    "message": "This is a read-only demo environment. Write operations are disabled."
  }
}
```

Auth endpoints (`/v1/auth/**`) are always permitted so login/refresh work normally.

---

## Nightly Reset

`DemoResetScheduler` runs at **02:00 AM** server time.  It:

1. Deletes transient data: attendance, marks, exams, lesson plans, homework, notices
2. Preserves structural data: tenant, school, classes, sections, subjects, users
3. Re-seeds all transient data via `DemoDataSeeder`

Named demo students (`GW-0001` to `GW-0005`) are preserved across resets so
bookmarked student portal sessions remain valid.

---

## Development Setup

Enable the demo school in `application-dev.yml`:

```yaml
app:
  demo:
    enabled: true
```

On startup you will see:

```
DEMO: Seeding Greenwood International School enterprise demo data...
DEMO: Greenwood demo school seeded in 3241 ms.
```

On subsequent restarts (students already exist):

```
DEMO: Greenwood demo school already seeded — skipping.
```

To force a full re-seed, delete the students:

```sql
DELETE FROM students WHERE tenant_id = 'c0000000-0000-0000-0000-000000000001';
```

Then restart the backend.

---

## Known Stable UUIDs

Useful for Postman / integration tests:

| Resource         | UUID                                   |
|------------------|----------------------------------------|
| Tenant ID        | `c0000000-0000-0000-0000-000000000001` |
| School ID        | `c0000000-0000-0000-0000-000000000002` |
| Academic Year ID | `c0000000-0000-0000-0000-000000000003` |
| Admin User ID    | `c0000000-0000-0000-0000-000000000010` |
| Teacher 1 User   | `c0000000-0000-0000-0000-000000000011` |
| Student 1 User   | `c0000000-0000-0000-0000-000000000020` |
| Parent 1 User    | `c0000000-0000-0000-0000-000000000030` |


---

# Load & Stress Tests

_Former source: `infra/load-tests/README.md`._


k6-based load and stress test suite (CC-1703 / CC-1704).

## Prerequisites

```bash
brew install k6          # macOS
# or: https://k6.io/docs/getting-started/installation/
```

Ensure the target environment is running:

```bash
docker compose up -d     # local stack
# backend: mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

---

## Scripts

| Script | Purpose | VUs | Duration |
|--------|---------|-----|----------|
| `smoke.js` | Sanity-check all critical paths | 3 | 30 s |
| `load-auth.js` | Auth endpoint throughput | ramp → 50 | ~2 min |
| `load-reports.js` | Report aggregation under load | ramp → 20 | ~3 min |
| `stress.js` | Find the breaking point | ramp → 200 | ~6 min |

---

## Running

### Smoke test (run first)

```bash
k6 run infra/load-tests/smoke.js
```

### Auth load test

```bash
k6 run infra/load-tests/load-auth.js
```

### Reports load test

Requires school/year/exam UUIDs from your database:

```bash
k6 run \
  --env SCHOOL_ID=<uuid> \
  --env ACADEMIC_YEAR_ID=<uuid> \
  --env EXAM_ID=<uuid> \
  infra/load-tests/load-reports.js
```

### Stress test

```bash
k6 run infra/load-tests/stress.js
```

### Against staging

Pass `BASE_URL` to any script:

```bash
k6 run \
  --env BASE_URL=https://staging.cloudcampus.io \
  --env ADMIN_USERNAME=superadmin \
  --env ADMIN_PASSWORD=<secret> \
  infra/load-tests/smoke.js
```

---

## SLOs

| Metric | Target |
|--------|--------|
| p95 latency — auth | < 500 ms |
| p95 latency — reports | < 2 000 ms |
| p95 latency — stress | < 3 000 ms |
| Error rate (5xx) | < 1 % (load) / < 5 % (stress) |
| Rate-limit 429s | Excluded from error SLO — expected at high VU counts |

---

## Output interpretation

k6 prints a summary after each run. Key metrics:

```
http_req_duration ........: avg=142ms  min=11ms med=120ms  max=980ms  p(90)=310ms p(95)=450ms
http_req_failed ..........: 0.12%  ✓ 1488  ✗ 2
stress_rate_limited ......: 3.40%  (429s from API rate limiter — expected)
```

- `http_req_failed` — network-level failures + 4xx/5xx (except where explicitly excluded)
- `stress_rate_limited` — 429 responses tracked separately in stress test
- Custom `*_duration` trends show latency for specific operation types


---

# Frontend Notes

_Former source: `frontend/README.md`._


This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
