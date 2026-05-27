# CloudCampus Deployment Plan

Status: deployment-ready structure implemented for EC2 Docker MVP. Real server provisioning, DNS, TLS certificates, registry secrets, and production secret values are still environment/operator tasks.

Last updated: 2026-05-27

## 1. Executive Recommendation

CloudCampus should deploy incrementally:

1. MVP deployment: single Ubuntu EC2 host running Docker Compose behind Nginx and HTTPS.
2. Staging hardening: staging EC2 or ECS service with managed PostgreSQL, backup validation, smoke tests, and manual deploy gates.
3. Production target: AWS managed architecture with frontend on S3/CloudFront or Amplify, backend on ECS Fargate, PostgreSQL on RDS, secrets in AWS Secrets Manager or SSM Parameter Store, DNS in Route 53, HTTPS through ACM, and logs/metrics in CloudWatch.

Recommended first implementation: Option C, EC2 Docker deployment for MVP. It is the fastest path to a real environment while preserving a clean migration path to ECS Fargate later.

## 2. Current Deployment Readiness Analysis

### Existing Assets

The repository already contains a useful deployment foundation:

| Area | Current evidence | Readiness |
| --- | --- | --- |
| Backend container | `backend/Dockerfile` builds with Maven on Java 21 and runs a non-root Eclipse Temurin JRE container | Good MVP baseline |
| Frontend container | `frontend/Dockerfile` builds Vite app and serves static files through Nginx | Good MVP baseline |
| Frontend Nginx | `infra/docker/frontend/nginx.conf` serves React SPA, proxies `/v1/` to backend, and proxies `/actuator/health` | Good for same-origin Docker deployment |
| Local staging compose | `infra/docker/local/compose.staging.yml` runs PostgreSQL, backend, and frontend with health checks | Useful local/staging simulation |
| Backend health | Spring Actuator health/readiness enabled in `backend/src/main/resources/application.yml` | Good baseline |
| Database migrations | Flyway is enabled in application config | Good baseline |
| CI | `.github/workflows/ci.yml` runs backend, frontend, mobile, ops validation, and security audit jobs | Good baseline |
| Security workflow | `.github/workflows/security.yml` runs dependency review, npm audit, CodeQL, and Trivy filesystem scan | Good baseline |
| Ops scripts | `scripts/ops/smoke-staging.sh`, backup, restore drill scripts exist | Good operational start |
| EC2 bootstrap | `infra/scripts/ec2-bootstrap-ubuntu.sh` installs Docker, Nginx, Certbot, UFW, unattended upgrades, app user/directory, backup directory, and Docker log rotation | Good MVP server bootstrap |
| EC2 deploy helper | `infra/scripts/ec2-deploy-compose.sh` validates env/compose, blocks production Super Admin bootstrap, pulls images, starts services, and optionally runs smoke checks | Good MVP release helper |
| Monitoring | Prometheus alert rule file exists under `infra/monitoring/prometheus/cloudcampus-alerts.yml` | Early baseline |
| Infra folders | Placeholder directories exist for Docker, Nginx, Kubernetes, monitoring, and Terraform | Structure started |

### Gaps Before Real Deployment

| Gap | Impact | Recommendation |
| --- | --- | --- |
| Root-level `docker-compose.local.yml`, `docker-compose.staging.yml`, and `docker-compose.prod.yml` now exist | Operators have standard deployment entry points | Validate with example env files before each release |
| Host-level Nginx reverse proxy config now exists | Backend/frontend routing, TLS, secure headers, and API rate limits are defined in template form | Replace placeholder domain/cert paths on server |
| Production env templates now exist | Operators have safe placeholders for required variables | Real values must come from server-only env files or secret manager |
| Frontend uses relative `/v1/...` API calls with optional `VITE_API_BASE_URL` bootstrap rewrite | Works for same-origin Nginx and split frontend/backend hosting | For S3/CloudFront either route `/v1/*` through CloudFront or set `VITE_API_BASE_URL` at build time |
| CI deploy workflow now builds, scans, optionally pushes images, and can manually deploy staging/prod | Deployment artifacts can be promoted with manual gates | Configure GitHub environment secrets and production approvals |
| Manual deploy jobs are present | Staging/prod deployment is no longer purely ad hoc | Keep deploy input disabled until server secrets are configured |
| Formal rollback guide now exists | Incident recovery has an operator runbook | Practice rollback in staging |
| Formal health-check guide now exists | Validation steps are consistent | Run after every deploy |
| Production secrets strategy is not committed as policy | Risk of weak or committed secrets | Document and enforce env-only secrets |
| Rate limiting is not confirmed at edge | Public endpoints may be exposed to abuse | Add Nginx rate limits for auth and API routes |
| No production backup schedule documented in deploy path | Data recovery may be incomplete | Add RDS backup policy or EC2 Postgres backup schedule |

