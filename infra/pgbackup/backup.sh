#!/usr/bin/env sh
# ─────────────────────────────────────────────────────────────────────────────
# CloudCampus — PostgreSQL backup script
#
# Runs inside the pgbackup sidecar container on a cron schedule.
# Dumps the target database, encrypts with GPG symmetric AES-256, uploads
# to MinIO, then prunes dumps older than RETENTION_DAYS (default: 7).
#
# Environment variables:
#   PG_HOST              PostgreSQL host          (default: postgres)
#   PG_PORT              PostgreSQL port          (default: 5432)
#   PG_DB                Database name            (default: cloudcampus)
#   PG_USER              PostgreSQL user          (default: cloudcampus)
#   PGPASSWORD           PostgreSQL password       (required)
#   MINIO_ENDPOINT       MinIO endpoint URL       (default: http://minio:9000)
#   MINIO_ACCESS_KEY     MinIO access key         (required)
#   MINIO_SECRET_KEY     MinIO secret key         (required)
#   MINIO_BUCKET         Target bucket name       (default: cloudcampus-backups)
#   RETENTION_DAYS       Days of dumps to keep    (default: 7)
#   BACKUP_PASSPHRASE    GPG encryption passphrase (required — store in secret)
# ─────────────────────────────────────────────────────────────────────────────

set -eu

# ── Config ────────────────────────────────────────────────────────────────────
PG_HOST="${PG_HOST:-postgres}"
PG_PORT="${PG_PORT:-5432}"
PG_DB="${PG_DB:-cloudcampus}"
PG_USER="${PG_USER:-cloudcampus}"
MINIO_ENDPOINT="${MINIO_ENDPOINT:-http://minio:9000}"
MINIO_ACCESS_KEY="${MINIO_ACCESS_KEY:?MINIO_ACCESS_KEY is required}"
MINIO_SECRET_KEY="${MINIO_SECRET_KEY:?MINIO_SECRET_KEY is required}"
MINIO_BUCKET="${MINIO_BUCKET:-cloudcampus-backups}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
BACKUP_PASSPHRASE="${BACKUP_PASSPHRASE:?BACKUP_PASSPHRASE is required for encrypted backups}"

TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DUMP_FILE="/tmp/pgbackup/cloudcampus_${TIMESTAMP}.dump"
ENC_FILE="${DUMP_FILE}.gpg"
MINIO_ALIAS="backup"

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"; }

die() { log "ERROR: $*"; exit 1; }

# ── 0. Pre-flight ─────────────────────────────────────────────────────────────
mkdir -p /tmp/pgbackup
command -v gpg >/dev/null 2>&1 || die "gpg not found in PATH"
command -v pg_dump >/dev/null 2>&1 || die "pg_dump not found in PATH"
command -v mc >/dev/null 2>&1 || die "mc not found in PATH"

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

# ── 2. Encrypt with GPG AES-256 ──────────────────────────────────────────────
log "Encrypting dump with GPG AES-256"
gpg --batch \
    --yes \
    --passphrase "${BACKUP_PASSPHRASE}" \
    --cipher-algo AES256 \
    --symmetric \
    --output "${ENC_FILE}" \
    "${DUMP_FILE}"
rm -f "${DUMP_FILE}"
log "Encryption complete ($(du -sh "${ENC_FILE}" | cut -f1))"

# ── 3. Configure MinIO client alias ──────────────────────────────────────────
mc alias set "${MINIO_ALIAS}" "${MINIO_ENDPOINT}" "${MINIO_ACCESS_KEY}" "${MINIO_SECRET_KEY}" --quiet

# ── 4. Ensure bucket exists ───────────────────────────────────────────────────
mc mb --ignore-existing "${MINIO_ALIAS}/${MINIO_BUCKET}" --quiet

# ── 5. Upload encrypted dump ──────────────────────────────────────────────────
OBJECT_KEY="pg/${PG_DB}/${TIMESTAMP}.dump.gpg"
log "Uploading → s3://${MINIO_BUCKET}/${OBJECT_KEY}"
mc cp "${ENC_FILE}" "${MINIO_ALIAS}/${MINIO_BUCKET}/${OBJECT_KEY}" --quiet
log "Upload complete"

# ── 6. Prune old dumps (retention) ───────────────────────────────────────────
log "Pruning dumps older than ${RETENTION_DAYS} days"
mc find "${MINIO_ALIAS}/${MINIO_BUCKET}/pg/${PG_DB}/" \
  --older-than "${RETENTION_DAYS}d" \
  --name "*.dump.gpg" \
  | while IFS= read -r obj; do
      log "Deleting old dump: ${obj}"
      mc rm "${obj}" --quiet
    done

# ── 7. Cleanup local temp files ───────────────────────────────────────────────
rm -f "${ENC_FILE}"
log "Backup job finished successfully"
