#!/usr/bin/env sh
set -eu

required_files="
.dockerignore
.github/workflows/ci.yml
.github/workflows/deploy.yml
.env.example
.env.staging.example
.env.production.example
docker-compose.local.yml
docker-compose.staging.yml
docker-compose.prod.yml
backend/Dockerfile
frontend/Dockerfile
infra/docker/frontend/nginx.conf
infra/docker/local/compose.staging.yml
infra/env/staging.example.env
infra/nginx/cloudcampus.conf
infra/scripts/ec2-bootstrap-ubuntu.sh
infra/scripts/ec2-deploy-compose.sh
infra/monitoring/prometheus/cloudcampus-alerts.yml
docs/deployment/DEPLOYMENT_PLAN.md
docs/deployment/DEPLOYMENT_README.md
docs/deployment/HEALTH_CHECK_GUIDE.md
docs/deployment/ROLLBACK_GUIDE.md
scripts/ops/backup-local-postgres.sh
scripts/ops/restore-local-postgres-drill.sh
scripts/ops/smoke-staging.sh
"

for file in $required_files; do
  if [ ! -s "$file" ]; then
    echo "Missing required OPS-002 file: $file" >&2
    exit 1
  fi
done

if grep -R "[S]uperAdmin123!" .env.example .env.staging.example .env.production.example docker-compose.local.yml docker-compose.staging.yml docker-compose.prod.yml infra/env infra/nginx .github/workflows scripts/ops scripts/ci docs/deployment 2>/dev/null; then
  echo "Unsafe default Super Admin password found in ops/deploy files." >&2
  exit 1
fi

sh -n scripts/ops/smoke-staging.sh
sh -n scripts/ops/backup-local-postgres.sh
sh -n scripts/ops/restore-local-postgres-drill.sh
sh -n scripts/ci/validate-ops.sh
sh -n infra/scripts/ec2-bootstrap-ubuntu.sh
sh -n infra/scripts/ec2-deploy-compose.sh

if command -v docker >/dev/null 2>&1; then
  docker compose -f infra/docker/local/compose.staging.yml config >/dev/null
  docker compose --env-file .env.example -f docker-compose.local.yml config >/dev/null
  docker compose --env-file .env.staging.example -f docker-compose.staging.yml config >/dev/null
  docker compose --env-file .env.production.example -f docker-compose.prod.yml config >/dev/null
  DRY_RUN=true DEPLOY_ENV=staging APP_DIR="$PWD" ENV_FILE=.env.staging.example sh infra/scripts/ec2-deploy-compose.sh >/dev/null
  DRY_RUN=true DEPLOY_ENV=production APP_DIR="$PWD" ENV_FILE=.env.production.example sh infra/scripts/ec2-deploy-compose.sh >/dev/null
fi

echo "OPS-002 file and shell validation passed."
