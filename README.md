# CampusCloud Monorepo

CampusCloud is a multi-tenant school management platform with a Spring Boot backend and React (Vite) frontend in a clean monorepo layout.

## Project Structure

```text
CampusCloud/
├── backend/                 # Spring Boot application
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
├── frontend/                # React + Vite application
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── docs/
│   ├── API_REFERENCE.md   # REST API (v1) + admin paths
│   ├── PROJECT_TRACKER.md
│   ├── TESTING.md
│   └── ARCHITECTURE.md
├── postman/
│   ├── CampusCloud.postman_collection.json
│   └── CampusCloud.local.postman_environment.json
├── scripts/
│   ├── start-dev.sh
│   └── build.sh
├── docker-compose.yml
├── .env.example
└── .gitignore
```

## Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 20+
- npm 10+
- PostgreSQL 16 (or Docker)

## Run Backend (Local)

1. Copy env file:

```bash
cp .env.example .env
```

2. Start backend:

```bash
cd backend
mvn spring-boot:run
```

Backend URL: http://localhost:8080

## Run Frontend (Local)

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: http://localhost:5173

The frontend API base URL is configured as:

- http://localhost:8080/api/v1

Axios request interceptors already send:

- Authorization: Bearer <token>
- X-Tenant-ID: <tenant-schema>

## API documentation

- [REST API reference (v1)](docs/API_REFERENCE.md) — paths, auth, and response envelope
- [Platform blueprint](docs/PLATFORM_BLUEPRINT.md) — unified users, tenant DDL, homework/timetable/parent APIs, roadmap
- **Postman:** import `postman/CampusCloud.postman_collection.json` and `postman/CampusCloud.local.postman_environment.json`, then set `baseUrl` to `http://localhost:8080/api/v1` and your credentials. Run **Auth → Super Admin** or **Tenant User Login** first to populate `{{token}}`.
- **Swagger UI (when the backend is running):** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

## Run Full Stack With Docker

1. Create a `.env` from `.env.example` and set at least `DB_PASSWORD`, `JWT_SECRET` (32+ characters; e.g. `openssl rand -hex 32`), and `BOOTSTRAP_ADMIN_PASSWORD` (8+ characters).

2. Build and start:

```bash
docker compose build
docker compose up -d
```

3. Check services:

| Service  | URL |
|----------|-----|
| Frontend (Vite dev) | http://localhost:5173 |
| Backend API | http://localhost:8080 |
| OpenAPI docs | http://localhost:8080/swagger-ui.html |
| PostgreSQL | `localhost:5432` (user/db from `.env`) |

Stop without removing data: `docker compose down`  
Recreate the database volume (e.g. after changing `DB_PASSWORD`): `docker compose down -v` then `docker compose up -d --build`

Services:

- postgres: PostgreSQL 16
- backend: Spring Boot app on port 8080
- frontend: Vite dev server on port 5173

## Dev Scripts

From repository root:

```bash
./scripts/start-dev.sh
```

```bash
./scripts/build.sh
```

## Notes

- This refactor only reorganizes structure and updates integration/config paths.
- Business logic and application behavior are unchanged.
