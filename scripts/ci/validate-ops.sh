#!/usr/bin/env sh
set -eu

required_files="
.dockerignore
.github/workflows/ci.yml
backend/Dockerfile
frontend/Dockerfile
infra/docker/frontend/nginx.conf
infra/docker/local/compose.staging.yml
infra/env/staging.example.env
infra/monitoring/prometheus/cloudcampus-alerts.yml
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

if grep -R "[S]uperAdmin123!" infra/env .github/workflows scripts/ops scripts/ci 2>/dev/null; then
  echo "Unsafe default Super Admin password found in ops/deploy files." >&2
  exit 1
fi

sh -n scripts/ops/smoke-staging.sh
sh -n scripts/ops/backup-local-postgres.sh
sh -n scripts/ops/restore-local-postgres-drill.sh
sh -n scripts/ci/validate-ops.sh

if command -v docker >/dev/null 2>&1; then
  docker compose -f infra/docker/local/compose.staging.yml config >/dev/null
fi

echo "OPS-002 file and shell validation passed."
