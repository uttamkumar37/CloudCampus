#!/usr/bin/env sh
set -eu

ENV_FILE="${1:-.env.production}"
OUTPUT_DIR="${2:-backups}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing env file: $ENV_FILE" >&2
  exit 1
fi

set -a
. "$ENV_FILE"
set +a

mkdir -p "$OUTPUT_DIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_FILE="$OUTPUT_DIR/cloudcampus-${SPRING_PROFILES_ACTIVE:-prod}-$STAMP.dump"
COMPOSE_PROFILE="${SPRING_PROFILES_ACTIVE:-prod}"
if [ "$COMPOSE_PROFILE" = "production" ]; then
  COMPOSE_PROFILE="prod"
fi

CONTAINER_ID="$(docker compose --env-file "$ENV_FILE" -f "docker-compose.$COMPOSE_PROFILE.yml" ps -q postgres)"
if [ -z "$CONTAINER_ID" ]; then
  echo "Postgres container is not running." >&2
  exit 1
fi

docker exec "$CONTAINER_ID" pg_dump -U "$CLOUDCAMPUS_DB_USERNAME" -d "$CLOUDCAMPUS_DB_NAME" -Fc > "$OUT_FILE"
if command -v sha256sum >/dev/null 2>&1; then
  sha256sum "$OUT_FILE" > "$OUT_FILE.sha256"
else
  shasum -a 256 "$OUT_FILE" > "$OUT_FILE.sha256"
fi
echo "Backup written to $OUT_FILE"
