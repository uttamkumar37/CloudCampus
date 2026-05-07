# CloudCampus

Multi-tenant school management SaaS platform — built with Spring Boot 3.4, React 19, and PostgreSQL schema-per-tenant isolation.

---

## What It Does

CloudCampus gives each school its own isolated workspace with:

- **Student & Teacher management** — records, profiles, auto-provisioned credentials
- **Academics** — classes, sections, subjects, timetable
- **Attendance** — daily marking, absence tracking
- **Fees** — assignments, payments, partial/full status tracking
- **Exams & Marks** — exam creation, result entry, per-student views
- **Homework** — assignment publishing, overdue tracking
- **Parent Portal** — linked children, attendance + fee + results view
- **Bulk Operations** — Excel upload → validate → preview → execute → job tracking
- **Website Builder** — each school gets a public website with CMS (gallery, admissions form, notices)
- **Subscriptions** — plan tiers (FREE / BASIC / PRO / ENTERPRISE), Razorpay gateway

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3.4, Spring Security, Spring Data JPA, Flyway |
| Frontend | React 19, TypeScript, Vite, TanStack Query v5, Axios |
| Database | PostgreSQL 16 — schema-per-tenant multi-tenancy |
| Runtime | Docker Compose |

---

## Quick Start

```bash
git clone https://github.com/uttamkumar37/CloudCampus.git
cd CloudCampus

# Copy and configure environment
cp .env.example .env
# Set: DB_PASSWORD, JWT_SECRET, BOOTSTRAP_ADMIN_USERNAME, BOOTSTRAP_ADMIN_PASSWORD

# Start everything
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080/api/v1 |
| Swagger UI | http://localhost:8080/swagger-ui.html |

Then seed demo data:

```bash
python3 scripts/seed_dashboard_data.py
```

Login at http://localhost:5173/login — select **Sunrise Academy**, any role, password `Demo@2026!`

Super Admin: http://localhost:5173/super-admin/login — `superadmin` / `SuperAdmin_Docker_2026!`

---

## Architecture

```
Browser (React SPA)
  └─ /api/v1  →  TenantRequestFilter  →  JwtAuthenticationFilter
                       │
                       ▼
               Spring Boot Controllers
               └─ Service → Repository → PostgreSQL
                                            ├─ public schema   (tenants, subscriptions, payments, CMS)
                                            └─ <school> schema  (students, teachers, academic data, …)
```

Each school's data lives in its own PostgreSQL schema. The `public` schema holds platform-level data.

**Auth flow:** Login → JWT in HttpOnly cookie (`app_jwt`) → `TenantRequestFilter` resolves schema from `X-Tenant-Slug` header → `FirstLoginEnforcementFilter` enforces credential update on first login.

**Roles:** `SUPER_ADMIN` · `SCHOOL_ADMIN` · `TEACHER` · `STUDENT` · `PARENT`

---

## Repository Structure

```
CloudCampus/
├── backend/
│   └── src/main/java/com/cloudcampus/
│       ├── auth/          auth, JWT, OTP, first-login enforcement
│       ├── tenant/        multi-tenant schema management
│       ├── user/          user accounts, provisioning
│       ├── student/       student CRUD + auto provisioning
│       ├── teacher/       teacher CRUD + auto provisioning
│       ├── academic/      classes, sections, subjects
│       ├── attendance/    attendance marking
│       ├── fees/          fee assignment + payments
│       ├── exam/          exams + results
│       ├── homework/      homework assignments
│       ├── timetable/     timetable slots
│       ├── parent/        parent–student links
│       ├── dashboard/     role-based dashboard aggregation
│       ├── bulk/          Excel bulk operations workflow
│       ├── cms/           school website builder (CMS)
│       ├── subscription/  plans, Razorpay payment gateway
│       └── common/        ApiResponse, exceptions, audit base
├── frontend/
│   └── src/features/
│       ├── auth/          login, session
│       ├── student/       student management
│       ├── teacher/       teacher management
│       ├── academic/      classes, subjects, sections
│       ├── attendance/    attendance marking
│       ├── fees/          fee management
│       ├── marks/         exams, results
│       ├── homework/      homework
│       ├── timetable/     timetable grid
│       ├── parent/        parent portal
│       ├── dashboard/     role dashboards
│       ├── super-admin/   platform admin
│       ├── bulk-upload/   bulk operations UI
│       ├── website-builder/ school website CMS
│       ├── public-website/  public school website
│       └── profile/       user profile
├── docs/                  consolidated documentation (see below)
├── scripts/               seed scripts (Python)
├── docker-compose.yml
└── README.md
```

---

## Documentation

| Doc | Description |
|---|---|
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Local setup, commands, testing, demo access, contribution workflow |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, module breakdown, DB schema, auth flow |
| [docs/API.md](docs/API.md) | Concise API map and where to use Swagger or Postman |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Version history |
| [docs/postman/10_README.md](docs/postman/10_README.md) | Postman collection usage |
| `samples/CloudCampus_DummyData.xlsx` | Sample workbook generated for imports and demos |

---

## License

Proprietary. CloudCampus.
