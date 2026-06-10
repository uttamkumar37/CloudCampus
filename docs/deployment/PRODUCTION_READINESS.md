# Production Readiness Structure

## Ready

- Backend-only repository structure on `main`.
- Java 21 Spring Boot backend with Maven tests.
- Docker image build path in `backend/Dockerfile`.
- Local, staging, and production Compose files.
- Production startup validation for secrets, database, CORS, public URL, mail mode, bootstrap account, and actuator exposure.
- Smoke and preflight scripts under `scripts/deploy`.
- Backend CI workflow under `.github/workflows/backend-ci.yml`.

## Still Required Before Real Production Traffic

- Real `.env.production` stored outside git.
- HTTPS reverse proxy or cloud load balancer.
- Real PostgreSQL backup/restore runbook tested against a staging restore.
- Container image publishing to a private or trusted registry.
- Monitoring and alerting for health, logs, database disk, JVM memory, and failed logins.
- External SMTP credentials or a transactional email provider.
- Domain-specific CORS allow-list.

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
