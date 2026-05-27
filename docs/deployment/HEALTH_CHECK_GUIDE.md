# CloudCampus Health-Check Guide

Use this guide after every deployment and before promoting staging to production.

## Required Endpoints

| Check | URL | Expected |
| --- | --- | --- |
| Backend health | `/actuator/health` | HTTP 200 and `status: UP` |
| Backend readiness | `/actuator/health/readiness` | HTTP 200 and `status: UP` |
| Frontend shell | `/` | HTTP 200 and rendered app shell |
| API proxy | `/v1/me` without token | HTTP 401 or 403, not 404 |

## Local Checks

```bash
curl -fsS http://localhost:18080/actuator/health
curl -fsS http://localhost:18080/actuator/health/readiness
curl -fsS http://localhost:18088/
curl -i http://localhost:18088/v1/me
```

## Staging Or Production Checks

```bash
BASE_URL=https://app.example.com
curl -fsS "$BASE_URL/actuator/health"
curl -fsS "$BASE_URL/actuator/health/readiness"
curl -fsS "$BASE_URL/"
curl -i "$BASE_URL/v1/me"
```

## Smoke Script

For public staging/prod URL:

```bash
BACKEND_URL=https://app.example.com FRONTEND_URL=https://app.example.com sh scripts/ops/smoke-staging.sh
```

For optional login check:

```bash
BACKEND_URL=https://app.example.com \
FRONTEND_URL=https://app.example.com \
CLOUDCAMPUS_SMOKE_EMAIL=staging-admin@example.com \
CLOUDCAMPUS_SMOKE_PASSWORD='staging-only-password' \
sh scripts/ops/smoke-staging.sh
```

## Docker Checks

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production ps
docker compose -f docker-compose.prod.yml --env-file .env.production logs --tail=100 backend
docker compose -f docker-compose.prod.yml --env-file .env.production logs --tail=100 frontend
docker compose -f docker-compose.prod.yml --env-file .env.production logs --tail=100 postgres
```

## Database Checks

The backend readiness check should fail if the database is unavailable. If readiness is failing, inspect:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec postgres pg_isready -U "$CLOUDCAMPUS_DB_USERNAME" -d "$CLOUDCAMPUS_DB_NAME"
docker compose -f docker-compose.prod.yml --env-file .env.production logs --tail=200 backend
```

## Failure Signals

Treat these as release blockers:

- `/actuator/health/readiness` is not `UP`.
- Frontend returns 502 or 504.
- `/v1/me` returns 404 through the public domain.
- Backend logs show Flyway migration failure.
- Backend logs show weak or missing auth secret.
- Nginx logs show repeated upstream failures.
- Login fails for a known-good staging account.

## Recovery

1. Check Docker service state.
2. Check backend logs.
3. Check Nginx logs.
4. Verify env file values.
5. Verify database connectivity.
6. If the issue is release-related, follow `docs/deployment/ROLLBACK_GUIDE.md`.
