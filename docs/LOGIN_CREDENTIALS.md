# CloudCampus — Login Credentials

> **Note:** This file is for local/dev reference only. Never commit real production passwords.

---

## How to Start the Backend

```bash
# Option 1 — Docker PostgreSQL + Redis (recommended)
docker compose up -d postgres redis
cd backend
SPRING_PROFILES_ACTIVE=local \
  BOOTSTRAP_ADMIN_PASSWORD=Admin@1234 \
  JAVA_HOME=$(/usr/libexec/java_home -v 21) \
  mvn spring-boot:run

# Option 2 — H2 in-memory (no Docker needed, resets on restart)
cd backend
BOOTSTRAP_ADMIN_PASSWORD=Admin@1234 \
  JAVA_HOME=$(/usr/libexec/java_home -v 21) \
  mvn spring-boot:run
```

API base URL: `http://localhost:8080`
Swagger UI: `http://localhost:8080/swagger-ui.html`

---

## Login API

```
POST /v1/auth/login
Content-Type: application/json
X-Tenant-Id: <tenantId>     ← omit for SUPER_ADMIN

{
  "username": "...",
  "password": "..."
}
```

---

## Super Admin

| Field    | Value        |
|----------|--------------|
| Username | `superadmin` |
| Password | Set via `BOOTSTRAP_ADMIN_PASSWORD` env var at first boot (e.g. `Admin@1234`) |
| Role     | `SUPER_ADMIN` |
| Tenant   | None — platform-level account, **do NOT send `X-Tenant-Id` header** |

> The super admin account is created once on first boot by `SuperAdminBootstrap`. If the user already exists, the bootstrap is a no-op.

---

## Demo Tenant & School (seeded via onboarding API)

These are created by calling the tenant onboarding API, not pre-seeded in migrations.

### Create tenant + school (run once)

```bash
POST /v1/super-admin/tenants
Authorization: Bearer <superadmin_access_token>

{
  "name": "Demo School District",
  "code": "DEMO",
  "contactEmail": "admin@demo.cloudcampus.io",
  "planType": "PROFESSIONAL"
}
```

The response returns `tenantId` and `schoolId`. Use these in all subsequent requests.

---

## Tenant Admin

| Field    | Value |
|----------|-------|
| Username | Created via `POST /v1/admin/users` after tenant is set up |
| Password | Set at creation time |
| Role     | `TENANT_ADMIN` |
| Header   | `X-Tenant-Id: <tenantId>` |

---

## School Admin

| Field    | Value |
|----------|-------|
| Username | Created via `POST /v1/admin/users` |
| Password | Set at creation time |
| Role     | `SCHOOL_ADMIN` |
| Header   | `X-Tenant-Id: <tenantId>` |

---

## Teacher

| Field    | Value |
|----------|-------|
| Username | Created via `POST /v1/admin/users` |
| Password | Set at creation time |
| Role     | `TEACHER` |
| Header   | `X-Tenant-Id: <tenantId>` |

---

## Student

| Field    | Value |
|----------|-------|
| Username | Created via `POST /v1/admin/users` |
| Password | Set at creation time |
| Role     | `STUDENT` |
| Header   | `X-Tenant-Id: <tenantId>` |

---

## Parent

| Field    | Value |
|----------|-------|
| Username | Created via `POST /v1/admin/users` |
| Password | Set at creation time |
| Role     | `PARENT` |
| Header   | `X-Tenant-Id: <tenantId>` |

---

## Database (Local/Docker)

| Field    | Value |
|----------|-------|
| Host     | `localhost:5432` |
| Database | `cloudcampus` |
| Username | `cloudcampus` |
| Password | `cloudcampus_dev` |

---

## Redis (Local/Docker)

| Field | Value |
|-------|-------|
| Host  | `localhost:6379` |
| Auth  | None (dev only) |

---

## Frontend

| Field | Value |
|-------|-------|
| Dev server | `http://localhost:5174` (run `npm run dev` in `frontend/`) |
| Build | `npm run build` |

---

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `BOOTSTRAP_ADMIN_USERNAME` | `superadmin` | Super admin username (set once at first boot) |
| `BOOTSTRAP_ADMIN_PASSWORD` | *(empty — bootstrap skipped)* | Super admin password — must be set on first run |
| `JWT_SECRET` | `changeme-dev-secret-minimum-32-chars!!` | JWT signing secret — change in production |
| `SPRING_PROFILES_ACTIVE` | `dev` | Use `local` for Docker Postgres, `dev` for H2 |
| `DATABASE_URL` | *(set in profile yml)* | PostgreSQL JDBC URL |
| `MAIL_HOST` / `MAIL_PORT` | `localhost:1025` (MailHog in dev) | SMTP server |
| `APP_FIREBASE_ENABLED` | `false` | Enable Firebase push notifications |
