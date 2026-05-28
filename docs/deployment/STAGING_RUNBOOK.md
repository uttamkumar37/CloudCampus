# CloudCampus Staging Runbook

Date: 2026-05-28  
Purpose: controlled EC2/Docker staging deployment and verification. This runbook does not add product features and does not change business logic.

## 1. Target Architecture

MVP staging shape:

- One Ubuntu EC2 host.
- Host Nginx terminates HTTPS on ports `80` and `443`.
- Docker Compose runs PostgreSQL, backend, and frontend.
- PostgreSQL is private inside Docker networking.
- Backend is mapped to `127.0.0.1:18080` only.
- Frontend container is mapped to `127.0.0.1:18088` only.
- Public users reach only Nginx at `https://staging.<your-domain>`.
- Frontend calls backend through same-origin `/v1/*` Nginx proxy.

## 2. EC2 Instance Requirement

Recommended minimum:

- Ubuntu 24.04 LTS.
- `t3.small` for light staging; `t3.medium` preferred.
- 30 GB gp3 disk minimum.
- Elastic IP recommended.
- DNS record such as `staging.cloudcampus.example` pointing to the Elastic IP.
- SSH access through a trusted admin IP or AWS SSM Session Manager.

## 3. Security Group Rules

Inbound:

| Port | Source | Purpose |
| --- | --- | --- |
| `22` | trusted admin IP only | SSH administration |
| `80` | `0.0.0.0/0`, `::/0` | HTTP redirect and Certbot challenge |
| `443` | `0.0.0.0/0`, `::/0` | HTTPS application traffic |

Do not expose:

- PostgreSQL `5432`.
- Backend `8080` or mapped `18080`.
- Frontend container `80` or mapped `18088`.
- Any future Redis/RabbitMQ/storage ports.

## 4. Docker Installation

Use the existing bootstrap script:

```bash
sudo apt-get update
sudo apt-get install -y git
git clone https://github.com/<owner>/<repo>.git /tmp/cloudcampus
cd /tmp/cloudcampus
sudo sh infra/scripts/ec2-bootstrap-ubuntu.sh
```

The script installs Docker, Docker Compose plugin, Nginx, Certbot, UFW, unattended upgrades, creates the `cloudcampus` app user, prepares `/opt/cloudcampus`, and configures Docker log rotation.

Copy the repo into the app directory:

```bash
sudo rsync -a --delete /tmp/cloudcampus/ /opt/cloudcampus/
sudo chown -R cloudcampus:cloudcampus /opt/cloudcampus
sudo -iu cloudcampus
cd /opt/cloudcampus
```

## 5. Environment Variable Setup

Create the server-only staging env file:

```bash
cp .env.staging.example .env.staging
chmod 600 .env.staging
nano .env.staging
```

Required staging values:

```text
SPRING_PROFILES_ACTIVE=staging

CLOUDCAMPUS_DB_NAME=cloudcampus
CLOUDCAMPUS_DB_USERNAME=cloudcampus
CLOUDCAMPUS_DB_PASSWORD=<strong-staging-db-password>

CLOUDCAMPUS_JDBC_URL=jdbc:postgresql://postgres:5432/cloudcampus
CLOUDCAMPUS_JDBC_DRIVER=org.postgresql.Driver
CLOUDCAMPUS_JDBC_USERNAME=cloudcampus
CLOUDCAMPUS_JDBC_PASSWORD=<same-as-db-password>

CLOUDCAMPUS_AUTH_JWT_SECRET=<64-plus-character-random-staging-secret>
CLOUDCAMPUS_EMAIL_MODE=log
CLOUDCAMPUS_EMAIL_FROM=no-reply@staging.<your-domain>
CLOUDCAMPUS_APP_BASE_URL=https://staging.<your-domain>
CLOUDCAMPUS_FRONTEND_ORIGIN=https://staging.<your-domain>
CLOUDCAMPUS_CORS_ALLOWED_ORIGINS=https://staging.<your-domain>

CLOUDCAMPUS_BOOTSTRAP_SUPER_ADMIN_ENABLED=false
CLOUDCAMPUS_BOOTSTRAP_SUPER_ADMIN_EMAIL=
CLOUDCAMPUS_BOOTSTRAP_SUPER_ADMIN_PASSWORD=

CLOUDCAMPUS_BACKEND_PORT=18080
CLOUDCAMPUS_FRONTEND_PORT=18088
CLOUDCAMPUS_BACKEND_IMAGE=ghcr.io/<owner>/<repo>/backend:<commit-sha>
CLOUDCAMPUS_FRONTEND_IMAGE=ghcr.io/<owner>/<repo>/frontend:<commit-sha>
VITE_API_BASE_URL=
```

