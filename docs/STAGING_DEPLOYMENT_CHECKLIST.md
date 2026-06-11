# CloudCampus Staging Deployment Checklist

Use this checklist to prepare a real staging deployment without committing secrets. Staging should prove the deployment path, domain/TLS, image registry, frontend hosting, backups, smoke tests, and rollback before production planning continues.

## 1. Server/VPS Requirements

- Linux VPS or cloud VM with at least 2 vCPU, 4 GB RAM, and 40 GB disk for a first staging environment.
- SSH access for the deploy user.
- Firewall allowing only SSH, HTTP, and HTTPS from the public internet.
- Enough disk for Docker images, PostgreSQL data, logs, and backups.
- A protected directory for app files, for example `/opt/cloudcampus/app`.
- A protected backup directory outside the app folder, for example `/secure/backups/cloudcampus`.

## 2. Required Software

- Docker Engine.
- Docker Compose plugin, available as `docker compose`.
- Git.
- Curl.
- Nginx or another HTTPS reverse proxy/static hosting service.
- Certbot, cloud-managed TLS, or another certificate automation tool.

Verify on the server:

```bash
docker --version
docker compose version
git --version
nginx -v
curl --version
```

## 3. DNS Checklist

Use these staging domains exactly:

- Frontend staging: `https://staging.mycloudcampous.in`
- Backend API staging: `https://api-staging.mycloudcampous.in`

DNS requirements:

- `staging.mycloudcampous.in` points to the frontend host.
- `api-staging.mycloudcampous.in` points to the backend reverse proxy host.
- TLS certificates exist for both names.
- HTTP redirects to HTTPS after certificates are installed.

DNS verification commands:

```bash
dig +short staging.mycloudcampous.in
dig +short api-staging.mycloudcampous.in
curl -I http://staging.mycloudcampous.in
curl -I http://api-staging.mycloudcampous.in
```

## 4. Required Environment Files

Create these locally on the staging server only:

```bash
cp .env.staging.example .env.staging
cp frontend/.env.staging.example frontend/.env.staging
```

These files must not be committed. Confirm they are ignored:

```bash
git check-ignore -v .env.staging frontend/.env.staging
git ls-files .env.staging frontend/.env.staging
```

The first command should print a `.gitignore` rule. The second command should print nothing.

## 5. Required Real Values

Fill `.env.staging` with real staging values:

