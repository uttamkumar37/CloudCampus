#!/usr/bin/env sh
set -eu

COMPOSE_FILE="${COMPOSE_FILE:-infra/docker/local/compose.staging.yml}"
POSTGRES_SERVICE="${POSTGRES_SERVICE:-postgres}"
BACKUP_DIR="${BACKUP_DIR:-infra/backup/local}"
DB_USER="${CLOUDCAMPUS_DB_USERNAME:-cloudcampus}"
RESTORE_DB="${RESTORE_DB:-cloudcampus_restore_drill}"
KEEP_RESTORE_DB="${KEEP_RESTORE_DB:-false}"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required for the local PostgreSQL restore drill." >&2
  exit 1
fi

backup_file="${1:-}"
if [ -z "$backup_file" ]; then
  backup_file="$(find "$BACKUP_DIR" -type f -name '*.dump' 2>/dev/null | sort | tail -n 1)"
fi

if [ -z "$backup_file" ] || [ ! -s "$backup_file" ]; then
  echo "Backup file is required. Run scripts/ops/backup-local-postgres.sh first." >&2
  exit 1
fi

echo "Restoring backup into drill database '$RESTORE_DB': $backup_file"
docker compose -f "$COMPOSE_FILE" exec -T -e RESTORE_DB="$RESTORE_DB" "$POSTGRES_SERVICE" sh -c '
  set -eu
  export PGPASSWORD="$POSTGRES_PASSWORD"
  dropdb --if-exists -U "$POSTGRES_USER" "$RESTORE_DB"
  createdb -U "$POSTGRES_USER" "$RESTORE_DB"
'

cat "$backup_file" | docker compose -f "$COMPOSE_FILE" exec -T -e RESTORE_DB="$RESTORE_DB" "$POSTGRES_SERVICE" sh -c '
  set -eu
  export PGPASSWORD="$POSTGRES_PASSWORD"
  pg_restore -U "$POSTGRES_USER" -d "$RESTORE_DB" --no-owner --no-acl
'

table_count="$(docker compose -f "$COMPOSE_FILE" exec -T -e RESTORE_DB="$RESTORE_DB" "$POSTGRES_SERVICE" sh -c '
  set -eu
  export PGPASSWORD="$POSTGRES_PASSWORD"
  psql -U "$POSTGRES_USER" -d "$RESTORE_DB" -Atc "select count(*) from information_schema.tables where table_schema = '\''public'\'';"
' | tr -d '[:space:]')"

if [ "${table_count:-0}" -le 0 ]; then
  echo "Restore drill failed: restored database has no public tables." >&2
  exit 1
fi

if [ "$KEEP_RESTORE_DB" != "true" ]; then
  docker compose -f "$COMPOSE_FILE" exec -T -e RESTORE_DB="$RESTORE_DB" "$POSTGRES_SERVICE" sh -c '
    set -eu
    export PGPASSWORD="$POSTGRES_PASSWORD"
    dropdb --if-exists -U "$POSTGRES_USER" "$RESTORE_DB"
  ' >/dev/null
fi

echo "Restore drill passed: restored $table_count public tables."
