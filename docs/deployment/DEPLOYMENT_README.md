# CloudCampus Deployment README

This guide describes the EC2 Docker MVP deployment path. For production scale, move PostgreSQL to RDS and move frontend/backend workloads to CloudFront/ECS when traffic and reliability requirements justify it.

## Files

| File | Purpose |
| --- | --- |
| `docker-compose.local.yml` | Local full-stack Docker deployment with PostgreSQL, backend, and frontend |
| `docker-compose.staging.yml` | Staging EC2 Docker deployment with internal PostgreSQL |
| `docker-compose.prod.yml` | Production EC2 Docker MVP deployment with private PostgreSQL and localhost-only app ports |
| `.env.example` | Local template |
| `.env.staging.example` | Staging template |
| `.env.production.example` | Production template |
| `infra/nginx/cloudcampus.conf` | Host Nginx reverse proxy with HTTPS, secure headers, health routing, and API rate limits |
| `infra/scripts/ec2-bootstrap-ubuntu.sh` | Ubuntu EC2 bootstrap script for Docker, Nginx, Certbot, app user, app directory, firewall, and log rotation |
| `infra/scripts/ec2-deploy-compose.sh` | EC2 compose deployment helper for staging and production |
| `docs/deployment/HEALTH_CHECK_GUIDE.md` | Health and smoke validation |
| `docs/deployment/ROLLBACK_GUIDE.md` | Rollback process |

## Local Docker Run

Local development is allowed to use clearly marked placeholder credentials from `.env.example`, including the local-only bootstrap Super Admin account. These values are for developer machines only.

Local-only account:

```text
Email: superadmin@cloudcampus.dev
Password: SuperAdmin123!
```

Do not copy the local database password, local JWT secret, or local bootstrap credentials into `.env.staging`, `.env.production`, GitHub Actions secrets, EC2 user data, or a secret manager.

```bash
cp .env.example .env
docker compose -f docker-compose.local.yml up -d --build
curl -fsS http://localhost:18080/actuator/health
curl -fsS http://localhost:18080/actuator/health/readiness
open http://localhost:18088
```

To stop:

```bash
docker compose -f docker-compose.local.yml down
```

To remove local database data:

```bash
docker compose -f docker-compose.local.yml down -v
```

## EC2 Staging Deployment

1. Provision Ubuntu 24.04 LTS EC2.
2. Restrict inbound security group:
   - 80 and 443 from the internet.
   - 22 only from trusted admin IPs, or use AWS SSM Session Manager.
   - Do not expose 5432 or 8080.
3. Clone or copy the repository to the server.
4. Run the bootstrap script:

```bash
sudo sh infra/scripts/ec2-bootstrap-ubuntu.sh
```

The script installs Docker, Docker Compose, Nginx, Certbot, UFW, unattended upgrades, creates a `cloudcampus` app user, prepares `/opt/cloudcampus`, and adds Docker log rotation.

5. Clone or move the repository to `/opt/cloudcampus`.
6. Copy `.env.staging.example` to `.env.staging` on the server.
7. Replace all staging placeholder values.
8. Pull or build images.
9. Validate deployment config:

```bash
DRY_RUN=true DEPLOY_ENV=staging APP_DIR=/opt/cloudcampus sh infra/scripts/ec2-deploy-compose.sh
```

10. Start services:

```bash
DEPLOY_ENV=staging APP_DIR=/opt/cloudcampus sh infra/scripts/ec2-deploy-compose.sh
```

11. Copy `infra/nginx/cloudcampus.conf` to `/etc/nginx/conf.d/cloudcampus.conf`.
12. Replace `app.cloudcampus.example` with the staging domain.
13. Test and reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

14. Issue a certificate:

```bash
sudo certbot --nginx -d staging.cloudcampus.example
```

15. Run health checks from `docs/deployment/HEALTH_CHECK_GUIDE.md`.

Staging secret policy:

