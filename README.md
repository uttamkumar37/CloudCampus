# CloudCampus

Enterprise Digital School SaaS — multi-tenant, schema-based architecture.

**Stack:** Java 21 · Spring Boot 3.4.5 · React 18 · Expo (React Native) · PostgreSQL 16 · Redis 7 · MinIO · Prometheus · Grafana

---

## Project Layout

```
CloudCampus/
├── backend/          # Spring Boot API (Java 21)
├── frontend/         # React 18 + TypeScript web app (Vite)
├── mobile/           # Expo / React Native mobile app (SDK 54)
├── infra/
│   ├── prometheus/   # Prometheus config + alert rules
│   └── grafana/      # Grafana provisioning + dashboards
├── docs/             # Architecture specs and upgrade plans
└── docker-compose.yml
```

---

## Architecture

CloudCampus uses a **multi-tenant, schema-based** model. Every tenant gets an isolated PostgreSQL schema. A `RequestContext` (ThreadLocal) carries `tenantId`, `schoolId`, and `userId` through every request.

```
Browser / Mobile
      │
      ▼
  Load Balancer (HTTPS)
      │
      ▼
  Spring Boot API  ──► PostgreSQL 16 (per-tenant schema)
      │              ──► Redis 7     (sessions / cache)
      │              ──► MinIO       (file storage)
      │              ──► SMTP / SES  (email)
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
| Database | PostgreSQL 16 · Flyway migrations |
| Cache / Session | Redis 7 |
| Object Storage | MinIO (S3-compatible) |
| Auth | JWT (HS256) · Spring Security |
| Web App | React 18 · TypeScript · Vite · TanStack Query |
| Mobile | Expo SDK 54 · React Native 0.81.5 (New Architecture) |
| Offline sync | WatermelonDB + custom sync queue |
| Push notifications | Expo Notifications + FCM / APNs |
| Observability | Micrometer · Prometheus · Grafana |
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
docker compose up -d          # PostgreSQL, Redis, MinIO, MailHog, Prometheus, Grafana
```

| Service | URL |
|---------|-----|
| API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| MailHog | http://localhost:8025 |
| MinIO console | http://localhost:9001 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3100 (admin / admin) |

### 2 — Run the backend

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

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
| `dev` | H2 in-memory (PostgreSQL mode) | Local development |
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

---

## Feature Status

> **As of 2026-05-14 (E46 complete) — ~112 of 193 tasks done (58%)**

### Backend (Java / Spring Boot)

| Area | Status |
|------|--------|
| Multi-tenant schema resolver | ✅ Done |
| JWT authentication filter | ✅ Done |
| Login / logout / refresh token API | ✅ Done |
| Change password (`POST /v1/auth/change-password`) | ✅ Done |
| User management (CRUD + roles) | ✅ Done |
| Tenant management (super-admin) | ✅ Done |
| Flyway migrations V1–V33 | ✅ Done |
| Security headers (7 OWASP) | ✅ Done |
| Structured JSON logging (Logback) | ✅ Done |
| Prometheus + Micrometer metrics | ✅ Done |
| Device token registration (push) | ✅ Done |
| Staging + production Spring profiles | ✅ Done |
| Academic year / class / section / subject management | ✅ Done |
| Student admission + profile + listing APIs | ✅ Done |
| Staff profiles + staff attendance + leave management | ✅ Done |
| Attendance sessions + bulk mark (school-admin + teacher) | ✅ Done |
| Student attendance self-view (`GET /v1/student/attendance`) | ✅ Done |
| Fee structure + collection + receipts | ✅ Done |
| Student fee self-view + parent child fee records | ✅ Done |
| Timetable management (weekly grid, conflict detection) | ✅ Done |
| Homework management (DRAFT→PUBLISHED→CLOSED lifecycle) | ✅ Done |
| Assignment engine (submissions + grading) | ✅ Done |
| Examination system (exams, papers, marks entry, results) | ✅ Done |
| SMS / email / push / WhatsApp notification services | ✅ Done |
| Parent portal APIs (children list + per-child detail) | ✅ Done |
| Teacher dashboard + school-admin live dashboard | ✅ Done |
| Rate limiting + audit logging | ✅ Done |
| Tenant isolation (Hibernate filters + Testcontainers tests) | ✅ Done |

### Web Frontend (React / TypeScript)

| Area | Status |
|------|--------|
| Auth (login · logout · token refresh · change password) | ✅ Done |
| Super-admin tenant management UI | ✅ Done |
| School-admin dashboard (live stats), academic management | ✅ Done |
| Student management (admit / profile / list) | ✅ Done |
| Staff management (list / create / profile) | ✅ Done |
| Attendance management (session list / create / mark) | ✅ Done |
| Fee management (structures / collection / receipts) | ✅ Done |
| Timetable, homework, assignment, exam, marks pages | ✅ Done |
| Communication pages (notifications / WhatsApp) | ✅ Done |
| Student portal (dashboard / homework / assignments / timetable / notices / results / fees / attendance) | ✅ Done |
| Teacher portal (dashboard / timetable / homework / assignments / attendance / notices) | ✅ Done |
| Parent portal (dashboard / child detail with 5 tabs: attendance / homework / results / timetable / fees) | ✅ Done |
| Change Password page (all 5 portal layouts) | ✅ Done |
| Role-based protected routes (Student / Teacher / Parent / SchoolAdmin / SuperAdmin) | ✅ Done |
| Feature-flag-driven sidebar navigation | ✅ Done |

### Mobile (Expo / React Native)

| Area | Status |
|------|--------|
| Navigation scaffold (Expo Router) | ✅ Done |
| Secure token storage (SecureStore + MMKV) | ✅ Done |
| Proactive JWT refresh | ✅ Done |
| Offline-first attendance (WatermelonDB) | ✅ Done |
| Push notifications (FCM / APNs) | ✅ Done |
| Role-aware dashboard (Student / Teacher / Parent sections) | ✅ Done |
| Student screens: assignments, results, fees, attendance | ✅ Done |
| Change password screen + forced-change navigation guard | ✅ Done |

### DevOps / Observability

| Area | Status |
|------|--------|
| Docker Compose (local stack) | ✅ Done |
| Prometheus scraping + alert rules | ✅ Done |
| Grafana dashboards (9 panels) | ✅ Done |
| Staging / production profiles | ✅ Done |
| pg_dump backup sidecar | ⏳ Pending |
| CI/CD pipeline | ⏳ Pending |

---

## API Reference

Swagger UI is available at **`/swagger-ui.html`** in `dev` and `staging` profiles.

Base path: `/v1`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/v1/auth/login` | Obtain access + refresh tokens |
| `POST` | `/v1/auth/refresh` | Rotate refresh token |
| `POST` | `/v1/auth/logout` | Revoke refresh token |
| `GET` | `/v1/tenants` | List all tenants (super-admin) |
| `POST` | `/v1/tenants` | Create tenant (super-admin) |
| `GET` | `/v1/users` | List users in current tenant |
| `POST` | `/v1/devices/register` | Register push notification token |
| `GET` | `/actuator/health` | Health check |
| `GET` | `/actuator/prometheus` | Prometheus metrics endpoint |

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
- Actuator in `prod` bound to internal port 8081 (not reachable from public LB).
- Seven OWASP security headers injected on every response.
- `ddl-auto: validate` in staging/prod — Hibernate cannot alter the schema.
- HTTPS enforced via `forward-headers-strategy: native` (LB offloads TLS).

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
