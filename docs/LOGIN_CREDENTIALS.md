# CloudCampus — Login Credentials & Local Dev Guide

> **Dev reference only.** Never commit real production secrets.

---

## Quick Start

```bash
# 1. Start infrastructure (pgvector/pgvector:pg16, Redis, MinIO, MailHog, Prometheus, Grafana, Tempo)
docker compose up -d

# NOTE: postgres image must be pgvector/pgvector:pg16 (NOT postgres:16-alpine).
# If upgrading: docker compose down && docker compose up -d

# 2. Run the backend (dev profile — Flyway auto-applies V1–V58)
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

> **First boot:** `superadmin` is bootstrapped automatically from `BOOTSTRAP_ADMIN_PASSWORD`.
> The `dev` profile defaults to `Admin@123` via `application-dev.yml`.
>
> **Seed data:** V57 links demo users to staff records. V58 seeds all JNV Lucknow
> demo data (classes, students, timetable, attendance, exams, fees, notices, homework).

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

Response includes `data.accessToken`, `data.refreshToken`, `data.role`, and `data.features`.

---

## Demo Tenant — JNV Lucknow

Fully seeded by Flyway migrations V57 (staff-user links) and V58 (complete school data).

| Field | Value |
|-------|-------|
| Tenant code | `jnv-lucknow` |
| Tenant UUID | `804d7650-c915-4236-8431-2d4aef5cd102` |
| School name | Jawahar Navodaya Vidyalaya Lucknow |
| School UUID | `9786d685-d4a8-4092-9d1f-8558632d7b32` |
| Academic year | 2026-27 (`73f7aff8-dd77-44f3-8244-f4cc691f8b8a`) |
| Classes | VI–XII (7 classes × 2 sections A & B = 14 sections) |
| Students | 12 seeded (5 in X-A, 3 in X-B, 2 in IX-A, 2 in XII-A) |
| Staff | 10 total (2 from V57 + 8 from V58 incl. Principal, VP) |
| Demo data | April 2026 — attendance, fees, homework, exam marks, notices |

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
| School UUID | `9786d685-d4a8-4092-9d1f-8558632d7b32` |

### Teacher

| Field | Value |
|-------|-------|
| Username | `teacher1` |
| Password | `Admin@123` |
| Role | `TEACHER` |
| Header | `X-Tenant-Id: jnv-lucknow` |
| Staff UUID | `073e320b-ad40-4d35-a971-3bd886a64aa0` |
| Name | Rajesh Kumar Sharma (Mathematics, Class X-A) |

### Student

| Field | Value |
|-------|-------|
| Username | `student1` |
| Password | `Admin@123` |
| Role | `STUDENT` |
| Header | `X-Tenant-Id: jnv-lucknow` |
| Student UUID | `7d000001-0000-0000-0000-000000000001` |
| Name | Arjun Sharma — Class X, Section A |

### Parent

| Field | Value |
|-------|-------|
| Username | `parent1` |
| Password | `Admin@123` |
| Role | `PARENT` |
| Header | `X-Tenant-Id: jnv-lucknow` |
| Linked child | Arjun Sharma (`7d000001-0000-0000-0000-000000000001`) |

---

## Postman Collection

Import both files from `docs/postman/` into Postman:

| File | Purpose |
|------|---------|
| `CloudCampus.postman_collection.json` | All API requests (~180 requests, 9 folders) |
| `CloudCampus.local.postman_environment.json` | Environment variables — all JNV UUIDs pre-filled |

**Login requests auto-save tokens** via test scripts — run login first, then all other requests use the correct token automatically.

---

## Key UUIDs (JNV Lucknow — V58 seed)

### Tenant & School

| Resource | UUID |
|----------|------|
| Tenant `jnv-lucknow` | `804d7650-c915-4236-8431-2d4aef5cd102` |
| School (JNV Lucknow) | `9786d685-d4a8-4092-9d1f-8558632d7b32` |
| Academic Year 2026-27 | `73f7aff8-dd77-44f3-8244-f4cc691f8b8a` |

### Classes

| Class | UUID |
|-------|------|
| Class VI | `c0000006-0000-0000-0000-000000000001` |
| Class VII | `c0000007-0000-0000-0000-000000000001` |
| Class VIII | `c0000008-0000-0000-0000-000000000001` |
| Class IX | `c0000009-0000-0000-0000-000000000001` |
| Class X | `c0000010-0000-0000-0000-000000000001` |
| Class XI | `c0000011-0000-0000-0000-000000000001` |
| Class XII | `c0000012-0000-0000-0000-000000000001` |

### Sections (pattern: class UUID with `a` or `b` suffix)

| Section | UUID |
|---------|------|
| VI-A | `c0000006-0000-0000-0000-00000000000a` |
| VI-B | `c0000006-0000-0000-0000-00000000000b` |
| IX-A | `c0000009-0000-0000-0000-00000000000a` |
| **X-A** (student1's section) | `c0000010-0000-0000-0000-00000000000a` |
| X-B | `c0000010-0000-0000-0000-00000000000b` |
| XII-A | `c0000012-0000-0000-0000-00000000000a` |

### Subjects

| Subject | Code | UUID |
|---------|------|------|
| Mathematics | MATH | `5b000001-0000-0000-0000-000000000001` |
| Physics | PHY | `5b000002-0000-0000-0000-000000000001` |
| Chemistry | CHEM | `5b000003-0000-0000-0000-000000000001` |
| Biology | BIO | `5b000004-0000-0000-0000-000000000001` |
| English | ENG | `5b000005-0000-0000-0000-000000000001` |
| Hindi | HIN | `5b000006-0000-0000-0000-000000000001` |
| Social Science | SST | `5b000007-0000-0000-0000-000000000001` |
| Computer Science | CS | `5b000008-0000-0000-0000-000000000001` |
| Sanskrit | SKT | `5b000009-0000-0000-0000-000000000001` |
| Physical Education | PE | `5b000010-0000-0000-0000-000000000001` |

### Staff

| Name | Role | UUID |
|------|------|------|
| Rajesh Kumar Sharma (`teacher1`) | TEACHER — Mathematics | `073e320b-ad40-4d35-a971-3bd886a64aa0` |
| School Admin (`schooladmin`) | ADMIN_STAFF | `4719cb1d-94c3-41ba-81b0-dd8a92b59e67` |
| Suresh Kumar Verma | PRINCIPAL | `5f000001-0000-0000-0000-000000000001` |
| Sunita Devi Mishra | VICE_PRINCIPAL | `5f000002-0000-0000-0000-000000000001` |
| Anita Kumari Singh | TEACHER — Biology | `5f000003-0000-0000-0000-000000000001` |
| Robert Paul Thomas | TEACHER — English | `5f000004-0000-0000-0000-000000000001` |
| Pradeep Kumar Tiwari | TEACHER — Physics | `5f000005-0000-0000-0000-000000000001` |
| Kavita Rani Yadav | TEACHER — Hindi | `5f000006-0000-0000-0000-000000000001` |
| Manoj Kumar Bajpai | TEACHER — Physical Education | `5f000007-0000-0000-0000-000000000001` |
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

### Fee Categories (auto-seeded by TenantBootstrapService)

| Category | UUID |
|----------|------|
| Tuition Fee | `46d7fb43-a4f6-4ce2-9057-3c02427ee85d` |
| Examination Fee | `d288e08c-a94e-49fc-8e32-78f2669593f8` |
| Library Fee | `c32cc264-6cca-4d22-a13e-07d15b4e5026` |
| Sports Fee | `efadfeac-84f2-4ea3-8c49-66a8e90c5761` |

### Fee Structures (Class X)

| Structure | UUID |
|-----------|------|
| Tuition ₹12,000 | `fe000001-0000-0000-0000-000000000001` |
| Examination ₹1,500 | `fe000002-0000-0000-0000-000000000001` |
| Library ₹500 | `fe000003-0000-0000-0000-000000000001` |
| Sports ₹750 | `fe000004-0000-0000-0000-000000000001` |

### Exam & Demo Records

| Item | UUID |
|------|------|
| Mid-Term April 2026 (exam) | `ex000001-0000-0000-0000-000000000001` |
| Maths exam paper (Class X-A) | `es000001-0000-0000-0000-000000000001` |
| English exam paper (Class X-A) | `es000002-0000-0000-0000-000000000001` |
| Physics exam paper (Class X-A) | `es000003-0000-0000-0000-000000000001` |
| Social Science exam paper | `es000004-0000-0000-0000-000000000001` |

---

## Student1 Demo Data Summary (Arjun Sharma, Class X-A)

| Data type | Detail |
|-----------|--------|
| Attendance | 5 sessions (7–14 Apr): 4 PRESENT, 1 ABSENT (80%) |
| Fees | Tuition PAID ₹12,000 · Exam PENDING ₹1,500 · Library PAID ₹500 · Sports OVERDUE ₹750 |
| Marks | Maths 78 · English 85 · Physics 71 · SST 88 (avg 80.5/100) |
| Homework | 3 published assignments (Maths, English, Physics) |
| Notices | 5 school notices visible |
| Timetable | Maths P1 Mon–Fri · English P2 Mon/Wed · Physics P2 Tue/Thu |
| Parent link | `parent1` user linked as GUARDIAN |

---

## Verified API Endpoints

### School Admin (`X-Tenant-Id: jnv-lucknow`)

| Method | Path | Response |
|--------|------|----------|
| `GET` | `/v1/school-admin/schools/{schoolId}/dashboard` | Live stats |
| `GET` | `/v1/school-admin/schools/{schoolId}/academic-years` | 1 year |
| `GET` | `/v1/school-admin/academic-years/{academicYearId}/classes` | 7 classes |
| `GET` | `/v1/school-admin/classes/{classId}/sections` | 2 sections |
| `GET` | `/v1/school-admin/schools/{schoolId}/subjects` | 10 subjects |
| `GET` | `/v1/school-admin/schools/{schoolId}/departments` | 5 departments |
| `GET` | `/v1/school-admin/schools/{schoolId}/staff` | 10 staff |
| `GET` | `/v1/school-admin/schools/{schoolId}/students` | 12 students |
| `GET` | `/v1/school-admin/schools/{schoolId}/notices` | 5 notices |
| `GET` | `/v1/school-admin/schools/{schoolId}/exams` | 1 exam |
| `GET` | `/v1/school-admin/schools/{schoolId}/fee-structures` | 6 structures |
| `GET` | `/v1/school-admin/domains` | Custom domains |
| `GET` | `/v1/school-admin/lesson-plans?from=...&to=...` | Teacher lesson plans |
| `GET` | `/v1/school-admin/online-classes?from=...&to=...` | Online classes |

### Teacher (`X-Tenant-Id: jnv-lucknow`)

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/v1/teacher/dashboard` | Teacher stats |
| `GET` | `/v1/teacher/timetable` | 9 slots for Class X-A |
| `GET` | `/v1/teacher/lesson-plans?from=...&to=...` | Lesson plans (CC-0704) |
| `POST` | `/v1/teacher/lesson-plans` | Create lesson plan |
| `POST` | `/v1/teacher/online-classes` | Schedule online class (CC-1201) |
| `GET` | `/v1/teacher/online-classes?from=...&to=...` | List online classes |
| `POST` | `/v1/teacher/videos/initiate` | Start video upload (CC-1202) |
| `GET` | `/v1/teacher/videos` | List uploaded videos |
| `POST` | `/v1/teacher/attendance/sessions` | Create attendance session |
| `POST` | `/v1/teacher/attendance/sessions/with-qr` | Create session + QR |