## 3. Target Environments

| Environment | Purpose | Recommended hosting | Data policy | Deployment gate |
| --- | --- | --- | --- | --- |
| Local | Developer workflow | Docker Compose or native app processes | Local disposable PostgreSQL | Developer command |
| Dev | Shared integration | EC2 Docker or small ECS service | Non-production data only | CI success |
| Staging | Production-like validation | EC2 Docker initially, then ECS + RDS | Sanitized or test production-like data | Manual deploy |
| Production | Customer traffic | ECS Fargate + RDS preferred, EC2 Docker acceptable for MVP | Real customer data | Manual approval and release checklist |

## 4. Deployment Architecture Options

### Option A: Recommended Long-Term AWS Architecture

Use this for serious production scale.

- Frontend: AWS Amplify or S3 + CloudFront.
- Backend: AWS ECS Fargate behind Application Load Balancer.
- Database: AWS RDS PostgreSQL with automated backups and point-in-time recovery.
- Storage: S3 for future documents, exports, and media.
- DNS: Route 53.
- HTTPS: ACM certificates.
- Secrets: AWS Secrets Manager or SSM Parameter Store.
- Logs and metrics: CloudWatch, Prometheus-compatible metrics where needed.
- CDN/API routing: CloudFront routes static assets to S3 and `/v1/*` to backend ALB, or frontend uses `VITE_API_BASE_URL`.

Pros:

- Best production security and scalability.
- Managed database and backups.
- Clear path to autoscaling.

Tradeoff:

- More setup cost and operational complexity than the MVP path.

### Option B: Managed Platform Hybrid

Useful when speed matters more than AWS ownership.

- Frontend: Vercel.
- Backend: Render, Fly.io, or Railway.
- Database: managed PostgreSQL.
- Secrets: provider environment variables.
- HTTPS: provider-managed.

Pros:

- Fast deployment.
- Low infrastructure maintenance.

Tradeoff:

- Less control over networking, compliance posture, and cloud architecture.

### Option C: MVP EC2 Docker Deployment

Recommended first implementation.

- One Ubuntu EC2 instance.
- Docker Compose runs frontend, backend, and optionally PostgreSQL for MVP.
- Host Nginx or container Nginx terminates HTTPS and reverse proxies traffic.
- PostgreSQL should move to RDS as soon as staging is stable.
- Public ports: 80 and 443 only.
- Backend port 8080 remains private.
- PostgreSQL remains private and never publicly exposed.

Pros:

- Cheap and simple.
- Easy to understand.
- Fastest real deployment path.

Tradeoff:

- Limited high availability.
- More manual operations.
- Must be disciplined about backups and patching.

## 5. Deployment-Ready Structure To Implement Next

The target structure should be:

```text
/infra
  /docker
    /backend
    /frontend
    /local
  /nginx
  /aws
  /terraform
  /monitoring
  /scripts
/docs
  /deployment
    DEPLOYMENT_PLAN.md
    DEPLOYMENT_README.md
    ROLLBACK_GUIDE.md
    HEALTH_CHECK_GUIDE.md
docker-compose.local.yml
docker-compose.staging.yml
docker-compose.prod.yml
.env.example
.env.staging.example
.env.production.example
backend/Dockerfile
frontend/Dockerfile
```

Current repository state already has several of these directories and Dockerfiles. The next implementation task should standardize the missing root compose files, environment templates, host Nginx config, and deployment runbooks.

## 6. Required Files And Intended Purpose

