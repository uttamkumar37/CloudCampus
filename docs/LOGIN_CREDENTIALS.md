# CloudCampus — Login Credentials & Local Dev Guide

> **Dev reference only.** Never commit real production secrets.

---

## Quick Start

```bash
# 1. Start infrastructure (pgvector/pgvector:pg16, Redis, MinIO, MailHog, Prometheus, Grafana, Tempo, RabbitMQ)
docker compose up -d

# NOTE: postgres image is pgvector/pgvector:pg16 (NOT postgres:16-alpine).
# If upgrading from the old image: docker compose down && docker compose up -d

# 2. Run the backend (dev profile — PostgreSQL, Flyway auto-applies V1–V46)
#    AI runs in mock mode by default (no API keys needed, no external calls)
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# 3. Run the web frontend
cd frontend
npm install && npm run dev        # http://localhost:5173

# 4. (Optional) Run the mobile app
cd mobile
npm install --legacy-peer-deps
npx expo start
```

> **First boot:** `superadmin` is bootstrapped automatically with `BOOTSTRAP_ADMIN_PASSWORD`.
> The `dev` profile defaults to `Admin@123` via `application-dev.yml`.

---

## Login API

```
POST /v1/auth/login
Content-Type: application/json
X-Tenant-Id: jnv-lucknow          ← omit for SUPER_ADMIN only

{
  "username": "<username>",
  "password": "<password>"
}
```

Response includes `data.accessToken` and `data.refreshToken`.

---

## Demo Tenant — JNV Lucknow (seeded via V42 migration)

Flyway migration **V42** seeds a complete demo school based on Jawahar Navodaya
Vidyalaya Lucknow. All data is idempotent — safe to re-run.

| Field | Value |
|-------|-------|
| Tenant slug | `jnv-lucknow` |
| Tenant UUID | `aaaaaaaa-0000-0000-0000-000000000001` |
| School name | Jawahar Navodaya Vidyalaya Lucknow |
| School UUID | `bbbbbbbb-0000-0000-0000-000000000001` |
| Academic year | 2025-26 (`cccccccc-0000-0000-0000-000000000001`) |
| Classes | 6, 7, 8, 9, 10, 11, 12 (2 sections each: A & B) |
| Students | 40 per section (27 boys + 13 girls) = **560 total** |
| Staff | 23 (Principal, Vice-Principal, 20 teachers, 1 lab assistant) |
| Demo data | April 2026 — attendance, fee records, notices, homework, exams |

---

## All Login Credentials

All accounts use password: **`Admin@123`**

### Super Admin

| Field | Value |
|-------|-------|
| Username | `superadmin` |
| Password | `Admin@123` |
| Role | `SUPER_ADMIN` |
| Header | _Do NOT send `X-Tenant-Id`_ |

### School Admin

| Field | Value |
|-------|-------|
| Username | `schooladmin` |
| Password | `Admin@123` |
| Role | `SCHOOL_ADMIN` |
| Header | `X-Tenant-Id: jnv-lucknow` |

### Teacher

| Field | Value |
|-------|-------|
| Username | `teacher1` |
| Password | `Admin@123` |
| Role | `TEACHER` |
| Header | `X-Tenant-Id: jnv-lucknow` |
| Staff ID | `00000000-2222-2222-2222-000000000001` |

### Student

| Field | Value |
|-------|-------|
| Username | `student1` |
| Password | `Admin@123` |
| Role | `STUDENT` |
| Header | `X-Tenant-Id: jnv-lucknow` |
| Student ID | `77777777-0000-0000-0000-000000000001` (Class 10-A) |

### Parent

| Field | Value |
|-------|-------|
| Username | `parent1` |
| Password | `Admin@123` |
| Role | `PARENT` |
| Header | `X-Tenant-Id: jnv-lucknow` |
| Linked child | `student1` (student ID `77777777-0000-0000-0000-000000000001`) |

---

## Postman Collection

Import both files from `docs/postman/` into Postman:

| File | Purpose |
|------|---------|
| `CloudCampus.postman_collection.json` | All API requests (8 folders, ~80 requests) |
| `CloudCampus.local.postman_environment.json` | 73 variables — all JNV UUIDs pre-filled |

**Login requests auto-save tokens** via test scripts:
- `superadmin` login → saves `{{superToken}}` and `{{authToken}}`
- `schooladmin` login → saves `{{schoolAdminToken}}` and `{{authToken}}`
- `teacher1` login → saves `{{teacherToken}}` and `{{authToken}}`
- `student1` login → saves `{{studentToken}}` and `{{authToken}}`
- `parent1` login → saves `{{parentToken}}` and `{{authToken}}`

Run the relevant login request first, then all other requests in that folder
will use the correct token automatically.

---

## Key UUIDs (JNV Lucknow)

