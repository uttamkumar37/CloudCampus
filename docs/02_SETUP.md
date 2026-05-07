# CloudCampus Setup Guide

Version: 2026-05-07

## 1. Prerequisites

- Java 17
- Maven 3.8+
- Node.js 20+ (22 recommended)
- npm 10+
- Docker Desktop
- Internet access at runtime (Inter font loaded from Google Fonts)

## 2. Docker Setup (Recommended)

1. Prepare environment file:

```bash
# If template exists
cp .env.example .env

# Or if .env is already present, just edit it
# (current repository already includes a local .env)
```

2. Set required values in .env:

- DB_PASSWORD
- JWT_SECRET (minimum 32 bytes)
- BOOTSTRAP_ADMIN_USERNAME
- BOOTSTRAP_ADMIN_PASSWORD

3. Clean start:

```bash
docker compose down -v
docker compose up --build
```

4. Open services:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080/api/v1
- Swagger UI: http://localhost:8080/swagger-ui.html

## 3. Manual Setup

### Backend

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

### Frontend

```bash
cd frontend
npm install
printf "VITE_API_BASE_URL=http://localhost:8080/api/v1\n" > .env.local
npm run dev
```

## 4. Tenant and Login Flow

- Login UI shows a single compact form — school name search, role dropdown, username, and password all on one screen
- School search uses a live dropdown; selecting a school resolves the tenant slug automatically
- Client sends `X-Tenant-Slug` header for all tenant-scoped API calls
- Backend supports legacy `X-Tenant-ID` header for compatibility
- Super Admin logs in at `/super-admin/login` — no school or role selection needed
- Super-admin API calls must not include tenant headers
- Subdomain-based tenant resolution is available when `APP_TENANT_SUBDOMAIN_ENABLED=true`

## 5. Seed Demo Data

Run these after backend is up:

```bash
# Minimal seed (single-school compact profile)
python3 scripts/seed_demo.py

# Full dashboard seed (Sunrise Academy, all modules)
python3 scripts/seed_dashboard_data.py
```

Notes:
- `seed_dashboard_data.py` now sends required school-admin fields during tenant creation.
- Scripts are idempotent where API behavior allows (existing entities are reused).

## 6. Environment Variables

### Backend

- SERVER_PORT (default 8080)
- DB_URL
- DB_USERNAME
- DB_PASSWORD
- JWT_SECRET
- JWT_ACCESS_TOKEN_EXPIRATION_MS (default 3600000)
- BOOTSTRAP_ADMIN_USERNAME
- BOOTSTRAP_ADMIN_PASSWORD
- BOOTSTRAP_ADMIN_ROLE (default SUPER_ADMIN)
- APP_TENANT_SUBDOMAIN_ENABLED (default true)
- APP_TENANT_ROOT_DOMAINS (default localhost)
- APP_TENANT_RESERVED_LABELS

### Frontend

- VITE_API_BASE_URL (default http://localhost:8080/api/v1)

## 7. Test Commands

```bash
cd backend
mvn test

cd ../frontend
npm run lint
npm run build
```

## 8. Troubleshooting

- 401 loops: clear browser cookies/localStorage and login again
- Tenant errors: verify X-Tenant-Slug is sent for tenant-scoped calls
- Startup failures: verify BOOTSTRAP_ADMIN_USERNAME and BOOTSTRAP_ADMIN_PASSWORD are set
- Placeholder errors (e.g., JWT_SECRET): export env vars or source `.env` before starting backend manually
- Migration issues: check backend logs for Flyway errors