### Student (`X-Tenant-Id: jnv-lucknow`)

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/v1/student/fees` | 4 fee records (2 paid, 1 pending, 1 overdue) |
| `GET` | `/v1/student/timetable` | 9 slots |
| `GET` | `/v1/student/attendance?from=...&to=...` | 4P 1A in April |
| `GET` | `/v1/student/homework` | 3 published assignments |
| `GET` | `/v1/student/results` | 4 marks (Maths/Eng/Phy/SST) |
| `POST` | `/v1/student/attendance/qr-mark` | Self-mark via QR token |

### Parent (`X-Tenant-Id: jnv-lucknow`)

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/v1/parent/children` | Returns Arjun Sharma |
| `GET` | `/v1/parent/children/{studentId}/attendance?from=...&to=...` | Use student UUID |
| `GET` | `/v1/parent/children/{studentId}/fees` | 4 fee records |
| `GET` | `/v1/parent/children/{studentId}/results` | Exam marks |
| `GET` | `/v1/parent/children/{studentId}/timetable` | Class X-A timetable |
| `GET` | `/v1/parent/children/{studentId}/homework` | Homework list |

> **Important:** Parent child endpoints use the **student record UUID** (`7d000001-...`), not the user ID.

---

## Infrastructure (Local/Docker)

