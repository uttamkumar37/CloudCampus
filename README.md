# CloudCampus

CloudCampus is a multi-tenant School ERP SaaS platform for schools, trusts, and multi-campus organizations. It includes a Spring Boot backend, React/Vite frontend, Expo mobile shell, PostgreSQL deployment assets, role-based authentication, MFA, tenant onboarding, school isolation, and core ERP workflows.

## Current Repository Strategy

The active development and deployment line is:

```text
main
```

Backup restore points are kept separately:

```text
backup/Version-V1
backup/Version-V2
```

Release/backup tags are also available:

```text
Version-V1
Version-V2
```

`Version-V1` and `Version-V2` are backups only. Do not develop directly on backup branches.

For normal work, use short-lived task branches:

```bash
git switch -c feature/task-name
```

After validation, merge or fast-forward the work into `main`, tag important milestones, and delete the temporary branch.

## Environments

CloudCampus should use the same codebase with different environment configuration.

| Environment | Purpose | Data Policy |
|---|---|---|
| Local | Developer machine | Demo data and local-only credentials allowed |
| Demo | Product demos | Demo data allowed, no real customer data |
| Staging | Production-like verification | Real deployment shape, test data only |
| Production | Real customers | Real secrets, backups, monitoring, no demo credentials |

Do not create permanent `demo`, `staging`, or `production` branches unless there is a very specific release-management need. Use environment variables, deployment config, and release tags instead.

## Tech Stack

- Backend: Java 21, Spring Boot, Maven, Flyway
- Frontend: React, TypeScript, Vite
- Mobile: Expo shell, TypeScript
- Database: PostgreSQL for staging/production, local profile can use H2
- Deployment: Docker, Docker Compose, Nginx, EC2-ready scripts
- CI/CD: GitHub Actions

## Local Development

### Backend

```bash
cd backend
SPRING_PROFILES_ACTIVE=local mvn spring-boot:run
```

Backend health:

```text
http://127.0.0.1:8080/actuator/health
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://127.0.0.1:5173/
```

### Mobile

```bash
cd mobile
npm install
npm run typecheck
npm start
```

## Local Demo Credentials

These credentials are for local development only.

| Role | Email | Password |
|---|---|---|
| Super Admin | `superadmin@cloudcampus.dev` | `SuperAdmin123!` |
| School Admin | `principal@jnv.knp.demo` | `DemoPass123!` |
| Teacher Math | `teacher.math@jnv.knp.demo` | `DemoPass123!` |
| Teacher English | `teacher.english@jnv.knp.demo` | `DemoPass123!` |
| Teacher Science | `teacher.science@jnv.knp.demo` | `DemoPass123!` |
| Finance Staff | `finance@jnv.knp.demo` | `DemoPass123!` |
| Staff | `office@jnv.knp.demo` | `DemoPass123!` |
| Parent | `parent@jnv.knp.demo` | `DemoPass123!` |
| Student | `student@jnv.knp.demo` | `DemoPass123!` |

MFA is enabled. In local/demo mode the MFA code is surfaced by the login response/UI for testing.

## Local Demo Dataset

The local profile seeds a JNV-style demo school:

```text
Jawahar Navodaya Vidyalaya Kanpur
School code: JNV-KNP
```

Seeded data includes academic year, classes, sections, subjects, teachers, staff, students, parent link, fees, attendance, homework, exam/results, notices, timetable, documents, and website content.

## Validation Commands

Backend:

```bash
cd backend
mvn test
```

Frontend:

```bash
cd frontend
npm test -- --run
npm run lint
npm run typecheck
npm run build
```

Mobile:

```bash
cd mobile
npm run lint
npm run typecheck
npm test -- --run
```

Ops validation:

```bash
sh scripts/ci/validate-ops.sh
sh scripts/ci/security-audit.sh
```

Compose validation:

```bash
docker compose --env-file .env.example -f docker-compose.local.yml config
docker compose --env-file .env.staging.example -f docker-compose.staging.yml config
docker compose --env-file .env.production.example -f docker-compose.prod.yml config
```

## Deployment

Deployment documentation lives in:

- [Deployment Plan](docs/deployment/DEPLOYMENT_PLAN.md)
- [Deployment README](docs/deployment/DEPLOYMENT_README.md)
- [Staging Checklist](docs/deployment/STAGING_CHECKLIST.md)
- [Staging Runbook](docs/deployment/STAGING_RUNBOOK.md)
- [Health Check Guide](docs/deployment/HEALTH_CHECK_GUIDE.md)
- [Rollback Guide](docs/deployment/ROLLBACK_GUIDE.md)

For MVP staging, use EC2 + Docker Compose + Nginx. For production, prefer managed PostgreSQL, HTTPS, strong secrets, backups, monitoring, and no local/demo credentials.

## Important Audit Documents

- [Master Architecture and Execution Plan](docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md)
- [Full Project Audit](docs/audit/FULL_PROJECT_AUDIT.md)
- [Production Readiness Report](docs/audit/PRODUCTION_READINESS_REPORT.md)
- [Frontend API Connection Audit](docs/audit/FRONTEND_API_CONNECTION_AUDIT.md)
- [UI/API Integration Matrix](docs/audit/UI_API_INTEGRATION_MATRIX.md)
- [Backend API Inventory](docs/audit/BACKEND_API_INVENTORY.md)
- [Staging Smoke Test Report](docs/audit/STAGING_SMOKE_TEST_REPORT.md)

## Production Rules

- Do not commit real `.env` files or secrets.
- Do not use local demo credentials in staging or production.
- Do not expose PostgreSQL publicly.
- Do not expose backend directly when Nginx is used.
- Use HTTPS for staging and production.
- Use strong JWT secrets.
- Keep Flyway migrations enabled.
- Verify `/actuator/health` and `/actuator/health/readiness`.
- Run staging smoke tests before production.
- Keep backups and rollback instructions ready.

