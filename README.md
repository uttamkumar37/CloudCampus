# CloudCampus

CloudCampus is a Java 21 Spring Boot backend for a multi-tenant school ERP SaaS platform with an isolated React/Vite AI portal frontend workspace. The backend remains the production authority for authentication, tenant and school scope, route policy, AI entitlements, audit logging, OpenAPI, Docker, and deployment.

## Repository Shape

- Spring Boot backend in `backend/`
- AI portal frontend in `frontend/`
- Flyway database migrations
- Backend tests
- Backend Dockerfile
- Root Docker Compose files for PostgreSQL plus the backend service
- Root environment templates for backend runtime configuration
- Human docs under `docs/`

## Backend Stack

- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA / Hibernate
- Flyway
- PostgreSQL / H2 test runtime
- Maven

## Frontend Stack

- React 18
- Vite
- TypeScript
- Lucide React icons
- Plain CSS tailored for a SaaS operations UI

## Local Development

Run backend tests:

```bash
cd backend
mvn test
```

Run the backend with Docker Compose:

```bash
docker compose -f docker-compose.local.yml up --build
```

The backend service listens on port `18080` by default and exposes health checks under `/actuator/health`.

Run the AI portal frontend:

```bash
cd frontend
npm install
npm run dev
```

The frontend uses `VITE_CLOUDCAMPUS_API_BASE_URL` when set and otherwise calls `http://localhost:18080`. It sends the authenticated bearer token and correlation ID only; tenant, school, and role scope remain backend-owned.