| Service | URL | Credentials |
|---------|-----|-------------|
| Backend API | http://localhost:8080 | — |
| Swagger UI | http://localhost:8080/swagger-ui.html | dev only |
| Frontend | http://localhost:5173 | — |
| MailHog | http://localhost:8025 | — |
| MinIO | http://localhost:9001 | minioadmin / minioadmin |
| Prometheus | http://localhost:9090 | — |
| Grafana | http://localhost:3100 | admin / admin |
| Tempo | http://localhost:3200 | — |
| RabbitMQ | http://localhost:15672 | cloudcampus / cloudcampus_dev |

### PostgreSQL

```bash
PGPASSWORD=cloudcampus_dev psql -U cloudcampus -d cloudcampus -h localhost
```

| Field | Value |
|-------|-------|
| Host | `localhost:5432` |
| Database | `cloudcampus` |
| Username | `cloudcampus` |
| Password | `cloudcampus_dev` |

### Redis

```bash
redis-cli FLUSHALL   # flush caches after config changes
```

---

## Environment Variables Reference

| Variable | Default (dev) | Description |
|----------|---------------|-------------|
| `BOOTSTRAP_ADMIN_USERNAME` | `superadmin` | Super admin username |
| `BOOTSTRAP_ADMIN_PASSWORD` | `Admin@123` | Set at first boot; empty = skip |
| `JWT_SECRET` | `changeme-dev-secret-minimum-32-chars!!` | Change in production |
| `ENCRYPTION_SECRET` | `dev-encryption-key-must-be-at-least-32ch` | AES-256-GCM key for PII |
| `DATABASE_URL` | set in `application-dev.yml` | PostgreSQL JDBC URL |
| `REDIS_HOST` / `REDIS_PORT` | `localhost` / `6379` | Redis connection |
| `MAIL_HOST` / `MAIL_PORT` | `localhost` / `1025` | SMTP (MailHog in dev) |
| `APP_FIREBASE_ENABLED` | `false` | Enable Firebase push |
| `APP_AI_ENABLED` | `false` | `true` = real AI; `false` = mock mode |
| `ANTHROPIC_API_KEY` | `dev-placeholder` | Required when AI enabled |
| `OPENAI_API_KEY` | `dev-placeholder` | Required when AI enabled |
| `FRONTEND_BASE_URL` | `http://localhost:5173` | Origin for QR deep-links |

