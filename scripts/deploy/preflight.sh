#!/usr/bin/env sh
set -eu

PROFILE="${1:-prod}"
ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"

if [ "$PROFILE" = "prod" ]; then
  ENV_FILE="$ROOT_DIR/.env.production"
  EXAMPLE_FILE="$ROOT_DIR/.env.production.example"
  COMPOSE_FILE="$ROOT_DIR/docker-compose.prod.yml"
elif [ "$PROFILE" = "staging" ]; then
  ENV_FILE="$ROOT_DIR/.env.staging"
  EXAMPLE_FILE="$ROOT_DIR/.env.staging.example"
  COMPOSE_FILE="$ROOT_DIR/docker-compose.staging.yml"
else
  echo "Usage: $0 [prod|staging]" >&2
  exit 2
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE. Create it from $EXAMPLE_FILE and replace every placeholder." >&2
  exit 1
fi

if grep -Eiq 'replace-with|change-me|dev-only|local-only|example\.com|your-org' "$ENV_FILE"; then
  echo "$ENV_FILE still contains placeholder values." >&2
  exit 1
fi

if ! grep -Eq '^CLOUDCAMPUS_AUTH_JWT_SECRET=.{64,}$' "$ENV_FILE"; then
  echo "CLOUDCAMPUS_AUTH_JWT_SECRET must be present and at least 64 characters." >&2
  exit 1
fi

if grep -Eq '^CLOUDCAMPUS_BOOTSTRAP_SUPER_ADMIN_ENABLED=true' "$ENV_FILE"; then
  echo "Super Admin bootstrap must not be enabled for $PROFILE." >&2
  exit 1
fi

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" config >/dev/null
echo "Preflight passed for $PROFILE."
