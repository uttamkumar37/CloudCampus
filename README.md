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
├── docs/             # Architecture specs and upgrade plans
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
| Database | PostgreSQL 16 + pgvector · Flyway migrations V1–V46 |
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

> **As of 2026-05-16 (E88 complete) — ~165 of 193 tasks done (85%)**

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

### DevOps / Observability

| Area | Status |
|------|--------|
| Docker Compose (local stack — pgvector image) | ✅ Done |
| Prometheus scraping + alert rules | ✅ Done |
| Grafana dashboards (9 panels) | ✅ Done |
| Staging / production profiles | ✅ Done |
| pg_dump backup sidecar + disaster recovery drill script | ✅ Done |
| CI/CD pipeline (4-job GitHub Actions: backend / frontend / mobile / docker) | ✅ Done |

---

## Remaining Work (~28 tasks, 15%)

| Area | Pending |
|------|---------|
| Mobile QR scan screen | Not built (CC-0802 mobile integration) |
| Teacher mobile attendance QR display | Not built |
| AI Copilot school-admin UI | Not built (CC-1603) |
| Student promotion workflow UI (mobile) | Not built |
| Razorpay online payment flow | Not built (CC-0903) |
| Website builder | Not started (CC-2001 — Phase 3) |
| Demo tenant auto-reset | Not built (EUP-100) |
| Log aggregation (Loki/Promtail) | Not configured (Phase 2 observability) |
| Distributed tracing (Tempo full setup) | Not configured (Phase 2 observability) |
| Virtual thread / ScopedValue migration | Not started (EUP-007) |

---

## Postman Collection

A comprehensive Postman collection is provided in `docs/postman/`:

| File | Description |
|------|-------------|
| `CloudCampus.postman_collection.json` | 8 folders, ~80 requests covering all roles |
| `CloudCampus.local.postman_environment.json` | 73 pre-filled variables (JNV Lucknow UUIDs, tokens) |

Login requests auto-save JWT tokens to environment variables. Import both files, run a login request, then execute any request in that role's folder.

See [docs/LOGIN_CREDENTIALS.md](docs/LOGIN_CREDENTIALS.md) for all credentials and verified endpoint URLs.

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
