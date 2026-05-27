#!/usr/bin/env sh
set -eu

COMPOSE_FILE="${COMPOSE_FILE:-infra/docker/local/compose.staging.yml}"
POSTGRES_SERVICE="${POSTGRES_SERVICE:-postgres}"
BACKUP_DIR="${BACKUP_DIR:-infra/backup/local}"
DB_NAME="${CLOUDCAMPUS_DB_NAME:-cloudcampus}"
DB_USER="${CLOUDCAMPUS_DB_USERNAME:-cloudcampus}"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required for the local PostgreSQL backup drill." >&2
  exit 1
fi

timestamp="$(date -u '+%Y%m%dT%H%M%SZ')"
mkdir -p "$BACKUP_DIR"

backup_file="$BACKUP_DIR/cloudcampus-${DB_NAME}-${timestamp}.dump"
manifest_file="$backup_file.manifest"

echo "Creating PostgreSQL backup: $backup_file"
docker compose -f "$COMPOSE_FILE" exec -T "$POSTGRES_SERVICE" \
  pg_dump -U "$DB_USER" -d "$DB_NAME" --format=custom --no-owner --no-acl > "$backup_file"

if command -v sha256sum >/dev/null 2>&1; then
  checksum="$(sha256sum "$backup_file" | awk '{print $1}')"
elif command -v shasum >/dev/null 2>&1; then
  checksum="$(shasum -a 256 "$backup_file" | awk '{print $1}')"
else
  checksum="unavailable"
fi

size_bytes="$(wc -c < "$backup_file" | tr -d ' ')"
cat > "$manifest_file" <<EOF
created_at_utc=$timestamp
database=$DB_NAME
format=pg_dump_custom
file=$(basename "$backup_file")
size_bytes=$size_bytes
sha256=$checksum
restore_command=sh scripts/ops/restore-local-postgres-drill.sh "$backup_file"
EOF

echo "Backup complete: $backup_file"
echo "Manifest: $manifest_file"
