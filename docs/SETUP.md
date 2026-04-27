# CampusCloud — Setup Guide

> Version: 1.0 | Last Updated: 2026-04-28

This guide walks through every option for running CampusCloud locally: Docker Compose (recommended), manual local setup, and first-time initialization.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Quick Start with Docker Compose](#2-quick-start-with-docker-compose)
3. [Manual Local Setup](#3-manual-local-setup)
4. [Environment Variables](#4-environment-variables)
5. [First-Time Initialization](#5-first-time-initialization)
6. [Running Tests](#6-running-tests)
7. [Common Troubleshooting](#7-common-troubleshooting)

---

## 1. Prerequisites

### Required Tools

| Tool | Minimum Version | Check | Install |
|------|----------------|-------|---------|
| Java (JDK) | 17 | `java -version` | [Adoptium](https://adoptium.net/) |
| Maven | 3.8+ | `mvn -version` | Bundled with IDE or `brew install maven` |
| Node.js | 22 | `node -version` | [nodejs.org](https://nodejs.org/) |
| npm | 10+ | `npm -version` | Bundled with Node.js |
| Docker Desktop | Latest | `docker -version` | [Docker](https://www.docker.com/products/docker-desktop/) |
| PostgreSQL | 16 (for manual) | `psql --version` | `brew install postgresql@16` |

### Clone the Repository

```bash
git clone https://github.com/your-org/CampusCloud.git
cd CampusCloud
```

---

## 2. Quick Start with Docker Compose

The fastest way to run the full stack. Requires Docker Desktop running.

### Step 1: Create environment file

```bash
cp .env.example .env   # if .env.example exists
# OR create manually:
cat > .env << 'EOF'
POSTGRES_DB=campuscloud
POSTGRES_USER=campuscloud
POSTGRES_PASSWORD=campuscloud_dev

JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_ACCESS_TOKEN_EXPIRATION_MS=3600000

BOOTSTRAP_ADMIN_USERNAME=superadmin
BOOTSTRAP_ADMIN_PASSWORD=SuperAdmin123!
BOOTSTRAP_ADMIN_ROLE=SUPER_ADMIN
EOF
```

### Step 2: Start all services

```bash
docker compose up --build
```

**First run takes ~3–5 minutes** (downloads images, builds backend JAR, installs frontend packages).

### Service URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080/api/v1 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| PostgreSQL | localhost:5432 (user: campuscloud) |

### Stop all services

```bash
docker compose down          # stop, keep data
docker compose down -v       # stop + delete volumes (resets DB)
```

---

## 3. Manual Local Setup

Use this if you prefer running backend and frontend outside Docker.

### 3.1 PostgreSQL Setup

Start PostgreSQL (macOS with Homebrew):
```bash
brew services start postgresql@16
```

Create database and user:
```bash
psql postgres
```
```sql
CREATE DATABASE campuscloud;
CREATE USER campuscloud WITH PASSWORD 'campuscloud_dev';
GRANT ALL PRIVILEGES ON DATABASE campuscloud TO campuscloud;
\q
```

### 3.2 Backend Setup

```bash
cd backend
```

Create `application-local.yml` override (or set environment variables):
```bash
# Option A: export environment variables
export JWT_SECRET="your-super-secret-jwt-key-min-32-chars-here"
export BOOTSTRAP_ADMIN_PASSWORD="SuperAdmin123!"
export SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/campuscloud"
export SPRING_DATASOURCE_USERNAME="campuscloud"
export SPRING_DATASOURCE_PASSWORD="campuscloud_dev"

# Run the backend
mvn spring-boot:run
```

```bash
# Option B: pass as JVM args
mvn spring-boot:run \
  -Dspring-boot.run.jvmArguments="\
    -DJWT_SECRET=your-super-secret-jwt-key-min-32-chars \
    -DBOOTSTRAP_ADMIN_PASSWORD=SuperAdmin123! \
    -DSPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/campuscloud \
    -DSPRING_DATASOURCE_USERNAME=campuscloud \
    -DSPRING_DATASOURCE_PASSWORD=campuscloud_dev"
```

Flyway will automatically run migrations and create the `public.tenants` table on startup.

### 3.3 Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local`:
```bash
cat > .env.local << 'EOF'
VITE_API_BASE_URL=http://localhost:8080
EOF
```

Start the dev server:
```bash
npm run dev
```

Frontend available at: http://localhost:5173

---

## 4. Environment Variables

All backend environment variables with defaults:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SPRING_DATASOURCE_URL` | ✅ Yes | — | PostgreSQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | ✅ Yes | — | DB username |
| `SPRING_DATASOURCE_PASSWORD` | ✅ Yes | — | DB password |
| `JWT_SECRET` | ✅ Yes | — | HMAC-SHA256 signing key (min 32 chars) |
| `JWT_ACCESS_TOKEN_EXPIRATION_MS` | No | `3600000` | Token TTL in ms (default: 1 hour) |
| `BOOTSTRAP_ADMIN_USERNAME` | No | `superadmin` | Super admin login username |
| `BOOTSTRAP_ADMIN_PASSWORD` | ✅ Yes | — | Super admin login password |
| `BOOTSTRAP_ADMIN_ROLE` | No | `SUPER_ADMIN` | Bootstrap role name |
| `SERVER_PORT` | No | `8080` | HTTP port |
| `SPRING_PROFILES_ACTIVE` | No | `default` | Spring profile |

### Frontend Variable

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | No | `http://localhost:8080` | Backend base URL |

---

## 5. First-Time Initialization

On first startup, the backend automatically:

1. Runs Flyway migrations on the `public` schema (creates `public.tenants` table)
2. Bootstraps the Super Admin user with credentials from `BOOTSTRAP_ADMIN_*` env vars

### Step 1: Verify backend is up

```bash
curl http://localhost:8080/api/v1/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"SuperAdmin123!"}'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "username": "superadmin",
    "role": "SUPER_ADMIN"
  }
}
```

### Step 2: Save the token

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"SuperAdmin123!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['accessToken'])")
```

### Step 3: Create your first tenant (school)

```bash
curl -X POST http://localhost:8080/api/v1/tenants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "greenwood",
    "schoolName": "Greenwood High School",
    "schemaName": "greenwood",
    "logoUrl": "https://example.com/logo.png",
    "primaryColor": "#10b981"
  }'
```

This creates a new PostgreSQL schema `greenwood` with all 13 domain tables.

### Step 4: Create a School Admin

```bash
curl -X POST http://localhost:8080/api/v1/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-ID: greenwood" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Sarah Admin",
    "username": "sarah.admin",
    "email": "sarah@greenwood.edu",
    "password": "AdminPass123!",
    "role": "SCHOOL_ADMIN"
  }'
```

### Step 5: Log in as School Admin

Go to http://localhost:5173 and log in with `greenwood` as the tenant and `sarah.admin` / `AdminPass123!` credentials.

---

## 6. Running Tests

```bash
# Backend unit tests
cd backend
mvn test

# Specific test class
mvn test -Dtest=UserServiceImplTest

# Skip tests during build
mvn clean package -DskipTests

# Frontend lint check
cd frontend
npm run lint
```

See [TESTING.md](./TESTING.md) for the complete testing guide.

---

## 7. Common Troubleshooting

### Backend won't start: "relation 'tenants' does not exist"

Flyway migration failed. Check:
```bash
# Verify DB connection
psql -U campuscloud -d campuscloud -c "\dt public.*"

# Check Flyway migration status
cd backend && mvn flyway:info \
  -Dflyway.url=jdbc:postgresql://localhost:5432/campuscloud \
  -Dflyway.user=campuscloud \
  -Dflyway.password=campuscloud_dev
```

### JWT_SECRET validation error on startup

The JWT secret must be at least 32 characters:
```bash
# Generate a valid secret
openssl rand -base64 48
```

### Frontend: "Network Error" on API calls

1. Confirm backend is running at http://localhost:8080
2. Check `VITE_API_BASE_URL` in `frontend/.env.local`
3. Look for CORS errors in browser DevTools — backend allows all origins in dev mode

### Docker: "port already in use"

```bash
# Find and kill process on port 8080
lsof -i :8080 | grep LISTEN
kill -9 <PID>

# Or change the port in docker-compose.yml
```

### "Tenant context not set" error

Every tenant-scoped API call requires the `X-Tenant-ID` header:
```bash
curl ... -H "X-Tenant-ID: greenwood" ...
```

### Student already exists (409 conflict)

`admissionNo` must be unique per tenant. Use a different value or check existing students:
```bash
curl http://localhost:8080/api/v1/students?size=100 \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-ID: greenwood"
```

### Docker Compose: backend exits immediately

Check backend logs:
```bash
docker compose logs backend --tail=50
```

Most common causes: missing env vars, DB not ready (backend starts before postgres health check passes), or Flyway migration conflict.