| Resource | Name | UUID |
|----------|------|------|
| Tenant | jnv-lucknow | `aaaaaaaa-0000-0000-0000-000000000001` |
| School | JNV Lucknow | `bbbbbbbb-0000-0000-0000-000000000001` |
| Academic Year | 2025-26 | `cccccccc-0000-0000-0000-000000000001` |
| Class 6 | Class VI | `aa060000-0000-0000-0000-000000000001` |
| Class 7 | Class VII | `aa070000-0000-0000-0000-000000000001` |
| Class 8 | Class VIII | `aa080000-0000-0000-0000-000000000001` |
| Class 9 | Class IX | `aa090000-0000-0000-0000-000000000001` |
| Class 10 | Class X | `aa100000-0000-0000-0000-000000000001` |
| Class 11 | Class XI | `aa110000-0000-0000-0000-000000000001` |
| Class 12 | Class XII | `aa120000-0000-0000-0000-000000000001` |
| Section 6-A | Class VI Section A | `ab060000-0000-0000-0000-000000000001` |
| Section 6-B | Class VI Section B | `ab060000-0000-0000-0000-000000000002` |
| Section 10-A | Class X Section A | `ab100000-0000-0000-0000-000000000001` |
| Section 12-A | Class XII Section A | `ab120000-0000-0000-0000-000000000001` |
| Staff (teacher1) | Demo Teacher | `00000000-2222-2222-2222-000000000001` |
| Student (student1) | Demo Student (10-A) | `77777777-0000-0000-0000-000000000001` |

---

## Verified Endpoint Summary

All endpoints below are smoke-tested and confirmed working after the latest fixes.

### School Admin (`X-Tenant-Id: jnv-lucknow`)

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/v1/school-admin/schools/{schoolId}/dashboard` | Live stats |
| `GET` | `/v1/school-admin/schools/{schoolId}/settings` | School config |
| `GET` | `/v1/school-admin/schools/{schoolId}/academic-years` | Returns 1 |
| `GET` | `/v1/school-admin/academic-years/{academicYearId}/classes` | Returns 7 |
| `GET` | `/v1/school-admin/classes/{classId}/sections` | Returns 2 |
| `GET` | `/v1/school-admin/schools/{schoolId}/subjects` | Returns 11 |
| `GET` | `/v1/school-admin/schools/{schoolId}/departments` | Returns 6 |
| `GET` | `/v1/school-admin/schools/{schoolId}/staff` | Returns 23 |
| `GET` | `/v1/school-admin/schools/{schoolId}/students` | Returns 561 |
| `GET` | `/v1/school-admin/schools/{schoolId}/notices` | Returns 9 |
| `GET` | `/v1/school-admin/schools/{schoolId}/exams` | Returns 4 |
| `GET` | `/v1/school-admin/schools/{schoolId}/fee-structures` | Returns 14 |
| `GET` | `/v1/school-admin/schools/{schoolId}/attendance/sessions?date=2026-04-07` | 14 sessions |
| `GET` | `/v1/school-admin/classes/{classId}/attendance/sessions?from=...&to=...` | 50 sessions |
| `GET` | `/v1/school-admin/classes/{classId}/attendance/report?from=...&to=...` | 80 entries |
| `GET` | `/v1/school-admin/schools/{schoolId}/timetable?academicYearId=...&classId=...&sectionId=...` | 3 params required |

### Teacher (`X-Tenant-Id: jnv-lucknow`)

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/v1/teacher/dashboard` | Teacher stats |
| `GET` | `/v1/teacher/timetable` | 12 slots |
| `GET` | `/v1/teacher/attendance/students?classId=...&sectionId=...` | Students for marking |
| `POST` | `/v1/teacher/attendance/sessions` | Create session + bulk mark |
| `POST` | `/v1/teacher/attendance/sessions/with-qr` | Create session + generate QR in one call (CC-0802) |
| `POST` | `/v1/teacher/attendance/sessions/{id}/qr` | Refresh QR for existing session |
| `GET` | `/v1/teacher/homework` | Homework list |
| `GET` | `/v1/teacher/assignments` | Assignment list |
| `GET` | `/v1/teacher/leave` | Leave requests |

### Student (`X-Tenant-Id: jnv-lucknow`)

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/v1/student/fees` | Fee records |
| `GET` | `/v1/student/timetable` | 36 slots |
| `GET` | `/v1/student/attendance?from=...&to=...` | Date range required |
| `POST` | `/v1/student/attendance/qr-mark` | Self-mark PRESENT via QR token `{ "token": "..." }` (CC-0802) |
| `GET` | `/v1/student/homework` | Homework |
| `GET` | `/v1/student/results` | Exam results |

### Parent (`X-Tenant-Id: jnv-lucknow`)

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/v1/parent/children` | Linked children |
| `GET` | `/v1/parent/children/{studentId}/attendance?from=...&to=...` | Use student UUID, not user UUID |
| `GET` | `/v1/parent/children/{studentId}/fees` | Fee records |
| `GET` | `/v1/parent/children/{studentId}/timetable` | Timetable |
| `GET` | `/v1/parent/children/{studentId}/results` | Results |
| `GET` | `/v1/parent/children/{studentId}/homework` | Homework |