| Variable | Example format | Secret | Validate | Common mistake |
| --- | --- | --- | --- | --- |
| `SPRING_PROFILES_ACTIVE` | `staging` | No | Must equal `staging` | Using `prod` or `local` |
| `CLOUDCAMPUS_DB_NAME` | `cloudcampus` | No | Matches Postgres database name | Changing DB name without changing JDBC URL |
| `CLOUDCAMPUS_DB_USERNAME` | `cloudcampus` | No | Matches Postgres user | Using a user not created in Postgres |
| `CLOUDCAMPUS_DB_PASSWORD` | strong random value | Yes | No placeholders; works with Postgres health check | Reusing local password |
| `CLOUDCAMPUS_POSTGRES_PORT` | `15432` | No | Only needed for host port mapping | Exposing Postgres publicly |
| `CLOUDCAMPUS_JDBC_URL` | `jdbc:postgresql://postgres:5432/cloudcampus` | No | Starts with `jdbc:postgresql://` | Using localhost from inside Compose |
| `CLOUDCAMPUS_JDBC_USERNAME` | `cloudcampus` | No | Matches app DB user | Mismatch with `CLOUDCAMPUS_DB_USERNAME` |
| `CLOUDCAMPUS_JDBC_PASSWORD` | strong random value | Yes | No placeholders; app can connect | Mismatch with `CLOUDCAMPUS_DB_PASSWORD` |
| `CLOUDCAMPUS_AUTH_JWT_SECRET` | output of `openssl rand -base64 64` | Yes | At least 64 characters | Short or copied example secret |
| `CLOUDCAMPUS_AUTH_EXPOSE_MFA_CODE` | `false` | No | Must be `false` for real staging | Treating staging like local demo |
| `CLOUDCAMPUS_EMAIL_MODE` | `log` or `smtp` | No | `log` for first staging, `smtp` for mail testing | Enabling `smtp` without credentials |
| `CLOUDCAMPUS_EMAIL_FROM` | `no-reply@staging.mycloudcampous.in` | No | Valid sender domain | Leaving `.example` domain |
| `CLOUDCAMPUS_APP_BASE_URL` | `https://staging.mycloudcampous.in` | No | Must be frontend URL | Using API URL here |
| `CLOUDCAMPUS_CORS_ALLOWED_ORIGINS` | `https://staging.mycloudcampous.in` | No | Must exactly match frontend origin | Wildcard or API origin |
| `CLOUDCAMPUS_AI_ENABLED` | `true` or `false` | No | Matches staging test scope | Enabling real provider accidentally |
| `CLOUDCAMPUS_AI_PROVIDER` | `mock` | No | Use `mock` unless testing a real provider | Setting real provider without key |
| `CLOUDCAMPUS_AI_API_KEY` | blank for `mock` | Yes when real provider | Required only for real provider | Committing provider key |
| `CLOUDCAMPUS_SMTP_HOST` | SMTP hostname | No | Required only when email mode is `smtp` | Blank with `smtp` mode |
| `CLOUDCAMPUS_SMTP_USERNAME` | SMTP user | Yes | Required only when email mode is `smtp` | Committing SMTP user |
| `CLOUDCAMPUS_SMTP_PASSWORD` | SMTP password | Yes | Required only when email mode is `smtp` | Committing SMTP password |
| `CLOUDCAMPUS_BOOTSTRAP_SUPER_ADMIN_ENABLED` | `false` | No | Must remain false for staging | Enabling bootstrap on shared staging |
| `CLOUDCAMPUS_BACKEND_PORT` | `18080` | No | Nginx proxies to this local port | Confusing with `SERVER_PORT` |
| `CLOUDCAMPUS_BACKEND_IMAGE` | `ghcr.io/<GHCR_OWNER>/cloudcampus-backend:staging-ad6d994` | No | Image exists and can be pulled | Local-only image tag |
| `JAVA_OPTS` | `-XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError` | No | JVM starts within server memory | Over-allocating RAM |

CloudCampus staging Compose does not currently require Redis, RabbitMQ, MinIO, or S3 variables. Add those only if the Compose files gain those services.

Fill `frontend/.env.staging` with:

```env
VITE_CLOUDCAMPUS_API_BASE_URL=https://api-staging.mycloudcampous.in
VITE_APP_ENV=staging
VITE_APP_NAME=CloudCampus
```

The app currently reads `VITE_CLOUDCAMPUS_API_BASE_URL`. `VITE_APP_ENV` and `VITE_APP_NAME` are safe metadata for staging build environments, but no frontend AI feature flag is currently read by the app. The API URL must match the backend domain and CORS must allow the frontend domain.

## 6. Backend Image Registry Plan

Use GitHub Container Registry unless a different registry is selected.

Set placeholders:

```bash
export GHCR_OWNER=<github-owner-or-org>
export IMAGE_NAME=cloudcampus-backend
export IMAGE_TAG=staging-ad6d994
export IMAGE_REF=ghcr.io/$GHCR_OWNER/$IMAGE_NAME:$IMAGE_TAG
```

Login with a GitHub token that has package write permission:

```bash
echo "<github-token-with-write-packages>" | docker login ghcr.io -u <github-username> --password-stdin
```

Build, tag, and push:

```bash
docker build -f backend/Dockerfile -t cloudcampus-backend:staging-ad6d994 .
docker tag cloudcampus-backend:staging-ad6d994 "$IMAGE_REF"
docker push "$IMAGE_REF"
```

