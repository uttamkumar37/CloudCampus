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

## 3. Required Domains

Choose real staging domains before filling env files.

Recommended shape:

- Frontend: `https://staging.mycloudcampus.in`
- Backend API: `https://api-staging.mycloudcampus.in`

DNS requirements:

- `staging.mycloudcampus.in` points to the frontend host.
- `api-staging.mycloudcampus.in` points to the backend reverse proxy host.
- TLS certificates exist for both names.

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

| Variable | Real value needed |
| --- | --- |
| `SPRING_PROFILES_ACTIVE` | `staging` |
| `CLOUDCAMPUS_DB_NAME` | Staging database name, for example `cloudcampus` |
| `CLOUDCAMPUS_DB_USERNAME` | Staging database user |
| `CLOUDCAMPUS_DB_PASSWORD` | Strong staging database password |
| `CLOUDCAMPUS_JDBC_URL` | `jdbc:postgresql://postgres:5432/<db>` for bundled Compose Postgres, or managed PostgreSQL URL |
| `CLOUDCAMPUS_JDBC_USERNAME` | Same staging DB user unless using separate app user |
| `CLOUDCAMPUS_JDBC_PASSWORD` | Same staging DB password unless using separate app password |
| `CLOUDCAMPUS_AUTH_JWT_SECRET` | At least 64 random characters; generate with `openssl rand -base64 64` |
| `CLOUDCAMPUS_AUTH_EXPOSE_MFA_CODE` | `false` for real staging; use `true` only for private local demos |
| `CLOUDCAMPUS_EMAIL_MODE` | `log` for first staging, or `smtp` when testing real mail |
| `CLOUDCAMPUS_EMAIL_FROM` | Staging sender address |
| `CLOUDCAMPUS_APP_BASE_URL` | Frontend staging URL, for example `https://staging.mycloudcampus.in` |
| `CLOUDCAMPUS_CORS_ALLOWED_ORIGINS` | Frontend staging URL only, for example `https://staging.mycloudcampus.in` |
| `CLOUDCAMPUS_AI_ENABLED` | `true` or `false` for staging test scope |
| `CLOUDCAMPUS_AI_PROVIDER` | `mock` unless a real provider is intentionally tested |
| `CLOUDCAMPUS_AI_API_KEY` | Empty for `mock`; real key from secret manager when using a real provider |
| `CLOUDCAMPUS_SMTP_*` | Required only when `CLOUDCAMPUS_EMAIL_MODE=smtp` |
| `CLOUDCAMPUS_BOOTSTRAP_SUPER_ADMIN_ENABLED` | `false` |
| `CLOUDCAMPUS_BACKEND_PORT` | Usually `18080`; backend binds to localhost for reverse proxy |
| `CLOUDCAMPUS_BACKEND_IMAGE` | Registry image tag, for example `ghcr.io/<owner>/cloudcampus-backend:<tag>` |
| `JAVA_OPTS` | Keep current memory settings unless server sizing changes |

Fill `frontend/.env.staging` with:

```env
VITE_CLOUDCAMPUS_API_BASE_URL=https://api-staging.mycloudcampus.in
```

The API URL must match the backend domain and CORS must allow the frontend domain.

## 6. Backend Image Registry Plan

Use GitHub Container Registry unless a different registry is selected.

Set placeholders:

```bash
export GHCR_OWNER=<github-owner-or-org>
export IMAGE_NAME=cloudcampus-backend
export IMAGE_TAG=staging-$(git rev-parse --short HEAD)
export IMAGE_REF=ghcr.io/$GHCR_OWNER/$IMAGE_NAME:$IMAGE_TAG
```

Login with a GitHub token that has package write permission:

```bash
echo "<github-token-with-write-packages>" | docker login ghcr.io -u <github-username> --password-stdin
```

Build, tag, and push:

```bash
docker build -f backend/Dockerfile -t "$IMAGE_REF" .
docker push "$IMAGE_REF"
```

Verify pull on the staging server:

```bash
docker pull "$IMAGE_REF"
```

Set this exact value in `.env.staging`:

```env
CLOUDCAMPUS_BACKEND_IMAGE=ghcr.io/<owner>/cloudcampus-backend:<tag>
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
- Terminate TLS for `staging.mycloudcampus.in`.
- Do not hardcode fake certificates in the repository.

Example Nginx shape, to adapt on the server:

```nginx
server {
    listen 443 ssl http2;
    server_name staging.mycloudcampus.in;

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
    server_name api-staging.mycloudcampus.in;

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

## 9. DNS and TLS Setup

Before go-live for staging:

- DNS records resolve from a public network.
- TLS certificate covers both frontend and API domains.
- HTTP redirects to HTTPS.
- Backend API is not directly exposed except through the intended reverse proxy.

Check:

```bash
curl -I https://staging.mycloudcampus.in
curl -I https://api-staging.mycloudcampus.in/actuator/health/readiness
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
curl -fsS https://api-staging.mycloudcampus.in/actuator/health/readiness
curl -fsS https://api-staging.mycloudcampus.in/v1/system/readiness
./scripts/deploy/smoke.sh https://api-staging.mycloudcampus.in
```

Frontend smoke:

```bash
curl -fsSI https://staging.mycloudcampus.in
curl -fsS https://staging.mycloudcampus.in | grep -E "CloudCampus|/assets/"
```

Manual browser smoke:

- Frontend returns HTTP 200.
- Static assets load without 404s.
- Login page loads.
- Browser network requests call `https://api-staging.mycloudcampus.in`.
- CORS allows the frontend domain.
- MFA flow works as configured.
- AI dashboard loads after authentication.

## 12. Rollback Steps

Keep the previous staging image tag before deploying.

Rollback backend:

```bash
# Edit .env.staging and set CLOUDCAMPUS_BACKEND_IMAGE to the previous known-good image.
docker compose --env-file .env.staging -f docker-compose.staging.yml up -d
./scripts/deploy/smoke.sh https://api-staging.mycloudcampus.in
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
