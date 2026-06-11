# Production Readiness Structure

## Ready

- Modular backend plus React/Vite frontend structure on `main`.
- Java 21 Spring Boot backend with Maven tests.
- React/Vite frontend with production build validation and staging/production API-base templates.
- Docker image build path in `backend/Dockerfile`.
- Local, staging, and production Compose files.
- Production startup validation for secrets, database, CORS, public URL, mail mode, bootstrap account, MFA-code exposure, and actuator exposure.
- Production startup validation rejects MFA-code exposure in API login responses.
- OpenAPI contract generated at `/v3/api-docs`, committed in `docs/api/openapi.yaml`, and verified in CI.
- Request correlation is centralized through `CorrelationIdFilter`; responses include `X-Correlation-Id`.
- Route authorization metadata is centralized in `RoutePolicyRegistry`, enforced by `RoutePolicyEnforcementInterceptor`, and verified by `RouteAuthorizationMatrixTest` plus runtime interceptor tests.
- Shared `AuthorizationGuard` foundation exists for tenant, school, parent/student, student-self, teacher-assignment, and finance boundaries.
- Smoke and preflight scripts under `scripts/deploy`.
- Backend CI workflow under `.github/workflows/backend-ci.yml`.

## Production Shape

- `backend/Dockerfile` builds a Java 21 runtime image.
- `docker-compose.prod.yml` runs PostgreSQL and the backend on a private Docker network.
- The backend binds to `127.0.0.1:${CLOUDCAMPUS_BACKEND_PORT:-18080}` so a reverse proxy or load balancer can terminate HTTPS in front of it.
- The frontend builds to static files under `frontend/dist`; deploy those files through HTTPS static hosting or a reverse proxy.
- `frontend/.env.production.example` and `frontend/.env.staging.example` define `VITE_CLOUDCAMPUS_API_BASE_URL` for build-time API routing.
- Production startup validation fails fast when unsafe secrets, local databases, placeholder domains, wildcard CORS, or unsafe actuator exposure are detected.
- Client-supplied tenant/school context headers are rejected, while correlation IDs are preserved or generated before the rejection response is written.
- `/v1/**` requests pass through route policy enforcement: public auth/readiness routes remain open, protected routes require `RequestContext`, role namespaces require matching roles, and unknown versioned routes fail closed.

## Still Required Before Real Production Traffic

- Real `.env.production` stored outside git.
- Real frontend build environment with `VITE_CLOUDCAMPUS_API_BASE_URL=https://api.your-domain.example`.
- HTTPS reverse proxy or cloud load balancer.
- Real PostgreSQL backup/restore runbook tested against a staging restore.
- Container image publishing to a private or trusted registry.
- Monitoring and alerting for health, logs, database disk, JVM memory, and failed logins.
- Structured log pipeline that indexes `correlationId` from MDC and response headers.
- External SMTP credentials or a transactional email provider.
- `CLOUDCAMPUS_AUTH_EXPOSE_MFA_CODE=false` outside local developer demos.
- Domain-specific CORS allow-list that includes the frontend origin, not the API origin.
- Product sign-off before enabling Swagger UI in production; it is disabled by default.

## Suggested Server Layout

```text
/opt/cloudcampus/
  app/
    docker-compose.prod.yml
    .env.production
  backups/
  releases/
```

Keep `.env.production` readable only by the deploy user.

Required server files are not committed:

- `.env.production`
- optional TLS/reverse-proxy config managed outside this repo
- backup destination outside the application working tree

Start from `.env.production.example` and replace every placeholder.

## Release Checklist

1. Build and test:

   ```bash
   cd frontend && npm ci && npm run typecheck && npm run build
   cd ..
   make test
   make image
   ```

2. Prepare production env:

   ```bash
   cp .env.production.example .env.production
   # edit .env.production with real values
   ./scripts/deploy/preflight.sh prod
   ```

3. Deploy:

   ```bash
   # Publish frontend/dist to HTTPS static hosting or your reverse proxy.
   docker compose --env-file .env.production -f docker-compose.prod.yml pull
   docker compose --env-file .env.production -f docker-compose.prod.yml up -d
   ./scripts/deploy/smoke.sh https://api.your-domain.example
   ```

4. Verify:

   - `/actuator/health/readiness` returns healthy.
   - `/v1/system/readiness` returns `UP`.
   - API responses include `X-Correlation-Id`.
   - Logs do not show production validation failures.
   - Route authorization matrix, route enforcement, and guard tests pass in CI.
   - Database backup job is configured and restore has been tested.

## Rollback

Pin `CLOUDCAMPUS_BACKEND_IMAGE` in `.env.production` to the previous known-good image and run:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
./scripts/deploy/smoke.sh https://api.your-domain.example
```

Schema migrations are forward-only. If a release includes migrations, test rollback on staging before production.

## Backup

For the bundled PostgreSQL deployment:

```bash
./scripts/deploy/backup-postgres.sh .env.production /secure/backups/cloudcampus
```

For managed PostgreSQL, prefer the provider's automated backups and point-in-time recovery. Keep this script only as an extra manual export.