| File | Purpose | Current status |
| --- | --- | --- |
| `docker-compose.local.yml` | Local full-stack deployment with local PostgreSQL | Exists |
| `docker-compose.staging.yml` | Staging deployment with production-like env and health checks | Exists |
| `docker-compose.prod.yml` | Production compose for EC2 MVP | Exists |
| `backend/Dockerfile` | Backend image build and runtime | Exists |
| `frontend/Dockerfile` | Frontend static image build and runtime | Exists |
| `infra/nginx/cloudcampus.conf` | Host reverse proxy, TLS routing, secure headers, rate limits | Exists |
| `.env.example` | Shared local/dev variable template | Exists |
| `.env.staging.example` | Staging variable template | Exists |
| `.env.production.example` | Production variable template without secrets | Exists |
| `docs/deployment/DEPLOYMENT_README.md` | Operator deployment guide | Exists |
| `docs/deployment/ROLLBACK_GUIDE.md` | Release rollback guide | Exists |
| `docs/deployment/HEALTH_CHECK_GUIDE.md` | Health and smoke validation guide | Exists |

## 7. Backend Production Requirements

Production backend configuration must be environment-driven.

Required variables:

```text
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:postgresql://...
SPRING_DATASOURCE_USERNAME=...
SPRING_DATASOURCE_PASSWORD=...
CLOUDCAMPUS_JWT_SECRET=strong-random-secret
CLOUDCAMPUS_FRONTEND_ORIGIN=https://app.example.com
CLOUDCAMPUS_APP_BASE_URL=https://app.example.com
CLOUDCAMPUS_EMAIL_MODE=smtp
CLOUDCAMPUS_SMTP_HOST=...
CLOUDCAMPUS_SMTP_PORT=587
CLOUDCAMPUS_SMTP_USERNAME=...
CLOUDCAMPUS_SMTP_PASSWORD=...
CLOUDCAMPUS_SMTP_FROM=...
```

Production rules:

- Use external PostgreSQL for staging and production when possible.
- Keep Flyway migrations enabled.
- Keep actuator health endpoints enabled:
  - `/actuator/health`
  - `/actuator/health/readiness`
- Use a strong JWT secret from environment variables only.
- Configure CORS for the production frontend domain only.
- Do not enable dev seed credentials in production.
- Do not log passwords, JWTs, invitation raw tokens, reset tokens, or MFA secrets.
- Use production logging levels and structured logs where possible.
- Place backend behind Nginx or an AWS load balancer.
- Do not expose backend port 8080 publicly in EC2 MVP.
- Add edge rate limits for login, MFA, password reset, and invitation acceptance routes.
- Enable secure headers at Nginx or load balancer layer.

## 8. Frontend Production Requirements

Current frontend API behavior:

- The frontend feature clients currently call backend APIs using relative `/v1/...` routes.
- This is good for same-origin deployment where Nginx serves the frontend and proxies `/v1` to the backend.
- The app bootstrap now supports optional `VITE_API_BASE_URL`; when set at build time, CloudCampus API paths are prefixed with that backend origin.
- For split hosting such as S3/CloudFront, Amplify, or Vercel, use one of these:
  - route `/v1/*` through the CDN/reverse proxy to the backend; or
  - set `VITE_API_BASE_URL=https://api.example.com` during frontend build.

Production frontend rules:

- Build with `npm run build`.
- Serve `dist` through Nginx or S3/CloudFront.
- Preserve React router fallback to `index.html`.
- Ensure login modal calls production backend through same-origin `/v1` routing or `VITE_API_BASE_URL`.
- Hide local dev credentials in production builds. Current dev hint is guarded by `import.meta.env.DEV` and must remain dev-only.
- Ensure all authenticated API calls send the Bearer token through the existing auth client path.

## 9. CI/CD Plan

Current CI already validates:

- Backend tests.
- Frontend tests, lint, typecheck, and build.
- Mobile lint, typecheck, and tests.
- Ops validation.
- Security audit.
- Dependency review, CodeQL, and Trivy filesystem scan.

Next CI/CD additions:

