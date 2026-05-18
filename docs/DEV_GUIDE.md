# CloudCampus — Developer Guide

**Version:** 2.0 | **Updated:** 2026-05-18
> Local development reference — credentials, UUIDs, commands, known issues.

---

## 1. Quick Start

```bash
# 1. Start all infrastructure
docker compose up -d
# NOTE: postgres image MUST be pgvector/pgvector:pg16 (not postgres:16-alpine)
# Flyway V46 requires pgvector. If wrong image: docker compose down && docker compose up -d

# 2. Backend (Flyway auto-applies V1–V74 on first boot)
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