Forbidden in staging:

- `SuperAdmin123!`
- `cloudcampus_local_password`
- local JWT secrets from `.env.example`
- `jdbc:h2:*`
- wildcard CORS
- `localhost` public URLs
- production secrets

## 6. Strong JWT Secret Setup

Generate a staging-only secret:

```bash
openssl rand -base64 64
```

Paste it into:

```text
CLOUDCAMPUS_AUTH_JWT_SECRET=<generated-value>
```

Do not reuse local or production JWT secrets.

## 7. Staging PostgreSQL Setup

For MVP staging, `docker-compose.staging.yml` runs PostgreSQL 16 in Docker with a named volume:

```text
cloudcampus-staging-postgres-data
```

Validate the DB config:

```bash
docker compose --env-file .env.staging -f docker-compose.staging.yml config >/tmp/cloudcampus-staging-compose.yml
grep -n "jdbc:postgresql://postgres:5432/cloudcampus" /tmp/cloudcampus-staging-compose.yml
```

After startup:

```bash
docker compose --env-file .env.staging -f docker-compose.staging.yml exec postgres \
  pg_isready -U "$CLOUDCAMPUS_DB_USERNAME" -d "$CLOUDCAMPUS_DB_NAME"
```

Before pilot, run and document a backup/restore drill for this staging DB or move staging to managed PostgreSQL.

## 8. Frontend URL, Backend URL, and CORS

Recommended same-origin staging:

```text
Frontend URL: https://staging.<your-domain>
Backend URL:  https://staging.<your-domain>
CORS:         https://staging.<your-domain>
```

Set:

```text
CLOUDCAMPUS_APP_BASE_URL=https://staging.<your-domain>
CLOUDCAMPUS_FRONTEND_ORIGIN=https://staging.<your-domain>
CLOUDCAMPUS_CORS_ALLOWED_ORIGINS=https://staging.<your-domain>
VITE_API_BASE_URL=
```

CORS check after deployment:

```bash
curl -i -H "Origin: https://staging.<your-domain>" \
  https://staging.<your-domain>/v1/me
```

Expected unauthenticated response can be `401`, but CORS headers must allow the staging origin.

## 9. Mail Mode Setup

Dry-run staging:

```text
CLOUDCAMPUS_EMAIL_MODE=log
CLOUDCAMPUS_ALLOW_LOG_EMAIL_IN_PRODUCTION=true
```

Use this only for internal deployment validation.

Invitation-delivery staging:

```text
CLOUDCAMPUS_EMAIL_MODE=smtp
CLOUDCAMPUS_SMTP_HOST=<staging-smtp-host>
CLOUDCAMPUS_SMTP_PORT=587
CLOUDCAMPUS_SMTP_USERNAME=<staging-smtp-username>
CLOUDCAMPUS_SMTP_PASSWORD=<staging-smtp-password>
CLOUDCAMPUS_SMTP_AUTH=true
CLOUDCAMPUS_SMTP_STARTTLS=true
```

Never use production SMTP credentials in staging.

## 10. Nginx Setup

Install host config:

```bash
sudo cp /opt/cloudcampus/infra/nginx/cloudcampus.conf /etc/nginx/conf.d/cloudcampus.conf
sudo sed -i 's/app.cloudcampus.example/staging.<your-domain>/g' /etc/nginx/conf.d/cloudcampus.conf
```

