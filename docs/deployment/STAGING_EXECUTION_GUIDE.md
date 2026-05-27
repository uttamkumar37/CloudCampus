# CloudCampus Staging Execution Guide

This guide walks through a real EC2/Docker staging deployment for CloudCampus. It does not deploy automatically and does not require committing secrets. Use it after CI passes and before any production release.

Recommended staging shape:

- One Ubuntu EC2 host for MVP staging.
- Host Nginx terminates HTTPS on ports 80/443.
- Docker Compose runs PostgreSQL, backend, and frontend.
- Backend and frontend containers bind only to `127.0.0.1`.
- Public users reach only Nginx.
- Frontend uses same-origin `/v1/*` API calls through Nginx.

## 1. Local Readiness Verified

The following checks were run from the repo before writing this guide:

```bash
docker compose --env-file .env.staging.example -f docker-compose.staging.yml config >/tmp/cloudcampus-staging-compose.yml
sh -n infra/scripts/ec2-bootstrap-ubuntu.sh
sh -n infra/scripts/ec2-deploy-compose.sh
sh -n scripts/ops/smoke-staging.sh
cd backend && mvn -q -DskipTests package
cd frontend && npm run build
docker build -f backend/Dockerfile -t cloudcampus-backend:staging-readiness .
docker build -f frontend/Dockerfile -t cloudcampus-frontend:staging-readiness .
docker run --rm --add-host backend:127.0.0.1 \
  -v "$PWD/infra/docker/frontend/nginx.conf:/etc/nginx/conf.d/default.conf:ro" \
  nginx:1.27-alpine nginx -t
```

Result:

- Compose staging config renders.
- Backend build passes.
- Frontend build passes with the known Vite large chunk warning.
- Backend Docker image builds.
- Frontend Docker image builds.
- Frontend container Nginx syntax validates when the compose service name `backend` is resolvable.
- Deployment scripts pass shell syntax validation.

## 2. EC2 Requirements

Recommended MVP instance:

- Ubuntu 24.04 LTS.
- `t3.small` minimum for light staging; `t3.medium` preferred.
- 30 GB gp3 disk minimum.
- Elastic IP recommended.
- Domain such as `staging.cloudcampus.example` pointing to the EC2 public IP.

Security group inbound rules:

| Port | Source | Purpose |
| --- | --- | --- |
| 22 | Your office/VPN IP only | SSH administration |
| 80 | `0.0.0.0/0`, `::/0` | HTTP redirect and Certbot challenge |
| 443 | `0.0.0.0/0`, `::/0` | HTTPS app traffic |

Do not expose:

- PostgreSQL `5432`.
- Backend `8080` or mapped `18080`.
- Frontend container `80` or mapped `18088`.
- Redis/RabbitMQ future ports.

## 3. Required GitHub Settings

If using `.github/workflows/deploy.yml`, configure the `staging` environment with:

```text
STAGING_HOST=<ec2-public-dns-or-ip>
STAGING_SSH_USER=ubuntu
STAGING_SSH_PRIVATE_KEY=<private key with server access>
STAGING_DEPLOY_PATH=/opt/cloudcampus
STAGING_BASE_URL=https://staging.cloudcampus.example
```

The workflow builds and scans backend/frontend images, pushes them to GHCR when requested, SSHes to the host, and runs `infra/scripts/ec2-deploy-compose.sh`.

## 4. Bootstrap EC2

SSH into the host:

```bash
ssh ubuntu@<ec2-public-ip>
```

Install system dependencies, Docker, Nginx, Certbot, UFW, the app user, backup directory, and log rotation:

```bash
sudo apt-get update
sudo apt-get install -y git
git clone https://github.com/<owner>/<repo>.git /tmp/cloudcampus
cd /tmp/cloudcampus
sudo sh infra/scripts/ec2-bootstrap-ubuntu.sh
```

Move or clone the repo into the app directory:

```bash
sudo rsync -a --delete /tmp/cloudcampus/ /opt/cloudcampus/
sudo chown -R cloudcampus:cloudcampus /opt/cloudcampus
```

