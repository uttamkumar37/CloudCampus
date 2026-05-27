#!/usr/bin/env sh
set -eu

DEPLOY_ENV="${DEPLOY_ENV:-staging}"
APP_DIR="${APP_DIR:-/opt/cloudcampus}"
PULL_IMAGES="${PULL_IMAGES:-true}"
RUN_SMOKE="${RUN_SMOKE:-true}"
DRY_RUN="${DRY_RUN:-false}"
SERVICES="${SERVICES:-}"

case "$DEPLOY_ENV" in
  staging)
    COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.staging.yml}"
    ENV_FILE="${ENV_FILE:-.env.staging}"
    ;;
  production)
    COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
    ENV_FILE="${ENV_FILE:-.env.production}"
    ;;
  *)
    echo "DEPLOY_ENV must be staging or production." >&2
    exit 1
    ;;
esac

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required on the deployment host." >&2
  exit 1
fi

if [ ! -d "$APP_DIR" ]; then
  echo "Application directory does not exist: $APP_DIR" >&2
  exit 1
fi

cd "$APP_DIR"

if [ ! -s "$COMPOSE_FILE" ]; then
  echo "Compose file is missing or empty: $APP_DIR/$COMPOSE_FILE" >&2
  exit 1
fi

if [ ! -s "$ENV_FILE" ]; then
  echo "Environment file is missing or empty: $APP_DIR/$ENV_FILE" >&2
  exit 1
fi

if [ -n "${BACKEND_IMAGE:-}" ]; then
  export CLOUDCAMPUS_BACKEND_IMAGE="$BACKEND_IMAGE"
fi

if [ -n "${FRONTEND_IMAGE:-}" ]; then
  export CLOUDCAMPUS_FRONTEND_IMAGE="$FRONTEND_IMAGE"
fi

if [ "$DEPLOY_ENV" = "production" ] && grep -Eiq '^CLOUDCAMPUS_BOOTSTRAP_SUPER_ADMIN_ENABLED=true$' "$ENV_FILE"; then
  echo "Production deploy blocked: Super Admin bootstrap must stay disabled." >&2
  exit 1
fi

compose() {
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" "$@"
}

echo "Validating compose config for $DEPLOY_ENV..."
compose config >/dev/null

if [ "$DRY_RUN" = "true" ]; then
  echo "Dry run complete. Compose config is valid."
  exit 0
fi

if [ "$PULL_IMAGES" = "true" ]; then
  echo "Pulling images for $DEPLOY_ENV..."
  if [ -n "$SERVICES" ]; then
    compose pull $SERVICES
  else
    compose pull
  fi
fi

echo "Starting CloudCampus $DEPLOY_ENV stack..."
if [ -n "$SERVICES" ]; then
  compose up -d $SERVICES
else
  compose up -d
fi

echo "Current service status:"
compose ps

if [ "$RUN_SMOKE" = "true" ]; then
  backend_url="${BACKEND_URL:-http://localhost:${CLOUDCAMPUS_BACKEND_PORT:-18080}}"
  frontend_url="${FRONTEND_URL:-http://localhost:${CLOUDCAMPUS_FRONTEND_PORT:-18088}}"
  echo "Running smoke checks..."
  BACKEND_URL="$backend_url" FRONTEND_URL="$frontend_url" sh scripts/ops/smoke-staging.sh
fi

echo "CloudCampus $DEPLOY_ENV deployment complete."
