# CloudCampus

CloudCampus is a multi-tenant school management SaaS platform built with Spring Boot, React, and PostgreSQL schema isolation.

## What Is Included

- Multi-tenant backend with schema-per-tenant isolation
- JWT authentication with role-based authorization
- School-first login UX (school search + role selection)
- Domain modules for academics, attendance, exams, fees, homework, timetable, parent portal, and dashboards
- Dockerized local stack (Postgres + backend + frontend)

## Architecture Snapshot

```text
Browser SPA (React)
	-> /api/v1 via Axios (HttpOnly cookie + X-Tenant-Slug)

Spring Boot API
	-> TenantRequestFilter (header/subdomain to schema)
	-> JwtAuthenticationFilter
	-> Controller -> Service -> Repository
	-> Hibernate multi-tenancy routing

PostgreSQL
	-> public schema (tenant registry, platform tables)
	-> school_<slug>/custom schemas (tenant domain data)
```

## Core Tech

- Backend: Java 17, Spring Boot 3.4.4, Spring Security, Spring Data JPA, Flyway
- Frontend: React 19, TypeScript, Vite, TanStack Query, Axios
- Data: PostgreSQL 16
- Runtime: Docker Compose

## Quick Start (Docker)

```bash
git clone https://github.com/your-org/CloudCampus.git
cd CloudCampus
cp .env.example .env

# Set required values in .env at minimum:
# - DB_PASSWORD
# - JWT_SECRET
# - BOOTSTRAP_ADMIN_USERNAME
# - BOOTSTRAP_ADMIN_PASSWORD

docker compose down -v
docker compose up --build
```

### Endpoints

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080/api/v1
- Swagger UI: http://localhost:8080/swagger-ui.html

## Tenant Handling

- Primary tenant header: X-Tenant-Slug
- Legacy fallback header (temporary compatibility): X-Tenant-ID
- Subdomain resolution is supported and configurable
- External contracts use school slug; internal schema mapping is resolved server-side

## API Envelope Standard

All APIs return the standardized envelope:

```json
{
	"success": true,
	"message": "string",
	"data": {}
}
```

## Repository Layout

```text
CloudCampus/
	backend/
		src/main/java/com/cloudcampus/
			auth/ config/ common/ tenant/ user/ student/ teacher/ academic/
			attendance/ exam/ fees/ homework/ timetable/ parent/ dashboard/
			subscription/
		src/main/resources/
			application.yml
			db/migration/
	frontend/
		src/
			app/ api/ components/ features/ hooks/ types/ utils/
	docs/
	scripts/
	docker-compose.yml
```

## Roles

- SUPER_ADMIN: platform-wide administration
- SCHOOL_ADMIN: tenant administration
- TEACHER: operational academic workflows
- STUDENT: personal academic view
- PARENT: linked-student view

## Testing

```bash
cd backend
mvn test
```

## Documentation Index

- [docs/01_README.md](docs/01_README.md)
- [docs/02_SETUP.md](docs/02_SETUP.md)
- [docs/03_ARCHITECTURE.md](docs/03_ARCHITECTURE.md)
- [docs/07_API_REFERENCE.md](docs/07_API_REFERENCE.md)
- [docs/08_API.md](docs/08_API.md)
- [docs/09_TESTING.md](docs/09_TESTING.md)
- [docs/05_ROLE_MATRIX.md](docs/05_ROLE_MATRIX.md)

## Git Branching Strategy

### Branch Naming Convention

```
<type>/<module>/<short-description>
```

| Type | When to use |
|---|---|
| `feature/` | New functionality |
| `fix/` | Bug fix |
| `hotfix/` | Urgent production fix |
| `refactor/` | Code cleanup, no new feature |
| `chore/` | Config, deps, tooling |
| `test/` | Adding or fixing tests |
| `docs/` | Documentation only |

### Examples

```bash
feature/academic/add-assignment-module
feature/fees/payment-receipt-api
fix/auth/jwt-expiry-not-refreshing
refactor/academic/add-mapper-layer
hotfix/tenant/schema-creation-failure
chore/deps/upgrade-spring-boot-3.3
```

### Workflow

```bash
# Start new work — always branch from main
git checkout main && git pull origin main
git checkout -b feature/<module>/<what-you-are-building>

# Commit using conventional commits
git commit -m "feat(<module>): <what you did>"
git commit -m "fix(<module>): <what you fixed>"
git commit -m "refactor(<module>): <what you changed>"

# Push and open Pull Request
git push origin feature/<module>/<what-you-are-building>

# After PR is merged — clean up
git checkout main && git pull origin main
git branch -d feature/<module>/<what-you-are-building>
```

### Commit Message Format

```
feat(fees): add payment receipt generation
fix(auth): resolve jwt token expiry refresh issue
refactor(academic): extract mapper layer for dto conversion
test(exam): add unit tests for ExamServiceImpl
chore(deps): upgrade spring-boot to 3.4.5
```

### Branch Protection (main)

- No direct pushes to `main`
- All changes go through Pull Requests
- Force pushes and deletions are not allowed

## License

Proprietary. CloudCampus.
