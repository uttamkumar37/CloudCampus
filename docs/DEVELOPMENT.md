# Development Guide

This is the canonical guide for local setup, day-to-day commands, testing, demo access, and contribution workflow.

## 1. Prerequisites

- Java 17
- Maven 3.8+
- Node.js 20+
- npm 10+
- Docker Desktop

## 2. Quick Start

### Docker workflow (recommended)

```bash
cp .env.example .env
# set DB_PASSWORD, JWT_SECRET, BOOTSTRAP_ADMIN_USERNAME, BOOTSTRAP_ADMIN_PASSWORD

docker compose down -v
docker compose up --build
```

Services:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080/api/v1
- Swagger UI: http://localhost:8080/swagger-ui.html

### Manual workflow

Backend:

```bash
cd backend
export DB_URL="jdbc:postgresql://localhost:5432/cloudcampus"
export DB_USERNAME="postgres"
export DB_PASSWORD="your-password"
export JWT_SECRET="your-strong-secret-min-32-bytes"
export BOOTSTRAP_ADMIN_USERNAME="superadmin"
export BOOTSTRAP_ADMIN_PASSWORD="your-admin-password"
mvn spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
printf "VITE_API_BASE_URL=http://localhost:8080/api/v1\n" > .env.local
npm run dev
```

## 3. Environment Variables

Backend:

- `SERVER_PORT` (default `8080`)
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_ACCESS_TOKEN_EXPIRATION_MS`
- `BOOTSTRAP_ADMIN_USERNAME`
- `BOOTSTRAP_ADMIN_PASSWORD`
- `BOOTSTRAP_ADMIN_ROLE`
- `APP_TENANT_SUBDOMAIN_ENABLED`
- `APP_TENANT_ROOT_DOMAINS`
- `APP_TENANT_RESERVED_LABELS`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

Frontend:

- `VITE_API_BASE_URL`

## 4. Demo Data

Seed scripts:

```bash
python3 scripts/seed_demo.py
python3 scripts/seed_dashboard_data.py
```

Primary demo tenant:

- School: `Sunrise Academy`
- Login URL: http://localhost:5173/login
- Shared school-user password: `Demo@2026!`
- Super Admin URL: http://localhost:5173/super-admin/login
- Super Admin credentials come from `BOOTSTRAP_ADMIN_USERNAME` and `BOOTSTRAP_ADMIN_PASSWORD`

Representative school users:

| Role | Username |
|---|---|
| School Admin | `priya.sharma` |
| Teacher | `sunita.aggarwal` |
| Teacher | `vikram.teacher` |
| Student | `aarav.student` |
| Student | `siddharth.student` |
| Parent | `ramesh.parent` |
| Parent | `mukesh.parent` |

## 5. Common Commands

Docker:

```bash
docker compose up --build
docker compose up --build -d
docker compose down
docker compose down -v
docker compose logs -f
docker compose logs backend --tail=100 -f
docker compose ps
```

Backend:

```bash
cd backend
mvn compile -q
mvn test
mvn verify
mvn clean package
mvn clean package -DskipTests
mvn dependency:tree
```

Frontend:

```bash
cd frontend
npm install
npm run dev
npm run build
npm run lint
npm run test
```

Git:

```bash
git status
git checkout -b feature/<short-description>
git add <files>
git commit -m "feat(scope): short description"
git push -u origin feature/<short-description>
```

## 6. Testing

Recommended verification path:

```bash
cd backend && mvn test
cd backend && mvn verify
cd frontend && npm run lint
cd frontend && npm run build
cd frontend && npm run test
```

Current testing layers:

| Layer | Tooling | Notes |
|---|---|---|
| Backend unit tests | JUnit 5, Mockito | Fast service-level checks |
| Backend integration tests | Spring Boot, Testcontainers, Failsafe | Tenant/auth/domain flows |
| Frontend tests | Vitest, Testing Library | Focused component and utility coverage |
| Manual API validation | Swagger, Postman, curl | Useful for tenant-scoped flows |

Reports are written under `backend/target/surefire-reports/` and `backend/target/failsafe-reports/`.

## 7. Contribution Workflow

Branch naming:

```text
<type>/<short-description>
```

Common prefixes:

- `feature/`
- `fix/`
- `hotfix/`
- `refactor/`
- `chore/`
- `test/`
- `docs/`

Commit message format:

```text
<type>(<scope>): <short description>
```

Rules:

- Branch from `main`; do not commit directly to `main`
- Keep PRs focused to one concern
- Run backend tests and frontend build before review
- Keep backend changes inside the existing `controller -> service -> repository` layering
- Add schema changes through Flyway migrations only

## 8. Troubleshooting

- 401 loops: clear cookies/local storage and log in again
- Tenant errors: confirm `X-Tenant-Slug` is present on tenant-scoped requests
- Startup failures: confirm bootstrap admin and `JWT_SECRET` values are set
- Flyway failures: inspect backend startup logs and migration history
- Frontend API issues: verify `VITE_API_BASE_URL` matches the running backend