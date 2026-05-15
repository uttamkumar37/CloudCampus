#!/usr/bin/env sh
# ─────────────────────────────────────────────────────────────────────────────
# CloudCampus — PostgreSQL backup script
#
# Runs inside the pgbackup sidecar container on a cron schedule.
# Dumps the target database, uploads to MinIO, then prunes dumps older than
# RETENTION_DAYS (default: 7).
#
# Environment variables (all required — supplied via docker-compose env_file or
# environment block):
#   PG_HOST           PostgreSQL host          (default: postgres)
#   PG_PORT           PostgreSQL port          (default: 5432)
#   PG_DB             Database name            (default: cloudcampus)
#   PG_USER           PostgreSQL user          (default: cloudcampus)
#   PGPASSWORD        PostgreSQL password       (no default — must be set)
#   MINIO_ENDPOINT    MinIO endpoint URL       (default: http://minio:9000)
#   MINIO_ACCESS_KEY  MinIO root user          (default: minioadmin)
#   MINIO_SECRET_KEY  MinIO root password      (default: minioadmin)
#   MINIO_BUCKET      Target bucket name       (default: cloudcampus-backups)
#   RETENTION_DAYS    Days of dumps to keep    (default: 7)
# ─────────────────────────────────────────────────────────────────────────────

set -eu

# ── Config ────────────────────────────────────────────────────────────────────
PG_HOST="${PG_HOST:-postgres}"
PG_PORT="${PG_PORT:-5432}"
PG_DB="${PG_DB:-cloudcampus}"
PG_USER="${PG_USER:-cloudcampus}"
MINIO_ENDPOINT="${MINIO_ENDPOINT:-http://minio:9000}"
MINIO_ACCESS_KEY="${MINIO_ACCESS_KEY:-minioadmin}"
MINIO_SECRET_KEY="${MINIO_SECRET_KEY:-minioadmin}"
MINIO_BUCKET="${MINIO_BUCKET:-cloudcampus-backups}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DUMP_FILE="/tmp/cloudcampus_${TIMESTAMP}.dump"
MINIO_ALIAS="backup"

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"; }

# ── 1. Dump ───────────────────────────────────────────────────────────────────
log "Starting pg_dump → ${DUMP_FILE}"
pg_dump \
  --host="${PG_HOST}" \
  --port="${PG_PORT}" \
  --username="${PG_USER}" \
  --dbname="${PG_DB}" \
  --format=custom \
  --compress=9 \
  --no-password \
  --file="${DUMP_FILE}"
log "pg_dump complete ($(du -sh "${DUMP_FILE}" | cut -f1))"

# ── 2. Configure MinIO client alias ──────────────────────────────────────────
mc alias set "${MINIO_ALIAS}" "${MINIO_ENDPOINT}" "${MINIO_ACCESS_KEY}" "${MINIO_SECRET_KEY}" --quiet

# ── 3. Ensure bucket exists ───────────────────────────────────────────────────
mc mb --ignore-existing "${MINIO_ALIAS}/${MINIO_BUCKET}" --quiet

# ── 4. Upload ─────────────────────────────────────────────────────────────────
OBJECT_KEY="pg/${PG_DB}/${TIMESTAMP}.dump"
log "Uploading → s3://${MINIO_BUCKET}/${OBJECT_KEY}"
mc cp "${DUMP_FILE}" "${MINIO_ALIAS}/${MINIO_BUCKET}/${OBJECT_KEY}" --quiet
log "Upload complete"

# ── 5. Prune old dumps (retention) ───────────────────────────────────────────
log "Pruning dumps older than ${RETENTION_DAYS} days"
mc find "${MINIO_ALIAS}/${MINIO_BUCKET}/pg/${PG_DB}/" \
  --older-than "${RETENTION_DAYS}d" \
  --name "*.dump" \
  | while IFS= read -r obj; do
      log "Deleting old dump: ${obj}"
      mc rm "${obj}" --quiet
    done

# ── 6. Cleanup local temp file ────────────────────────────────────────────────
rm -f "${DUMP_FILE}"
log "Backup job finished successfully"