1. Docker image build job:
   - Build backend image.
   - Build frontend image.
   - Tag with commit SHA.
   - Push to GitHub Container Registry or Amazon ECR.

2. Staging deploy workflow:
   - Manual `workflow_dispatch`.
   - Requires CI green.
   - Pull selected image tags.
   - Deploy to staging EC2 or ECS.
   - Run backend health checks.
   - Run frontend smoke check.
   - Run optional login smoke test with staging-only test account.

3. Production deploy workflow:
   - Manual `workflow_dispatch`.
   - Requires GitHub environment approval.
   - Uses immutable image tag.
   - Creates database backup or confirms RDS PITR.
   - Deploys with rolling or blue/green strategy where available.
   - Runs health checks and smoke checks.
   - Records release metadata.

4. Security scan:
   - Continue CodeQL and Trivy filesystem scan.
   - Add container image scan after Docker image build.
   - Fail deployment on critical fixable vulnerabilities unless explicitly waived.

## 10. EC2 Docker MVP Deployment Guide

### 10.1 Provision Ubuntu EC2

Recommended initial size:

- Instance: `t3.small` or `t3.medium` for MVP staging.
- OS: Ubuntu 24.04 LTS.
- Storage: at least 30 GB gp3.
- Elastic IP: yes for MVP.
- IAM role: attach only permissions needed for logs, SSM, S3 backups, and ECR pull if used.

### 10.2 Configure Security Groups

Public inbound:

- TCP 80 from `0.0.0.0/0`.
- TCP 443 from `0.0.0.0/0`.

Restricted inbound:

- TCP 22 only from trusted admin IPs, or use AWS Systems Manager Session Manager and close SSH.

Private only:

- Backend 8080 must not be open publicly.
- PostgreSQL 5432 must not be open publicly.
- Redis/RabbitMQ future ports must not be open publicly.

### 10.3 Install Docker And Compose