Switch to the app user:

```bash
sudo -iu cloudcampus
cd /opt/cloudcampus
```

## 5. Create Staging Env

Create the server-only env file:

```bash
cp .env.staging.example .env.staging
chmod 600 .env.staging
```

Edit `.env.staging` and replace every placeholder:

```bash
nano .env.staging
```

Required values:

```text
SPRING_PROFILES_ACTIVE=staging

CLOUDCAMPUS_DB_NAME=cloudcampus
CLOUDCAMPUS_DB_USERNAME=cloudcampus
CLOUDCAMPUS_DB_PASSWORD=<strong-staging-db-password>

CLOUDCAMPUS_JDBC_URL=jdbc:postgresql://postgres:5432/cloudcampus
CLOUDCAMPUS_JDBC_DRIVER=org.postgresql.Driver
CLOUDCAMPUS_JDBC_USERNAME=cloudcampus
CLOUDCAMPUS_JDBC_PASSWORD=<same-as-db-password>

CLOUDCAMPUS_AUTH_JWT_SECRET=<64-plus-character-staging-secret>
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

Generate a JWT secret:

```bash
openssl rand -base64 64
```

Mail mode:

- Use `CLOUDCAMPUS_EMAIL_MODE=log` only for dry-run staging.
- Use `smtp` when verifying real invitation delivery.
- Never use production SMTP credentials in staging.

Bootstrap:

- Keep `CLOUDCAMPUS_BOOTSTRAP_SUPER_ADMIN_ENABLED=false` on shared staging.
- Create or import a staging Super Admin through a controlled one-time process before functional testing.
- Do not leave bootstrap passwords in `.env.staging`.

## 6. Validate Compose Before Starting

Run:

```bash
docker compose --env-file .env.staging -f docker-compose.staging.yml config >/tmp/cloudcampus-staging-compose.yml
grep -n "127.0.0.1" /tmp/cloudcampus-staging-compose.yml
grep -n "CLOUDCAMPUS_CORS_ALLOWED_ORIGINS" /tmp/cloudcampus-staging-compose.yml
grep -n "jdbc:postgresql://postgres:5432/cloudcampus" /tmp/cloudcampus-staging-compose.yml
```

Expected:

- Backend binds to `127.0.0.1:18080`.
- Frontend binds to `127.0.0.1:18088`.
- PostgreSQL has no public port mapping.
- CORS origin is the HTTPS staging domain.
- JDBC URL points to the compose PostgreSQL service.

## 7. Configure Host Nginx

As root, copy the template:

```bash
sudo cp /opt/cloudcampus/infra/nginx/cloudcampus.conf /etc/nginx/conf.d/cloudcampus.conf
```

Replace `app.cloudcampus.example` with the staging domain:

```bash
sudo sed -i 's/app.cloudcampus.example/staging.<your-domain>/g' /etc/nginx/conf.d/cloudcampus.conf
```

Before certificates exist, Certbot can edit the Nginx config automatically:

```bash
sudo certbot --nginx -d staging.<your-domain>
```

Then validate and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Nginx should proxy:

- `/` to frontend on `127.0.0.1:18088`.
- `/v1/*` to backend on `127.0.0.1:18080`.
- `/actuator/health` and `/actuator/health/readiness` to backend.

## 8. Deploy Images

Option A: GitHub Actions.

1. Open `CloudCampus Deploy`.
2. Choose `environment=staging`.
3. Use `image_tag=<commit-sha>`.
4. Set `push_images=true`.
5. Set `deploy=true`.
6. Run workflow.

Option B: manual server deploy.

```bash
cd /opt/cloudcampus
DEPLOY_ENV=staging APP_DIR=/opt/cloudcampus DRY_RUN=true sh infra/scripts/ec2-deploy-compose.sh
DEPLOY_ENV=staging APP_DIR=/opt/cloudcampus sh infra/scripts/ec2-deploy-compose.sh
```

If GHCR images are private, log in first:

```bash
echo "<github-token>" | docker login ghcr.io -u <github-username> --password-stdin
```

## 9. Verify Containers

```bash
docker compose --env-file .env.staging -f docker-compose.staging.yml ps
docker compose --env-file .env.staging -f docker-compose.staging.yml logs --tail=100 backend
docker compose --env-file .env.staging -f docker-compose.staging.yml logs --tail=100 frontend
docker compose --env-file .env.staging -f docker-compose.staging.yml logs --tail=100 postgres
```

Expected:

- `postgres` is healthy.
- `backend` is healthy.
- `frontend` is healthy.
- Backend logs show Flyway migrations completed.
- Backend logs do not show production validation failures.

## 10. Health Checks

From the EC2 host:

```bash
curl -fsS http://127.0.0.1:18080/actuator/health
curl -fsS http://127.0.0.1:18080/actuator/health/readiness
curl -fsS http://127.0.0.1:18088/
```

From your local machine:

```bash
BASE_URL=https://staging.<your-domain>
curl -fsS "$BASE_URL/actuator/health"
curl -fsS "$BASE_URL/actuator/health/readiness"
curl -fsS "$BASE_URL/"
```

Expected:

- Health returns HTTP 200.
- Readiness returns HTTP 200.
- Frontend returns the CloudCampus homepage.
- Browser URL is HTTPS.

## 11. API and CORS Verification

From local machine:

```bash
BASE_URL=https://staging.<your-domain>

curl -i -X OPTIONS "$BASE_URL/v1/me" \
  -H "Origin: https://staging.<your-domain>" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization,Content-Type"
```

Expected:

- Response allows the staging origin.
- No wildcard origin is returned.

Verify protected API behavior:

```bash
curl -i "$BASE_URL/v1/me"
```

Expected:

- Request is rejected because no Authorization token is supplied.
- A 401-style response is acceptable.

## 12. Frontend Verification

Open:

```text
https://staging.<your-domain>
```

Check:

- Homepage loads.
- Login modal opens.
- Dev credential hint is not shown.
- Browser console has no startup errors.
- Network calls use `https://staging.<your-domain>/v1/...`.
- No calls go to `localhost`.

## 13. Login Verification

Use a staging-only Super Admin account.

Verify:

- Login accepts valid staging credentials.
- MFA challenge appears where expected.
- MFA verification completes.
- User lands in the Super Admin area.
- `/v1/me` returns server-derived `userId`, `email`, `role`, and `tenantId`.

Optional smoke command if credentials are allowed for smoke testing:

```bash
CLOUDCAMPUS_SMOKE_EMAIL=<staging-super-admin-email> \
CLOUDCAMPUS_SMOKE_PASSWORD=<staging-super-admin-password> \
BACKEND_URL=https://staging.<your-domain> \
FRONTEND_URL=https://staging.<your-domain> \
sh scripts/ops/smoke-staging.sh
```

Do not store smoke credentials in git.

## 14. Onboarding Verification

In the Super Admin portal:

1. Create a staging tenant.
2. Use a real first school code, not `MAIN`.
3. Invite a staging School Admin email.
4. Confirm the invitation is created.
5. If `CLOUDCAMPUS_EMAIL_MODE=log`, read the token only from controlled staging logs.
6. If `smtp`, confirm the email is delivered.
7. Accept the invitation.
8. Set the School Admin password.
9. Login as School Admin.
10. Activate the granted school.
11. Confirm the School Admin portal loads.

Backend checks:

```bash
docker compose --env-file .env.staging -f docker-compose.staging.yml logs --tail=300 backend
```

Expected:

- Tenant created.
- First real school created.
- School Admin invitation created.
- School access grant created.
- Audit rows created.
- No raw password is logged.

## 15. Security Smoke Verification

Unauthenticated onboarding must fail:

```bash
curl -i -X POST "$BASE_URL/v1/super-admin/tenants/onboard" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Tenant/school spoofing headers must fail on protected APIs:

```bash
curl -i "$BASE_URL/v1/me" \
  -H "Authorization: Bearer <valid-token>" \
  -H "X-Tenant-ID: spoofed" \
  -H "X-School-ID: spoofed"
```

Expected:

- Spoofing headers are rejected.
- Backend derives tenant, role, and active school from the token and database state.

## 16. Rollback

Record the previous image tags before every deploy:

```bash
grep -E 'CLOUDCAMPUS_(BACKEND|FRONTEND)_IMAGE' .env.staging
```

To roll back both images:

1. Edit `.env.staging`:

```text
CLOUDCAMPUS_BACKEND_IMAGE=ghcr.io/<owner>/<repo>/backend:<previous-sha>
CLOUDCAMPUS_FRONTEND_IMAGE=ghcr.io/<owner>/<repo>/frontend:<previous-sha>
```

2. Redeploy:

```bash
DEPLOY_ENV=staging APP_DIR=/opt/cloudcampus sh infra/scripts/ec2-deploy-compose.sh
```

3. Verify:

```bash
curl -fsS "$BASE_URL/actuator/health"
curl -fsS "$BASE_URL/actuator/health/readiness"
curl -fsS "$BASE_URL/"
```

For backend-only rollback:

```bash
SERVICES=backend DEPLOY_ENV=staging APP_DIR=/opt/cloudcampus sh infra/scripts/ec2-deploy-compose.sh
```

For frontend-only rollback:

```bash
SERVICES=frontend DEPLOY_ENV=staging APP_DIR=/opt/cloudcampus sh infra/scripts/ec2-deploy-compose.sh
```

Database rollback is separate from app rollback. Do not run destructive Flyway migrations without a tested restore path.

## 17. Troubleshooting

### Backend Is Unhealthy

```bash
docker compose --env-file .env.staging -f docker-compose.staging.yml logs --tail=300 backend
```

Check:

- PostgreSQL is healthy.
- `CLOUDCAMPUS_JDBC_URL` points to `jdbc:postgresql://postgres:5432/cloudcampus`.
- JWT secret is not blank or placeholder.
- Flyway migration error details.
- Actuator readiness endpoint is reachable from inside the container.

### PostgreSQL Is Unhealthy

```bash
docker compose --env-file .env.staging -f docker-compose.staging.yml logs --tail=200 postgres
docker compose --env-file .env.staging -f docker-compose.staging.yml exec postgres pg_isready -U cloudcampus -d cloudcampus
```

Check:

- DB password is set.
- Volume has enough disk.
- No public port is required.

### Frontend Loads But API Fails

Check browser network tab:

- API calls should go to `/v1/...` on the staging domain.
- No call should go to `localhost`.

Check Nginx:

```bash
sudo nginx -t
sudo tail -n 200 /var/log/nginx/error.log
curl -i https://staging.<your-domain>/v1/me
```

### TLS Fails

```bash
sudo certbot certificates
sudo nginx -t
sudo systemctl status nginx
```

Check:

- DNS points to the EC2 public IP.
- Security group allows 80 and 443.
- Nginx `server_name` matches the staging domain.

### CORS Fails

Check `.env.staging`:

```text
CLOUDCAMPUS_CORS_ALLOWED_ORIGINS=https://staging.<your-domain>
CLOUDCAMPUS_APP_BASE_URL=https://staging.<your-domain>
```

Restart backend after env changes:

```bash
SERVICES=backend DEPLOY_ENV=staging APP_DIR=/opt/cloudcampus sh infra/scripts/ec2-deploy-compose.sh
```

### Invitation Email Does Not Arrive

If dry-run:

- `CLOUDCAMPUS_EMAIL_MODE=log`.
- Use backend logs to confirm notification delivery was queued/logged.

If SMTP:

- `CLOUDCAMPUS_EMAIL_MODE=smtp`.
- SMTP host, username, password, auth, and starttls values are set.
- Sender domain is verified with the mail provider.

## 18. Stop Point

Stop here before making real infrastructure changes. The next action is to choose the EC2 host/domain and confirm that you want to run the bootstrap and deployment commands against that real staging environment.
