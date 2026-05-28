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

fail() {
  echo "$1" >&2
  exit 1
}

assert_not_contains() {
  pattern="$1"
  message="$2"
  shift 2
  if grep -R "$pattern" "$@" 2>/dev/null; then
    fail "$message"
  fi
}

assert_contains() {
  pattern="$1"
  file="$2"
  message="$3"
  if ! grep -Eq "$pattern" "$file"; then
    fail "$message"
  fi
}

# Local development may keep clearly marked local-only placeholders in
# .env.example and docker-compose.local.yml. Staging/production deploy assets
# must never carry those convenient local credentials or local-only secrets.
shared_deploy_files="
.env.staging.example
.env.production.example
docker-compose.staging.yml
docker-compose.prod.yml
infra/env
infra/nginx
.github/workflows
scripts/ops
"

assert_not_contains "[S]uperAdmin123!" "Unsafe local Super Admin password found outside local-only files." $shared_deploy_files
assert_not_contains "cloudcampus_local_password" "Unsafe local database password found outside local-only files." $shared_deploy_files
assert_not_contains "local-only-change-me-cloudcampus-auth-token-secret" "Unsafe local JWT secret found outside local-only files." $shared_deploy_files
assert_not_contains "dev-only-cloudcampus-auth-token-secret" "Unsafe dev JWT secret found in deploy assets." $shared_deploy_files
assert_not_contains "jdbc:h2:" "H2 database URL found in deploy assets." .env.staging.example .env.production.example docker-compose.staging.yml docker-compose.prod.yml infra/env

assert_contains "^# LOCAL ONLY:" ".env.example" ".env.example must clearly mark local-only placeholders."
assert_contains "LOCAL ONLY bootstrap account" ".env.example" ".env.example must mark bootstrap credentials as local-only."
assert_contains "LOCAL ONLY bootstrap account" "docker-compose.local.yml" "docker-compose.local.yml must mark bootstrap defaults as local-only."

assert_contains "^SPRING_PROFILES_ACTIVE=staging$" ".env.staging.example" "Staging template must use the staging profile."
assert_contains "^CLOUDCAMPUS_BOOTSTRAP_SUPER_ADMIN_ENABLED=false$" ".env.staging.example" "Staging template must disable Super Admin bootstrap."
assert_contains "^CLOUDCAMPUS_BOOTSTRAP_SUPER_ADMIN_PASSWORD=$" ".env.staging.example" "Staging template must leave bootstrap password blank."
assert_contains "^CLOUDCAMPUS_CORS_ALLOWED_ORIGINS=https://staging\\." ".env.staging.example" "Staging template must use an explicit HTTPS staging CORS origin."
assert_contains "^CLOUDCAMPUS_AUTH_JWT_SECRET=replace-with-staging-64-byte-random-secret$" ".env.staging.example" "Staging template must require a replaced strong JWT secret."

assert_contains "^SPRING_PROFILES_ACTIVE=prod$" ".env.production.example" "Production template must use the prod profile."
assert_contains "^CLOUDCAMPUS_EMAIL_MODE=smtp$" ".env.production.example" "Production template must require SMTP mail mode."
assert_contains "^CLOUDCAMPUS_ALLOW_LOG_EMAIL_IN_PRODUCTION=false$" ".env.production.example" "Production template must disallow log-only mail mode."
assert_contains "^CLOUDCAMPUS_BOOTSTRAP_SUPER_ADMIN_ENABLED=false$" ".env.production.example" "Production template must disable Super Admin bootstrap."
assert_contains "^CLOUDCAMPUS_BOOTSTRAP_SUPER_ADMIN_PASSWORD=$" ".env.production.example" "Production template must leave bootstrap password blank."
assert_contains "^CLOUDCAMPUS_CORS_ALLOWED_ORIGINS=https://app\\." ".env.production.example" "Production template must use an explicit HTTPS production CORS origin."
assert_contains "^CLOUDCAMPUS_AUTH_JWT_SECRET=replace-with-production-64-byte-random-secret$" ".env.production.example" "Production template must require a replaced strong JWT secret."

assert_contains "CLOUDCAMPUS_BOOTSTRAP_SUPER_ADMIN_ENABLED: .*:-false" "docker-compose.staging.yml" "Staging compose must default bootstrap to false."
assert_contains "CLOUDCAMPUS_BOOTSTRAP_SUPER_ADMIN_PASSWORD: .*:-}" "docker-compose.staging.yml" "Staging compose must default bootstrap password to blank."
assert_contains "CLOUDCAMPUS_BOOTSTRAP_SUPER_ADMIN_ENABLED: \"false\"" "docker-compose.prod.yml" "Production compose must force bootstrap disabled."
assert_contains "CLOUDCAMPUS_BOOTSTRAP_SUPER_ADMIN_PASSWORD: \"\"" "docker-compose.prod.yml" "Production compose must force bootstrap password blank."

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
