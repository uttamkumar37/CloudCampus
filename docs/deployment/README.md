# CloudCampus Backend Deployment

This repository is backend-only on `main`. The deployable unit is the Spring Boot backend container plus PostgreSQL.

## Production Shape

- `backend/Dockerfile` builds a Java 21 runtime image.
- `docker-compose.prod.yml` runs PostgreSQL and the backend on a private Docker network.
- The backend binds to `127.0.0.1:${CLOUDCAMPUS_BACKEND_PORT:-18080}` so a reverse proxy or load balancer can terminate HTTPS in front of it.
- Production startup validation fails fast when unsafe secrets, local databases, placeholder domains, wildcard CORS, or unsafe actuator exposure are detected.

## Required Server Files

Create these files on the server. Do not commit them:

- `.env.production`
- optional TLS/reverse-proxy config managed outside this repo
- backup destination outside the application working tree

Start from `.env.production.example` and replace every placeholder.

## Release Checklist

1. Build and test:

   ```bash
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
   docker compose --env-file .env.production -f docker-compose.prod.yml pull
   docker compose --env-file .env.production -f docker-compose.prod.yml up -d
   ./scripts/deploy/smoke.sh https://api.your-domain.example
   ```

4. Verify:

   - `/actuator/health/readiness` returns healthy.
   - `/v1/system/readiness` returns `UP`.
   - Logs do not show production validation failures.
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
