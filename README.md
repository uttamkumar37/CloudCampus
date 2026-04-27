# CampusCloud

> Multi-tenant School Management SaaS Platform

CampusCloud is a production-grade SaaS platform for managing K-12 schools. Each school (tenant) is fully isolated using PostgreSQL schema-per-tenant. The platform covers the complete school operations lifecycle: enrollment, academics, attendance, exams, fees, homework, and timetables.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17 · Spring Boot 3.4.4 · Spring Security 6 · Spring Data JPA |
| Database | PostgreSQL 16 · Flyway · Schema-per-tenant multi-tenancy |
| Authentication | Stateless JWT (HS256) · BCrypt |
| API Docs | SpringDoc OpenAPI 2.6 (Swagger UI) |
| Frontend | React 19 · TypeScript · Vite · Tailwind CSS 4 |
| State Mgmt | TanStack Query 5 · Axios |
| Routing | React Router 7 |
| Containerization | Docker Compose (3 services) |

---

## Quick Start

```bash
git clone https://github.com/your-org/CampusCloud.git
cd CampusCloud

# Set required env vars
cat > .env << 'EOF'
POSTGRES_DB=campuscloud
POSTGRES_USER=campuscloud
POSTGRES_PASSWORD=campuscloud_dev
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
BOOTSTRAP_ADMIN_PASSWORD=SuperAdmin123!
EOF

docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080/api/v1 |
| Swagger UI | http://localhost:8080/swagger-ui.html |

Login with: **superadmin** / **SuperAdmin123!**

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/SETUP.md](docs/SETUP.md) | Full local setup, environment variables, first-time init |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, tech stack, multi-tenancy, database schema |
| [docs/API.md](docs/API.md) | Complete API reference with request/response examples |
| [docs/API_REFERENCE.md](docs/API_REFERENCE.md) | Quick-reference endpoint tables, enums, pagination |
| [docs/PLATFORM_BLUEPRINT.md](docs/PLATFORM_BLUEPRINT.md) | Role model, workflows, business rules |
| [docs/TESTING.md](docs/TESTING.md) | Unit tests, curl test scripts, business rule tests |
| [docs/PROJECT_TRACKER.md](docs/PROJECT_TRACKER.md) | Feature completion status, architecture decisions |
| [docs/PENDING_TASKS.md](docs/PENDING_TASKS.md) | Backlog with actionable task checklists |
| [docs/postman/README.md](docs/postman/README.md) | Postman collection import and usage guide |

---

## Project Structure

```
CampusCloud/
├── backend/                     # Spring Boot application
│   ├── src/main/java/com/campuscloud/
│   │   ├── auth/                # JWT login endpoint
│   │   ├── security/            # JWT filter, role guards
│   │   ├── tenant/              # Tenant CRUD, schema provisioning
│   │   ├── user/                # User management
│   │   ├── student/             # Student enrollment
│   │   ├── teacher/             # Teacher management
│   │   ├── academic/            # Classes, subjects, sections
│   │   ├── attendance/          # Daily attendance records
│   │   ├── exam/                # Exams and results
│   │   ├── fees/                # Fee assignments and payments
│   │   ├── homework/            # Homework assignments
│   │   ├── timetable/           # Weekly schedule slots
│   │   ├── parent/              # Parent-student links
│   │   ├── bulk/                # Excel bulk upload
│   │   └── dashboard/           # KPI summaries
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/        # Flyway SQL migrations
├── frontend/                    # React + Vite SPA
│   └── src/
│       ├── features/            # Feature modules
│       ├── api/                 # Axios client + endpoint constants
│       └── app/                 # Routes, providers, query keys
├── docs/                        # Full documentation
├── scripts/                     # build.sh, start-dev.sh
└── docker-compose.yml
```

---

## User Roles

| Role | Access |
|------|--------|
| `SUPER_ADMIN` | Global — manage all tenants and super admin users |
| `SCHOOL_ADMIN` | Tenant-scoped — full school operations management |
| `TEACHER` | Tenant-scoped — attendance, exams, homework, timetable |
| `STUDENT` | Tenant-scoped — own records (read only) |
| `PARENT` | Tenant-scoped — own children's records (read only) |

---

## Running Tests

```bash
cd backend
mvn test
```

---

## Contributing

See [docs/SETUP.md](docs/SETUP.md) for development environment setup and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design details before contributing.

---

## License

Proprietary — CampusCloud Team
