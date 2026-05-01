# CloudCampus Setup Guide

Version: 2026-05-01

## 1. Prerequisites

- Java 17
- Maven 3.8+
- Node.js 22+
- npm 10+
- Docker Desktop

## 2. Docker Setup (Recommended)

1. Copy environment template:

```bash
cp .env.example .env
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

- Login UI requires school selection and role selection before credentials
- Client sends X-Tenant-Slug for tenant-scoped APIs
- Backend supports legacy X-Tenant-ID for compatibility
- Subdomain based tenant resolution is available

## 5. Environment Variables

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

## 6. Test Commands

```bash
cd backend
mvn test

cd ../frontend
npm run lint
npm run build
```

## 7. Troubleshooting

- 401 loops: clear browser cookies/localStorage and login again
- Tenant errors: verify X-Tenant-Slug is sent for tenant-scoped calls
- Startup failures: verify BOOTSTRAP_ADMIN_USERNAME and BOOTSTRAP_ADMIN_PASSWORD are set
- Migration issues: check backend logs for Flyway errors