- Use `SPRING_PROFILES_ACTIVE=staging`.
- Use a staging-only PostgreSQL password.
- Use a staging-only JWT secret of at least 64 random characters.
- Use explicit HTTPS CORS origins for the staging frontend only.
- Keep `CLOUDCAMPUS_BOOTSTRAP_SUPER_ADMIN_ENABLED=false` on shared staging.
- Keep `CLOUDCAMPUS_BOOTSTRAP_SUPER_ADMIN_PASSWORD` blank on shared staging.
- `CLOUDCAMPUS_EMAIL_MODE=log` is allowed only for dry-run staging. Use `smtp` for real invitation/password-reset delivery tests.
- Never use `SuperAdmin123!`, local DB passwords, local JWT secrets, production secrets, H2 URLs, wildcard CORS, or localhost-only URLs in shared staging.

## EC2 Production Deployment

Production is the same shape as staging, with stronger controls:

- Use `.env.production` from a secret manager or server-only file.
- Keep `CLOUDCAMPUS_BOOTSTRAP_SUPER_ADMIN_ENABLED=false`.
- Keep `CLOUDCAMPUS_BOOTSTRAP_SUPER_ADMIN_PASSWORD` blank.
- Use a strong unique `CLOUDCAMPUS_AUTH_JWT_SECRET`.
- Use SMTP mode with real provider credentials.
- Use a production domain and HTTPS.
- Enable backups before deployment.
- Prefer RDS PostgreSQL. If using embedded EC2 PostgreSQL for MVP, schedule backups and restore drills.
- Never use local placeholders, local-only bootstrap credentials, H2/local database URLs, wildcard CORS, empty secrets, or log-only mail mode in production.

Start production:

```bash
DRY_RUN=true DEPLOY_ENV=production APP_DIR=/opt/cloudcampus sh infra/scripts/ec2-deploy-compose.sh
DEPLOY_ENV=production APP_DIR=/opt/cloudcampus sh infra/scripts/ec2-deploy-compose.sh
```

## Image Publishing

The deployment workflow builds backend and frontend images. Use immutable tags based on commit SHA for staging and production.

Recommended registry:

```text
ghcr.io/<owner>/<repo>/backend:<commit-sha>
ghcr.io/<owner>/<repo>/frontend:<commit-sha>
```

Set these in the server env file:

```text
CLOUDCAMPUS_BACKEND_IMAGE=ghcr.io/<owner>/<repo>/backend:<commit-sha>
CLOUDCAMPUS_FRONTEND_IMAGE=ghcr.io/<owner>/<repo>/frontend:<commit-sha>
```

Or pass them only for the current deploy:

```bash
CLOUDCAMPUS_BACKEND_IMAGE=ghcr.io/<owner>/<repo>/backend:<commit-sha> \
CLOUDCAMPUS_FRONTEND_IMAGE=ghcr.io/<owner>/<repo>/frontend:<commit-sha> \
DEPLOY_ENV=staging \
APP_DIR=/opt/cloudcampus \
sh infra/scripts/ec2-deploy-compose.sh
```

## Required Post-Deploy Smoke Checks

```bash
curl -fsS https://app.example.com/actuator/health
curl -fsS https://app.example.com/actuator/health/readiness
curl -fsS https://app.example.com/
```

Optional login smoke:

```bash
BACKEND_URL=https://app.example.com \
FRONTEND_URL=https://app.example.com \
CLOUDCAMPUS_SMOKE_EMAIL=staging-admin@example.com \
CLOUDCAMPUS_SMOKE_PASSWORD='staging-only-password' \
sh scripts/ops/smoke-staging.sh
```

## Production Notes

- Frontend uses same-origin `/v1/...` API routes by default. This works through Nginx.
- If frontend moves to S3/CloudFront, Amplify, or Vercel, route `/v1/*` to the backend or set `VITE_API_BASE_URL` during frontend build.
- PostgreSQL must never be public.
- Backend 8080 must stay bound to localhost or private networking only.
- Do not commit `.env.staging` or `.env.production`.