> **Important:** Parent child endpoints use the **student record ID** (e.g. `77777777-0000-0000-0000-000000000001`),
> not the user ID (`00000000-4444-4444-4444-000000000001`).

---

## Infrastructure (Local/Docker)

### PostgreSQL

| Field | Value |
|-------|-------|
| Host | `localhost:5432` |
| Database | `cloudcampus` |
| Username | `cloudcampus` |
| Password | `cloudcampus_dev` |

```bash
PGPASSWORD=cloudcampus_dev psql -U cloudcampus -d cloudcampus -h localhost
```

### Redis

| Field | Value |
|-------|-------|
| Host | `localhost:6379` |
| Auth | None (dev only) |

```bash
# Flush all caches (useful after config changes)
redis-cli FLUSHALL
```

> **Cache note:** After a backend restart that changes `CacheConfig`, always run
> `redis-cli FLUSHALL` before testing `@Cacheable` endpoints to avoid stale
> serialization errors from the old format.

---

## Local Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Backend API | http://localhost:8080 | — |
| Swagger UI | http://localhost:8080/swagger-ui.html | dev profile only |
| Frontend | http://localhost:5173 | — |
| MailHog | http://localhost:8025 | — |
| MinIO | http://localhost:9001 | minioadmin / minioadmin |
| Prometheus | http://localhost:9090 | — |
| Grafana | http://localhost:3100 | admin / admin |
| Tempo | http://localhost:3200 | — |
| RabbitMQ management | http://localhost:15672 | cloudcampus / cloudcampus_dev |

---

## Environment Variables Reference

| Variable | Default (dev) | Description |
|----------|---------------|-------------|
| `BOOTSTRAP_ADMIN_USERNAME` | `superadmin` | Super admin username |
| `BOOTSTRAP_ADMIN_PASSWORD` | `Admin@123` | Set at first boot; empty = skip bootstrap |
| `JWT_SECRET` | `changeme-dev-secret-minimum-32-chars!!` | Change in production |
| `ENCRYPTION_SECRET` | `dev-encryption-key-must-be-at-least-32ch` | AES-256-GCM key for PII fields |
| `DATABASE_URL` | set in `application-dev.yml` | PostgreSQL JDBC URL |
| `REDIS_HOST` / `REDIS_PORT` | `localhost` / `6379` | Redis connection |
| `MAIL_HOST` / `MAIL_PORT` | `localhost` / `1025` (MailHog) | SMTP server |
| `APP_FIREBASE_ENABLED` | `false` | Enable Firebase push notifications |
| `APP_AI_ENABLED` | `false` | Enable real AI (Anthropic + OpenAI); `false` = mock mode |
| `ANTHROPIC_API_KEY` | `dev-placeholder` | Claude API key (only needed when `APP_AI_ENABLED=true`) |
| `OPENAI_API_KEY` | `dev-placeholder` | OpenAI embeddings key (only needed when `APP_AI_ENABLED=true`) |
| `FRONTEND_BASE_URL` | `http://localhost:5173` | Origin for QR deep-links in `StudentQrScanPage` |

---

## Known Dev Behaviour

| Symptom | Cause | Fix |
|---------|-------|-----|
| Actuator `/health` shows `DOWN` | RabbitMQ not running in dev | Ignore — app works; start RabbitMQ Docker if needed |
| `@Cacheable` endpoints fail after restart | Stale Redis data with old serializer format | Run `redis-cli FLUSHALL` then retry |
| Parent child endpoints return "not linked" | Using user ID instead of student ID | Use student record UUID (e.g. `77777777-...`) |
| Timetable returns empty | No timetable slots seeded in V42 | Create slots via `POST /v1/school-admin/schools/{id}/timetable` |
| V46 migration fails — `extension "vector" does not exist` | Using `postgres:16-alpine` image which lacks pgvector | Change docker-compose to `pgvector/pgvector:pg16`; run `docker compose down && docker compose up -d` |
| QR scan page shows "Invalid QR Code" | Token expired (5-min TTL) or malformed URL | Teacher must generate a fresh QR; ensure `FRONTEND_BASE_URL` matches the actual frontend origin |
| AI render playground returns mock response | `APP_AI_ENABLED=false` (default) → MockChatModel active | Set `APP_AI_ENABLED=true` + provide real `ANTHROPIC_API_KEY` to call real AI |
