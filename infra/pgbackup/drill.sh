#!/usr/bin/env sh
# ─────────────────────────────────────────────────────────────────────────────
# CloudCampus — Backup/restore drill script (CC-1905)
#
# Disaster-recovery test: triggers a fresh backup, downloads it from MinIO,
# restores into a scratch database, validates row counts, then tears down.
# Exit code 0 = PASS, 1 = FAIL.
#
# Intended use:
#   docker run --rm --env-file .env cloudcampus-pgbackup:latest drill.sh
#   Or run via a CI job / ops runbook to verify backup integrity.
#
# Environment variables (same as backup.sh — can share the same env_file):
#   PG_HOST, PG_PORT, PG_DB, PG_USER, PGPASSWORD   (PostgreSQL connection)
#   MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET
#   BACKUP_PASSPHRASE                             (GPG decrypt passphrase)
#
# Optional:
#   DRILL_SKIP_BACKUP   Set to "1" to skip running backup.sh and use the
#                       most recent existing dump from MinIO instead.
#   DRILL_DB_SUFFIX     Scratch database suffix  (default: _drilltest)
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
BACKUP_PASSPHRASE="${BACKUP_PASSPHRASE:?BACKUP_PASSPHRASE is required for encrypted backup drills}"
DRILL_SKIP_BACKUP="${DRILL_SKIP_BACKUP:-0}"
DRILL_DB_SUFFIX="${DRILL_DB_SUFFIX:-_drilltest}"

DRILL_DB="${PG_DB}${DRILL_DB_SUFFIX}"
MINIO_ALIAS="drillcheck"
ENC_RESTORE_FILE="/tmp/drill_restore.dump.gpg"
RESTORE_FILE="/tmp/drill_restore.dump"
PASS=0
FAIL=1

