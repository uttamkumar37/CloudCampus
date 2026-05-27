# CloudCampus Rollback Guide

Rollback must be practiced in staging before production.

## Rollback Triggers

Rollback immediately when:

- Backend readiness does not recover.
- Login or MFA is broken.
- Tenant onboarding is broken.
- School access isolation is broken.
- Flyway migration failed and the app cannot start.
- A critical security regression is confirmed.
- Error rate is high after deployment.

## Before Rolling Back

Capture enough information for diagnosis:

```bash
date -u
docker compose -f docker-compose.prod.yml --env-file .env.production ps
docker compose -f docker-compose.prod.yml --env-file .env.production logs --tail=200 backend
docker compose -f docker-compose.prod.yml --env-file .env.production logs --tail=200 frontend
sudo tail -n 200 /var/log/nginx/error.log
```

## App Image Rollback

1. Identify the previous known-good backend and frontend image tags.
2. Edit the server-only env file:

```text
CLOUDCAMPUS_BACKEND_IMAGE=ghcr.io/<owner>/<repo>/backend:<previous-sha>
CLOUDCAMPUS_FRONTEND_IMAGE=ghcr.io/<owner>/<repo>/frontend:<previous-sha>
```

3. Pull and restart:

```bash
DEPLOY_ENV=production APP_DIR=/opt/cloudcampus sh infra/scripts/ec2-deploy-compose.sh
```

4. Run health checks:

```bash
BASE_URL=https://app.example.com
curl -fsS "$BASE_URL/actuator/health"
curl -fsS "$BASE_URL/actuator/health/readiness"
curl -fsS "$BASE_URL/"
```

## Database Rollback

Database rollback is not the same as app rollback.

Rules:

- Prefer backward-compatible Flyway migrations.
- Do not run destructive schema migrations without a tested restore path.
- Take a database backup before production deployment.
- If using RDS, use point-in-time recovery for true data rollback.
- If using embedded EC2 PostgreSQL for MVP, restore from the latest verified dump.

For embedded PostgreSQL backup before deploy:

```bash
COMPOSE_FILE=docker-compose.prod.yml sh scripts/ops/backup-local-postgres.sh
```

Restore drills should be performed in staging before production use.

## Frontend-Only Rollback

If only frontend is faulty:

1. Change `CLOUDCAMPUS_FRONTEND_IMAGE` to the previous image.
2. Restart frontend:

```bash
SERVICES=frontend DEPLOY_ENV=production APP_DIR=/opt/cloudcampus sh infra/scripts/ec2-deploy-compose.sh
```

3. Verify homepage, login modal, and role redirects.

## Backend-Only Rollback

If only backend is faulty and no incompatible migration was applied:

1. Change `CLOUDCAMPUS_BACKEND_IMAGE` to the previous image.
2. Restart backend:

```bash
SERVICES=backend DEPLOY_ENV=production APP_DIR=/opt/cloudcampus sh infra/scripts/ec2-deploy-compose.sh
```

3. Verify health, readiness, login, `/v1/me`, and onboarding.

## After Rollback

- Record failed release SHA.
- Record rollback target SHA.
- Save logs.
- Open a fix task.
- Do not redeploy until staging reproduces and verifies the fix.
