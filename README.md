# CloudCampus Backend

CloudCampus is currently kept as a backend-only repository. Frontend, mobile, infrastructure, broad documentation, and performance-test surfaces were intentionally removed from `main` so they can be added back later in separate focused phases.

## What Remains

- Spring Boot backend in `backend/`
- Flyway database migrations
- Backend tests
- Backend Dockerfile
- Root Docker Compose files for PostgreSQL plus the backend service
- Root environment templates for backend runtime configuration

## Backend Stack

- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA / Hibernate
- Flyway
- PostgreSQL / H2 test runtime
- Maven

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