log()  { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [DRILL] $*"; }
ok()   { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [DRILL] ✓ $*"; }
err()  { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [DRILL] ✗ $*" >&2; }
fail() { err "$*"; cleanup; exit ${FAIL}; }

# ── Cleanup (always runs, even on error) ─────────────────────────────────────
cleanup() {
    log "Cleaning up drill artifacts..."
    rm -f "${ENC_RESTORE_FILE}" "${RESTORE_FILE}"
    psql \
        --host="${PG_HOST}" --port="${PG_PORT}" \
        --username="${PG_USER}" --dbname=postgres \
        --no-password --tuples-only --quiet \
        -c "DROP DATABASE IF EXISTS ${DRILL_DB};" 2>/dev/null || true
    log "Cleanup complete"
}

# Register cleanup on exit so it runs even if the script is interrupted.
trap cleanup EXIT

# ── 1. Optionally trigger a fresh backup ─────────────────────────────────────
if [ "${DRILL_SKIP_BACKUP}" = "1" ]; then
    log "DRILL_SKIP_BACKUP=1 — skipping fresh backup, using latest existing dump"
else
    log "Step 1/6: Triggering fresh backup via backup.sh..."
    /usr/local/bin/backup.sh
    ok "Fresh backup completed"
fi

# ── 2. Configure MinIO alias and find the latest dump ─────────────────────────
log "Step 2/6: Locating latest dump in MinIO..."
mc alias set "${MINIO_ALIAS}" "${MINIO_ENDPOINT}" "${MINIO_ACCESS_KEY}" "${MINIO_SECRET_KEY}" --quiet

LATEST_OBJECT="$(
    mc find "${MINIO_ALIAS}/${MINIO_BUCKET}/pg/${PG_DB}/" \
        --name "*.dump.gpg" 2>/dev/null \
    | sort \
    | tail -n 1
)"

if [ -z "${LATEST_OBJECT}" ]; then
    fail "No dump files found in MinIO at bucket=${MINIO_BUCKET} prefix=pg/${PG_DB}/"
fi
ok "Latest dump: ${LATEST_OBJECT}"

# ── 3. Download dump ──────────────────────────────────────────────────────────
log "Step 3/6: Downloading encrypted dump -> ${ENC_RESTORE_FILE}..."
mc cp "${LATEST_OBJECT}" "${ENC_RESTORE_FILE}" --quiet
ok "Downloaded ($(du -sh "${ENC_RESTORE_FILE}" | cut -f1))"

log "Decrypting dump -> ${RESTORE_FILE}..."
gpg --batch \
    --yes \
    --passphrase "${BACKUP_PASSPHRASE}" \
    --decrypt \
    --output "${RESTORE_FILE}" \
    "${ENC_RESTORE_FILE}" \
    || fail "GPG decrypt failed — passphrase may be wrong or dump is corrupt"
ok "Decrypted ($(du -sh "${RESTORE_FILE}" | cut -f1))"

# ── 4. Create scratch database ────────────────────────────────────────────────
log "Step 4/6: Creating scratch database '${DRILL_DB}'..."
psql \
    --host="${PG_HOST}" --port="${PG_PORT}" \
    --username="${PG_USER}" --dbname=postgres \
    --no-password --tuples-only --quiet \
    -c "DROP DATABASE IF EXISTS ${DRILL_DB};" || true

psql \
    --host="${PG_HOST}" --port="${PG_PORT}" \
    --username="${PG_USER}" --dbname=postgres \
    --no-password --tuples-only --quiet \
    -c "CREATE DATABASE ${DRILL_DB} OWNER ${PG_USER};" \
    || fail "Failed to create scratch database '${DRILL_DB}'"
ok "Scratch database '${DRILL_DB}' created"

# ── 5. Restore ────────────────────────────────────────────────────────────────
log "Step 5/6: Restoring dump into '${DRILL_DB}'..."
pg_restore \
    --host="${PG_HOST}" \
    --port="${PG_PORT}" \
    --username="${PG_USER}" \
    --dbname="${DRILL_DB}" \
    --no-password \
    --no-owner \
    --no-privileges \
    --exit-on-error \
    "${RESTORE_FILE}" \
    || fail "pg_restore failed — dump may be corrupt or incompatible"
ok "Restore complete"

# ── 6. Validate ───────────────────────────────────────────────────────────────
log "Step 6/6: Running validation checks..."

DRILL_FAILED=0

check_table_nonempty() {
    TABLE="$1"
    COUNT="$(psql \
        --host="${PG_HOST}" --port="${PG_PORT}" \
        --username="${PG_USER}" --dbname="${DRILL_DB}" \
        --no-password --tuples-only --quiet \
        -c "SELECT COUNT(*) FROM ${TABLE};" 2>&1 | tr -d ' ')"
    if echo "${COUNT}" | grep -qE '^[0-9]+$' && [ "${COUNT}" -gt 0 ]; then
        ok "Table '${TABLE}': ${COUNT} row(s)"
    else
        err "Table '${TABLE}': expected > 0 rows, got '${COUNT}'"
        DRILL_FAILED=1
    fi
}

check_flyway() {
    # Confirm at least one Flyway migration record exists (schema is migrated).
    COUNT="$(psql \
        --host="${PG_HOST}" --port="${PG_PORT}" \
        --username="${PG_USER}" --dbname="${DRILL_DB}" \
        --no-password --tuples-only --quiet \
        -c "SELECT COUNT(*) FROM flyway_schema_history WHERE success = true;" 2>&1 | tr -d ' ')"
    if echo "${COUNT}" | grep -qE '^[0-9]+$' && [ "${COUNT}" -gt 0 ]; then
        ok "flyway_schema_history: ${COUNT} successful migration(s)"
    else
        err "flyway_schema_history: no successful migrations found (got '${COUNT}')"
        DRILL_FAILED=1
    fi

    # Confirm V40 (PII column widening) is present.
    V40="$(psql \
        --host="${PG_HOST}" --port="${PG_PORT}" \
        --username="${PG_USER}" --dbname="${DRILL_DB}" \
        --no-password --tuples-only --quiet \
        -c "SELECT COUNT(*) FROM flyway_schema_history WHERE version = '40' AND success = true;" \
        2>&1 | tr -d ' ')"
    if [ "${V40}" = "1" ]; then
        ok "Migration V40 (PII column widening) present"
    else
        err "Migration V40 missing from restored schema"
        DRILL_FAILED=1
    fi
}

# Core tables — must have at least one row in a real database.
# In a blank dev environment these may be empty; set DRILL_SKIP_BACKUP=1
# and point at a staging MinIO to test against real data.
check_table_nonempty "schools"
check_table_nonempty "users"
check_flyway

# Non-critical tables — warn only (may be empty in a fresh instance).
for TABLE in students staff attendance_sessions; do
    COUNT="$(psql \
        --host="${PG_HOST}" --port="${PG_PORT}" \
        --username="${PG_USER}" --dbname="${DRILL_DB}" \
        --no-password --tuples-only --quiet \
        -c "SELECT COUNT(*) FROM ${TABLE};" 2>&1 | tr -d ' ')"
    if echo "${COUNT}" | grep -qE '^[0-9]+$'; then
        ok "Table '${TABLE}': ${COUNT} row(s) (informational)"
    else
        err "Table '${TABLE}': query failed — '${COUNT}'"
        DRILL_FAILED=1
    fi
done

# ── Result ────────────────────────────────────────────────────────────────────
echo ""
if [ "${DRILL_FAILED}" -eq 0 ]; then
    echo "══════════════════════════════════════════"
    echo "  DRILL RESULT: PASS"
    echo "  Dump: ${LATEST_OBJECT}"
    echo "══════════════════════════════════════════"
    exit ${PASS}
else
    echo "══════════════════════════════════════════"
    echo "  DRILL RESULT: FAIL  — see errors above"
    echo "  Dump: ${LATEST_OBJECT}"
    echo "══════════════════════════════════════════"
    exit ${FAIL}
fi