---

## Known Dev Behaviour

| Symptom | Cause | Fix |
|---------|-------|-----|
| `@Cacheable` fails after restart | Stale Redis serializer format | `redis-cli FLUSHALL` then retry |
| V46 fails — `extension "vector" does not exist` | Wrong postgres image | Use `pgvector/pgvector:pg16`; `docker compose down && up -d` |
| QR scan shows "Invalid QR Code" | Token expired (5-min TTL) | Teacher generates fresh QR; ensure `FRONTEND_BASE_URL` matches origin |
| AI returns mock response | `APP_AI_ENABLED=false` | Set `true` + real `ANTHROPIC_API_KEY` |
| Teacher endpoints return "Staff record not found" | teacher1 not linked to staff table | V57 migration applies fix; restart backend |
| V58 skips (NOTICE in logs) | `jnv-lucknow` tenant UUID mismatch | Drop and recreate tenant via API, or update V58 UUID |
| `school-admin/lesson-plans` returns 500 | `school_id` missing from SCHOOL_ADMIN JWT | Fixed: schoolId resolved before `generateAccessToken()` in `AuthServiceImpl`; `user_school_access` row required |
| `GET /v1/student/results` returns empty | Results endpoint queries `exam_results` not `student_marks` | V58 now seeds both tables; `student_marks` carries subject-level data, `exam_results` the aggregate |
| `GET /v1/student/notices` returns 500 | No student-facing notice endpoint exists | Use `/v1/school-admin/schools/{schoolId}/notices` as school admin instead |