Issue TLS certificate:

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d staging.<your-domain>
sudo nginx -t
sudo systemctl reload nginx
```

Nginx should proxy:

- `/` to `127.0.0.1:18088`
- `/v1/*` to `127.0.0.1:18080`
- `/actuator/health` to `127.0.0.1:18080`
- `/actuator/health/readiness` to `127.0.0.1:18080`

## 11. Deployment Commands

Dry-run:

```bash
cd /opt/cloudcampus
DRY_RUN=true DEPLOY_ENV=staging APP_DIR=/opt/cloudcampus sh infra/scripts/ec2-deploy-compose.sh
```

Deploy:

```bash
cd /opt/cloudcampus
DEPLOY_ENV=staging APP_DIR=/opt/cloudcampus sh infra/scripts/ec2-deploy-compose.sh
```

If pulling from GHCR:

```bash
echo "<github-token>" | docker login ghcr.io -u <github-username> --password-stdin
```

Manual compose fallback:

```bash
docker compose --env-file .env.staging -f docker-compose.staging.yml pull
docker compose --env-file .env.staging -f docker-compose.staging.yml up -d
docker compose --env-file .env.staging -f docker-compose.staging.yml ps
```

## 12. Health Check Commands

Local-on-host checks:

```bash
curl -fsS http://127.0.0.1:18080/actuator/health
curl -fsS http://127.0.0.1:18080/actuator/health/readiness
curl -fsS http://127.0.0.1:18088/
```

Public checks:

```bash
BASE_URL=https://staging.<your-domain>
curl -fsS "$BASE_URL/actuator/health"
curl -fsS "$BASE_URL/actuator/health/readiness"
curl -fsS "$BASE_URL/"
```

Automated smoke:

```bash
BACKEND_URL=https://staging.<your-domain> \
FRONTEND_URL=https://staging.<your-domain> \
sh scripts/ops/smoke-staging.sh
```

Optional login smoke:

```bash
BACKEND_URL=https://staging.<your-domain> \
FRONTEND_URL=https://staging.<your-domain> \
CLOUDCAMPUS_SMOKE_EMAIL=<staging-super-admin-email> \
CLOUDCAMPUS_SMOKE_PASSWORD='<staging-super-admin-password>' \
sh scripts/ops/smoke-staging.sh
```

## 13. Functional Smoke Flow

Run through the UI at `https://staging.<your-domain>`:

1. Backend health returns `UP`.
2. Backend readiness returns `UP`.
3. Frontend loads.
4. Super Admin login succeeds.
5. MFA challenge/verification succeeds.
6. Super Admin creates a tenant with a real first school.
7. School Admin invitation is generated or sent.
8. School Admin accepts invitation and sets password.
9. School Admin login succeeds.
10. School Admin activates assigned school if prompted.
11. School Admin creates one academic setup item, such as an academic year.
12. School Admin creates one student or one fee demand.
13. Logout succeeds.

Record each result in `docs/audit/STAGING_SMOKE_TEST_REPORT.md`.

## 14. Log Check Commands

```bash
docker compose --env-file .env.staging -f docker-compose.staging.yml ps
docker compose --env-file .env.staging -f docker-compose.staging.yml logs --tail=200 backend
docker compose --env-file .env.staging -f docker-compose.staging.yml logs --tail=200 frontend
docker compose --env-file .env.staging -f docker-compose.staging.yml logs --tail=200 postgres
sudo journalctl -u nginx --since "30 minutes ago" --no-pager
sudo tail -n 200 /var/log/nginx/error.log
```

Look for:

- Backend production-readiness validation failures.
- Flyway migration errors.
- PostgreSQL authentication/connection errors.
- CORS rejections.
- Nginx upstream connection failures.
- Invitation token/password/MFA secret leakage in logs.

## 15. Rollback Commands

Before deploying, record current images:

```bash
grep -E 'CLOUDCAMPUS_(BACKEND|FRONTEND)_IMAGE' .env.staging
docker compose --env-file .env.staging -f docker-compose.staging.yml images
```

Rollback both services:

```bash
nano .env.staging
# restore previous CLOUDCAMPUS_BACKEND_IMAGE and CLOUDCAMPUS_FRONTEND_IMAGE
DEPLOY_ENV=staging APP_DIR=/opt/cloudcampus sh infra/scripts/ec2-deploy-compose.sh
```

Rollback one service:

```bash
SERVICES=backend DEPLOY_ENV=staging APP_DIR=/opt/cloudcampus sh infra/scripts/ec2-deploy-compose.sh
SERVICES=frontend DEPLOY_ENV=staging APP_DIR=/opt/cloudcampus sh infra/scripts/ec2-deploy-compose.sh
```

Stop stack if needed:

```bash
docker compose --env-file .env.staging -f docker-compose.staging.yml down
```

Do not remove volumes during rollback unless explicitly restoring from backup:

```bash
# Dangerous: deletes staging DB volume. Use only for disposable staging reset.
docker compose --env-file .env.staging -f docker-compose.staging.yml down -v
```

## 16. Manual EC2 Actions Required

The repository is ready for the staging attempt. An operator must still provide:

- EC2 instance.
- Security group.
- Domain/DNS.
- TLS certificate.
- GHCR access or local image build.
- Server-only `.env.staging` with real staging secrets.
- Controlled staging Super Admin account.
- Optional SMTP provider credentials for invitation delivery proof.

Stop after these steps and update `docs/audit/STAGING_SMOKE_TEST_REPORT.md` with the exact smoke-test results.