Verify pull on the staging server:

```bash
docker pull "$IMAGE_REF"
```

Set this exact value in `.env.staging`:

```env
CLOUDCAMPUS_BACKEND_IMAGE=ghcr.io/<GHCR_OWNER>/cloudcampus-backend:staging-ad6d994
```

Do not use local-only image tags such as `cloudcampus-backend:local`, `cloudcampus-backend:readiness`, or `cloudcampus-backend:release-check` for staging.

## 7. Backend Deployment Steps

On the staging server:

```bash
cd /opt/cloudcampus/app
git fetch origin
git checkout world-ready-finance-admin-scale-foundation
git pull --ff-only origin world-ready-finance-admin-scale-foundation

cp .env.staging.example .env.staging
# Edit .env.staging with real staging values.

./scripts/deploy/preflight.sh staging
docker compose --env-file .env.staging -f docker-compose.staging.yml pull
docker compose --env-file .env.staging -f docker-compose.staging.yml up -d
docker compose --env-file .env.staging -f docker-compose.staging.yml ps
```

Database migrations run on application startup through Flyway. Watch the backend logs after the first start:

```bash
docker compose --env-file .env.staging -f docker-compose.staging.yml logs -f backend
```

## 8. Frontend Staging Hosting

Primary path: build React/Vite with the staging API URL and serve `frontend/dist` through HTTPS static hosting or Nginx.

Build:

```bash
cd frontend
cp .env.staging.example .env.staging
# Edit frontend/.env.staging so VITE_CLOUDCAMPUS_API_BASE_URL is the real API domain.
npm ci
npm run typecheck
npm run build -- --mode staging
```

Deploy the `frontend/dist` directory to the frontend host.

Minimum Nginx behavior:

- Serve `index.html` for SPA routes.
- Serve static assets with cache headers.
- Add basic security headers.
- Terminate TLS for `staging.mycloudcampous.in`.
- Do not hardcode fake certificates in the repository.

Example Nginx shape, to adapt on the server:

```nginx
server {
    listen 443 ssl http2;
    server_name staging.mycloudcampous.in;

    root /var/www/cloudcampus-staging;
    index index.html;

    location /assets/ {
        try_files $uri =404;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri /index.html;
    }

    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
}
```

Backend API reverse proxy shape:

```nginx
server {
    listen 443 ssl http2;
    server_name api-staging.mycloudcampous.in;

    location / {
        proxy_pass http://127.0.0.1:18080;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

After Nginx changes:

```bash
nginx -t
sudo systemctl reload nginx
```

Certbot TLS setup, after DNS points to the server and Nginx HTTP server blocks are reachable:

```bash
sudo certbot --nginx -d staging.mycloudcampous.in -d api-staging.mycloudcampous.in
sudo certbot renew --dry-run
sudo nginx -t
sudo systemctl reload nginx
```

If the frontend and API use different servers, run Certbot on each server with only the domain hosted there.

## 9. DNS and TLS Setup

Before go-live for staging:

- DNS records resolve from a public network.
- TLS certificate covers both frontend and API domains.
- HTTP redirects to HTTPS.
- Backend API is not directly exposed except through the intended reverse proxy.

Check:

```bash
curl -I https://staging.mycloudcampous.in
curl -I https://api-staging.mycloudcampous.in/actuator/health/readiness
```

## 10. Backup Setup

For bundled Compose PostgreSQL:

```bash
mkdir -p /secure/backups/cloudcampus
./scripts/deploy/backup-postgres.sh .env.staging /secure/backups/cloudcampus
```

Staging backup requirements:

- Backup output directory is outside the repository.
- Backup files are encrypted or stored on encrypted disk.
- Retention is defined, for example 7 daily backups for staging.
- A restore drill is completed before production planning.

Restore drill checklist:

- Create a fresh staging database or disposable restore host.
- Restore the latest dump.
- Start the backend against the restored database.
- Run smoke tests.
- Record restore duration and any manual steps.

## 11. Preflight and Smoke Test Flow

Before deployment:

```bash
./scripts/deploy/preflight.sh staging
```

Deploy:

```bash
docker compose --env-file .env.staging -f docker-compose.staging.yml pull
docker compose --env-file .env.staging -f docker-compose.staging.yml up -d
```

Backend smoke:

```bash
docker compose --env-file .env.staging -f docker-compose.staging.yml ps
curl -fsS https://api-staging.mycloudcampous.in/actuator/health/readiness
curl -fsS https://api-staging.mycloudcampous.in/v1/system/readiness
./scripts/deploy/smoke.sh https://api-staging.mycloudcampous.in
```

Frontend smoke:

```bash
curl -fsSI https://staging.mycloudcampous.in
curl -fsS https://staging.mycloudcampous.in | grep -E "CloudCampus|/assets/"
```

Manual browser smoke:

- Frontend returns HTTP 200.
- Static assets load without 404s.
- Login page loads.
- Browser network requests call `https://api-staging.mycloudcampous.in`.
- CORS allows the frontend domain.
- MFA flow works as configured.
- AI dashboard loads after authentication.