On EC2:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker ubuntu
```

### 10.4 Configure Domain And HTTPS

Point DNS:

- `app.example.com` to the EC2 Elastic IP.
- Optional `api.example.com` only if backend is separated later.

Install Certbot if host-level Nginx is used:

```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx
sudo certbot --nginx -d app.example.com
```

For container-only Nginx, either:

- mount certificates into the Nginx container; or
- terminate TLS on host Nginx and proxy to Docker services.

MVP recommendation: host Nginx terminates HTTPS and proxies to the frontend container on localhost.

### 10.5 Configure Environment

Create a production `.env` on the server only. Never commit it.

Minimum required values:

```text
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/cloudcampus
SPRING_DATASOURCE_USERNAME=cloudcampus
SPRING_DATASOURCE_PASSWORD=replace-with-strong-password
CLOUDCAMPUS_JWT_SECRET=replace-with-64-byte-random-secret
CLOUDCAMPUS_FRONTEND_ORIGIN=https://app.example.com
CLOUDCAMPUS_APP_BASE_URL=https://app.example.com
CLOUDCAMPUS_EMAIL_MODE=smtp
```

If using local Postgres in Docker for MVP, also configure volume backups. If using RDS, keep the database outside the EC2 host.

### 10.6 Start Services

The future production compose command should be:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

Until the production compose file is created, use only approved staging/local compose commands.

### 10.7 Verify Health

Backend:

```bash
curl -fsS https://app.example.com/actuator/health
curl -fsS https://app.example.com/actuator/health/readiness
```

Frontend:

```bash
curl -fsS https://app.example.com/
```

Smoke test:

```bash
BACKEND_URL=https://app.example.com FRONTEND_URL=https://app.example.com sh scripts/ops/smoke-staging.sh
```

### 10.8 Verify Product Flows

After deployment:

1. Open the homepage.
2. Confirm production build does not show dev credentials.
3. Log in with a valid Super Admin test account.
4. Verify MFA challenge if enabled for that account.
5. Verify `/v1/me` returns server-derived role and tenant context.
6. Run tenant onboarding in staging.
7. Accept School Admin invitation.
8. Confirm School Admin can activate allowed school.
9. Confirm denied access paths return clean errors.
10. Check backend and Nginx logs for errors.

## 11. Staging Checklist

Before staging deploy:

- CI is green.
- Backend tests pass.
- Frontend tests, lint, typecheck, and build pass.
- Mobile lint/typecheck pass if mobile changed.
- Docker images build successfully.
- Staging env file exists only in secret store or on server.
- Staging database is not publicly exposed.
- Staging JWT secret is strong and not reused from local.
- Staging SMTP is configured or intentionally set to log mode.
- Staging domain has HTTPS.
- Smoke test credentials are staging-only.

After staging deploy:

- `/actuator/health` returns healthy.
- `/actuator/health/readiness` returns ready.
- Frontend loads.
- Login works.
- Logout works.
- Super Admin onboarding works.
- School Admin invitation acceptance works.
- Audit rows are created.
- Nginx logs and backend logs are clean.
- Backup job is configured or RDS PITR is enabled.

## 12. Production Checklist

Before production deploy:

- Release commit is tagged.
- Production approval completed.
- Database backup or RDS PITR confirmed.
- Production env values are present in secret store or server-only env file.
- Production JWT secret is strong and unique.
- Production SMTP is configured.
- Dev bootstrap users and seed credentials are disabled.
- Public security groups expose only 80 and 443.
- SSH is restricted or replaced by SSM Session Manager.
- PostgreSQL is private.
- Backend is not publicly exposed except through reverse proxy/load balancer.
- HTTPS certificate is valid.
- Rate limits are enabled at edge.
- Monitoring alerts are enabled.

After production deploy:

- Backend health and readiness pass.
- Frontend homepage loads.
- Login works for a production admin account.
- Critical onboarding flow is verified if part of release.
- Error logs are reviewed.
- Release notes are saved.
- Rollback target is known.

## 13. Rollback Plan

Rollback must be rehearsed in staging before production.

### Docker Image Rollback

1. Identify previous working image tag.
2. Update compose env or image tag to previous tag.
3. Pull previous image.
4. Restart services.
5. Run health checks.
6. Run smoke tests.

Example future command:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### Database Rollback

Database rollback is harder than application rollback.

Rules:

- Prefer backward-compatible migrations.
- Never deploy destructive migrations without a tested restore path.
- For RDS, use point-in-time recovery when data rollback is required.
- For EC2 Postgres MVP, take a backup before deploy and validate restore drills.

### Frontend Rollback

If frontend is served by Docker:

- Roll back frontend image tag and restart.

If frontend is served by S3/CloudFront:

- Re-promote previous build artifact.
- Invalidate CloudFront cache if needed.

## 14. Health-Check Guide

Required health endpoints:

- Backend liveness: `/actuator/health`
- Backend readiness: `/actuator/health/readiness`
- Frontend: `/`

Expected healthy response:

```json
{"status":"UP"}
```

Operational checks:

- Nginx returns 200 for `/`.
- Nginx proxies `/v1/*` to backend.
- Nginx proxies or allows `/actuator/health`.
- Backend can connect to PostgreSQL.
- Flyway migrations completed.
- JWT secret is configured.
- CORS accepts only expected frontend origin.
- SMTP/email mode is correct for the environment.

## 15. Security Rules

Mandatory:

- Do not expose PostgreSQL publicly.
- Do not expose backend directly when Nginx or a load balancer is used.
- Do not commit production `.env` files.
- Use strong secrets.
- Enable HTTPS.
- Restrict SSH.
- Enable backups.
- Add monitoring alerts.
- Keep dev seed/bootstrap credentials disabled in production.
- Do not show dev credentials in production frontend.
- Do not log raw password, invitation token, reset token, MFA secret, JWT, or refresh token.

Recommended Nginx protections:

- HSTS after HTTPS is stable.
- `X-Content-Type-Options: nosniff`.
- `X-Frame-Options: DENY` or CSP `frame-ancestors`.
- `Referrer-Policy`.
- Login and password reset rate limits.
- Request body size limit.

## 16. Implementation Order After Approval

Ask before implementing the following infra changes:

1. DEPLOY-001: add root compose files for local, staging, and production. Completed.
2. DEPLOY-002: add environment templates with safe placeholders. Completed.
3. DEPLOY-003: add host Nginx reverse proxy config with secure headers and rate limits. Completed.
4. DEPLOY-004: add deployment README, rollback guide, and health-check guide. Completed.
5. DEPLOY-005: add Docker image build and manual deploy GitHub Actions workflow. Completed.
6. DEPLOY-006: add optional `VITE_API_BASE_URL` support or document CloudFront `/v1` routing. Completed.
7. DEPLOY-007: run local Docker compose validation and smoke tests. Completed.
8. DEPLOY-008: add Ubuntu EC2 bootstrap script and validation. Completed.
9. DEPLOY-009: add EC2 compose deploy helper and workflow integration. Completed.

## 17. Validation Evidence

Validation run on 2026-05-27:

```bash
sh scripts/ci/validate-ops.sh
docker compose --env-file .env.example -f docker-compose.local.yml config
docker compose --env-file .env.staging.example -f docker-compose.staging.yml config
docker compose --env-file .env.production.example -f docker-compose.prod.yml config
git diff --check
```

Result:

- Ops file/shell validation passed.
- Local, staging, and production compose files render successfully with example env files.
- Whitespace check passed.

Additional DEPLOY-006 validation:

```bash
cd frontend && npm test -- --run src/shared/api/apiBase.test.ts
cd frontend && npm test -- --run
cd frontend && npm run lint
cd frontend && npm run typecheck
cd frontend && npm run build
```

Result:

- Focused API base tests passed: 4 tests.
- Full frontend test suite passed: 20 files, 61 tests.
- Frontend lint passed.
- Frontend typecheck passed.
- Frontend production build passed with the existing Vite large chunk warning.

Additional DEPLOY-007 local Docker validation:

```bash
docker compose --env-file .env.example -f docker-compose.local.yml up -d --build
BACKEND_URL=http://localhost:18080 FRONTEND_URL=http://localhost:18088 sh scripts/ops/smoke-staging.sh
docker compose --env-file .env.example -f docker-compose.local.yml ps backend frontend postgres
```

Result:

- Backend image built as `cloudcampus-backend:local`.
- Frontend image built as `cloudcampus-frontend:local`.
- PostgreSQL container is healthy on `127.0.0.1:15432`.
- Backend container is healthy on `127.0.0.1:18080`.
- Frontend container is healthy on `127.0.0.1:18088`.
- Smoke script passed backend health, backend readiness, and frontend checks.
- Frontend healthcheck was corrected to use `127.0.0.1` instead of `localhost` because BusyBox `wget` tries IPv6 `::1` first inside the Nginx container.

Additional DEPLOY-008 EC2 bootstrap validation:

```bash
sh -n infra/scripts/ec2-bootstrap-ubuntu.sh
sh scripts/ci/validate-ops.sh
```

Result:

- EC2 bootstrap script syntax validation passed.
- Ops validation now requires the bootstrap script and validates it in CI.

Additional DEPLOY-009 EC2 deploy helper validation:

```bash
sh -n infra/scripts/ec2-deploy-compose.sh
DRY_RUN=true DEPLOY_ENV=staging APP_DIR="$PWD" ENV_FILE=.env.staging.example sh infra/scripts/ec2-deploy-compose.sh
DRY_RUN=true DEPLOY_ENV=production APP_DIR="$PWD" ENV_FILE=.env.production.example sh infra/scripts/ec2-deploy-compose.sh
sh scripts/ci/validate-ops.sh
```

Result:

- EC2 deploy helper syntax validation passed.
- Staging and production dry-run compose validation passed.
- GitHub Actions manual deploy workflow now calls the same server-side helper used for manual EC2 deployments.

## 18. Current Decision

EC2 Docker MVP deployment assets now exist:

- root `docker-compose.local.yml`
- root `docker-compose.staging.yml`
- root `docker-compose.prod.yml`
- `infra/nginx/cloudcampus.conf`
- `.env.example`
- `.env.staging.example`
- `.env.production.example`
- deployment runbooks

This preserves the simple MVP path while keeping the door open for AWS ECS/RDS/CloudFront production hardening.

Next recommended implementation step: configure a real staging EC2 target, GitHub environment secrets, DNS, TLS, and registry image tags, then run a hosted staging smoke test.
