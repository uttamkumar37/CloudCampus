# CloudCampus Staging Readiness Checklist

Use this checklist before promoting any build beyond local development. Staging must prove the same production-oriented wiring that production will use, with staging-only domains and secrets.

## 1. Environment

- `SPRING_PROFILES_ACTIVE=staging`.
- `CLOUDCAMPUS_JDBC_URL` points to PostgreSQL, not H2.
- `CLOUDCAMPUS_AUTH_JWT_SECRET` is unique to staging, at least 64 characters, and not a placeholder.
- `CLOUDCAMPUS_AUTH_JWT_SECRET` is not the local `.env.example` secret and is not reused from production.
- `CLOUDCAMPUS_APP_BASE_URL` is the HTTPS staging frontend URL.
- `CLOUDCAMPUS_CORS_ALLOWED_ORIGINS` is explicitly set to the HTTPS staging frontend origin.
- `CLOUDCAMPUS_BOOTSTRAP_SUPER_ADMIN_ENABLED=false` for shared staging.
- `CLOUDCAMPUS_BOOTSTRAP_SUPER_ADMIN_PASSWORD` is blank for shared staging.
- `CLOUDCAMPUS_EMAIL_MODE=log` is allowed only for dry-run staging. Use `smtp` for invitation delivery tests.
- No real production secrets are used in staging.
- No local-only credentials are used in staging: `SuperAdmin123!`, `cloudcampus_local_password`, local JWT secrets, `jdbc:h2:*`, localhost-only app URLs, and wildcard CORS are all forbidden.

Local development exception:

- `.env.example` and `docker-compose.local.yml` may contain clearly marked local-only placeholders for developer convenience.
- Those values are never valid for shared staging, production, CI secrets, or a secret manager.

## 2. Compose and Container Checks

```bash
docker compose --env-file .env.staging -f docker-compose.staging.yml config >/tmp/cloudcampus-staging-compose.yml
docker compose --env-file .env.staging -f docker-compose.staging.yml pull
docker compose --env-file .env.staging -f docker-compose.staging.yml up -d
docker compose --env-file .env.staging -f docker-compose.staging.yml ps
```

Expected:

- PostgreSQL is healthy.
- Backend is healthy.
- Frontend is healthy.
- Backend port is bound to `127.0.0.1` only.
- PostgreSQL is not publicly exposed.

## 3. Health Checks

```bash
curl -fsS "$BACKEND_URL/actuator/health"
curl -fsS "$BACKEND_URL/actuator/health/readiness"
```

Expected:

- Both return HTTP 200.
- Response status is `UP`.
- Public reverse proxy exposes only the intended health endpoints.

## 4. Security Smoke Checks

- Unauthenticated `POST /v1/super-admin/tenants/onboard` is rejected.
- A non-SUPER_ADMIN token cannot onboard tenants.
- `X-Tenant-ID`, `X-School-ID`, and `X-Active-School-ID` spoofing headers are rejected on `/v1/**`.
- A School Admin from School A cannot access School B student, fee, attendance, exam/result, or notice data.
- `CLOUDCAMPUS_EMAIL_MODE=log` is not used when testing real invitation delivery.

## 5. Functional Smoke Checks

- Super Admin can log in and complete MFA.
- Super Admin can create a tenant with a real first school.
- School Admin invitation is created without logging a raw token.
- Invited School Admin can accept invitation, set password, log in, and activate the granted school.
- School Admin can open the main scaffold pages without 401/403 errors.

## 6. Frontend Checks

- Login modal points to the staging backend through same-origin proxy or `VITE_API_BASE_URL`.
- Dev Super Admin credential hint is not visible in staging build.
- Role routing shows only the authenticated user's portal.
- School selector lists only schools returned by `/v1/me/schools`.
- Browser console has no startup errors.

## 7. Promotion Gate

Do not promote staging to production until:

- Backend tests pass.
- Frontend tests, lint, typecheck, and build pass.
- Mobile lint/typecheck pass if mobile was touched.
- `sh scripts/ci/validate-ops.sh` passes.
- Docker images are built from immutable commit SHA tags.
- Staging smoke checks pass.
- Rollback image tags are documented.
- Database backup and restore drill has been run for the target environment.