## 12. Rollback Steps

Keep the previous staging image tag before deploying.

Rollback backend:

```bash
# Edit .env.staging and set CLOUDCAMPUS_BACKEND_IMAGE to the previous known-good image.
docker compose --env-file .env.staging -f docker-compose.staging.yml up -d
./scripts/deploy/smoke.sh https://api-staging.mycloudcampous.in
```

Rollback frontend:

- Keep the previous `frontend/dist` artifact or static hosting release.
- Re-point the static host to the previous artifact.
- Verify frontend and backend smoke checks.

Important: database migrations are forward-only. Any staging rollback after a migration must be tested before production.

## 13. Go/No-Go Checklist

Go for staging only when all are true:

- Working tree on the deployment server is clean.
- `.env.staging` exists only on the server and contains no placeholders.
- `frontend/.env.staging` exists only in the build environment and uses the real API staging domain.
- `CLOUDCAMPUS_BACKEND_IMAGE` points to a pushed registry image.
- `CLOUDCAMPUS_AUTH_JWT_SECRET` is at least 64 random characters.
- `CLOUDCAMPUS_AUTH_EXPOSE_MFA_CODE=false` for real staging.
- `CLOUDCAMPUS_CORS_ALLOWED_ORIGINS` exactly matches the frontend staging URL.
- `./scripts/deploy/preflight.sh staging` passes.
- Backend Compose services are healthy.
- Frontend HTTPS URL returns 200.
- Backend smoke script passes against the API staging URL.
- Backup command has been run successfully.
- Rollback image/artifact is known.

No-go if any of these are true:

- Any secret is committed to git.
- Any `.env.staging` value still contains `replace-with`, `example.com`, `your-org`, `change-me`, `local-only`, or `dev-only`.
- Frontend API URL points to localhost or production.
- CORS allows `*`.
- Backend image is a local-only tag.
- DNS/TLS is not working.
- Smoke tests fail.

## 14. CI/CD Gap Before Staging Promotion

Current CI validates backend and Compose config. Add the smallest safe frontend gate before using CI as a staging release signal:

```yaml
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: npm
          cache-dependency-path: frontend/package-lock.json

      - name: Install frontend dependencies
        working-directory: frontend
        run: npm ci

      - name: Typecheck frontend
        working-directory: frontend
        run: npm run typecheck

      - name: Build frontend
        working-directory: frontend
        run: npm run build

      - name: Audit frontend dependencies
        working-directory: frontend
        run: npm audit --audit-level=high
```

Do not require real staging secrets in CI. CI should validate templates and build artifacts only.
