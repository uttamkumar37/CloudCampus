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
#   DRILL_TENANT_ID     Tenant UUID to validate as an isolated tenant restore.
#                       If omitted, the first tenant in the restored dump is used.
#   DRILL_TENANT_SCOPE_SCHEMA
#                       Schema created inside the scratch DB for tenant-only rows
#                       (default: tenant_restore_scope).
# ─────────────────────────────────────────────────────────────────────────────

case "${1:-}" in
    -h|--help)
        cat <<'EOF'
CloudCampus backup/restore drill

Usage:
  sh infra/pgbackup/drill.sh [--help]

Required environment:
  PGPASSWORD
  BACKUP_PASSPHRASE

Common environment:
  PG_HOST=postgres
  PG_PORT=5432
  PG_DB=cloudcampus
  PG_USER=cloudcampus
  MINIO_ENDPOINT=http://minio:9000
  MINIO_ACCESS_KEY=minioadmin
  MINIO_SECRET_KEY=minioadmin
  MINIO_BUCKET=cloudcampus-backups

Per-tenant restore drill:
  DRILL_TENANT_ID=<tenant UUID>
      Restores the encrypted dump into a scratch database, creates an isolated
      tenant-only schema from the selected tenant's rows, and validates row
      counts for every table with tenant_id.

  DRILL_TENANT_SCOPE_SCHEMA=tenant_restore_scope
      Scratch schema name used for the tenant-only restore slice.

Other options:
  DRILL_SKIP_BACKUP=1
      Use the latest existing dump from MinIO instead of creating a fresh one.

  DRILL_DB_SUFFIX=_drilltest
      Scratch database suffix. The scratch database is dropped on exit.
EOF
        exit 0
        ;;
esac

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
DRILL_TENANT_ID="${DRILL_TENANT_ID:-}"
DRILL_TENANT_SCOPE_SCHEMA="${DRILL_TENANT_SCOPE_SCHEMA:-tenant_restore_scope}"

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

case "${DRILL_TENANT_SCOPE_SCHEMA}" in
    ''|*[!A-Za-z0-9_]*)
        err "DRILL_TENANT_SCOPE_SCHEMA must contain only letters, numbers, and underscores"
        exit ${FAIL}
        ;;
esac

if [ -n "${DRILL_TENANT_ID}" ] \
    && ! echo "${DRILL_TENANT_ID}" | grep -Eq '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'; then
    err "DRILL_TENANT_ID must be a UUID"
    exit ${FAIL}
fi

psql_exec() {
    DB_NAME="$1"
    SQL="$2"
    psql \
        --host="${PG_HOST}" --port="${PG_PORT}" \
        --username="${PG_USER}" --dbname="${DB_NAME}" \
        --no-password --set=ON_ERROR_STOP=1 --quiet \
        -c "${SQL}"
}

psql_scalar() {
    DB_NAME="$1"
    SQL="$2"
    psql \
        --host="${PG_HOST}" --port="${PG_PORT}" \
        --username="${PG_USER}" --dbname="${DB_NAME}" \
        --no-password --set=ON_ERROR_STOP=1 --tuples-only --no-align --quiet \
        -c "${SQL}" \
    | tr -d '[:space:]'
}

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

validate_tenant_restore_scope() {
    if [ -z "${DRILL_TENANT_ID}" ]; then
        DRILL_TENANT_ID="$(psql_scalar "${DRILL_DB}" "SELECT id::text FROM public.tenants ORDER BY created_at NULLS LAST, id LIMIT 1;")"
        if [ -z "${DRILL_TENANT_ID}" ]; then
            err "Per-tenant restore: no tenant found in restored dump"
            DRILL_FAILED=1
            return
        fi
        ok "Per-tenant restore: DRILL_TENANT_ID not set; selected ${DRILL_TENANT_ID}"
    fi

    if ! echo "${DRILL_TENANT_ID}" | grep -Eq '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'; then
        err "Per-tenant restore: selected tenant id is not a UUID (${DRILL_TENANT_ID})"
        DRILL_FAILED=1
        return
    fi

    TARGET_TENANT_COUNT="$(psql_scalar "${DRILL_DB}" "SELECT COUNT(*) FROM public.tenants WHERE id = '${DRILL_TENANT_ID}'::uuid;")"
    if [ "${TARGET_TENANT_COUNT}" != "1" ]; then
        err "Per-tenant restore: target tenant ${DRILL_TENANT_ID} not found in restored dump"
        DRILL_FAILED=1
        return
    fi

    OTHER_TENANT_COUNT="$(psql_scalar "${DRILL_DB}" "SELECT COUNT(*) FROM public.tenants WHERE id <> '${DRILL_TENANT_ID}'::uuid;")"
    ok "Per-tenant restore: target tenant present; ${OTHER_TENANT_COUNT} other tenant(s) remain only in the full scratch DB"

    log "Per-tenant restore: creating isolated schema '${DRILL_TENANT_SCOPE_SCHEMA}'..."
    psql_exec "${DRILL_DB}" "DROP SCHEMA IF EXISTS ${DRILL_TENANT_SCOPE_SCHEMA} CASCADE;"
    psql_exec "${DRILL_DB}" "CREATE SCHEMA ${DRILL_TENANT_SCOPE_SCHEMA};"
    psql_exec "${DRILL_DB}" "CREATE TABLE ${DRILL_TENANT_SCOPE_SCHEMA}.tenants AS SELECT * FROM public.tenants WHERE id = '${DRILL_TENANT_ID}'::uuid;"

    SCOPE_TENANT_COUNT="$(psql_scalar "${DRILL_DB}" "SELECT COUNT(*) FROM ${DRILL_TENANT_SCOPE_SCHEMA}.tenants;")"
    if [ "${SCOPE_TENANT_COUNT}" = "1" ]; then
        ok "Per-tenant restore: scoped tenants table contains exactly the selected tenant"
    else
        err "Per-tenant restore: scoped tenants table expected 1 row, got ${SCOPE_TENANT_COUNT}"
        DRILL_FAILED=1
    fi

    TENANT_TABLES="$(psql \
        --host="${PG_HOST}" --port="${PG_PORT}" \
        --username="${PG_USER}" --dbname="${DRILL_DB}" \
        --no-password --set=ON_ERROR_STOP=1 --tuples-only --no-align --quiet \
        -c "SELECT c.table_name
            FROM information_schema.columns c
            JOIN information_schema.tables t
              ON t.table_schema = c.table_schema
             AND t.table_name = c.table_name
            WHERE c.table_schema = 'public'
              AND c.column_name = 'tenant_id'
              AND t.table_type = 'BASE TABLE'
            ORDER BY c.table_name;")"

    TABLE_COUNT=0
    OLD_IFS="${IFS}"
    IFS='
'
    for TABLE in ${TENANT_TABLES}; do
        [ -n "${TABLE}" ] || continue
        if ! echo "${TABLE}" | grep -Eq '^[A-Za-z_][A-Za-z0-9_]*$'; then
            err "Per-tenant restore: unsafe table identifier '${TABLE}'"
            DRILL_FAILED=1
            continue
        fi

        TABLE_COUNT=$((TABLE_COUNT + 1))
        psql_exec "${DRILL_DB}" "CREATE TABLE ${DRILL_TENANT_SCOPE_SCHEMA}.\"${TABLE}\" AS SELECT * FROM public.\"${TABLE}\" WHERE tenant_id = '${DRILL_TENANT_ID}'::uuid;"

        RESTORED_COUNT="$(psql_scalar "${DRILL_DB}" "SELECT COUNT(*) FROM public.\"${TABLE}\" WHERE tenant_id = '${DRILL_TENANT_ID}'::uuid;")"
        SCOPE_COUNT="$(psql_scalar "${DRILL_DB}" "SELECT COUNT(*) FROM ${DRILL_TENANT_SCOPE_SCHEMA}.\"${TABLE}\";")"
        SCOPE_OTHER_COUNT="$(psql_scalar "${DRILL_DB}" "SELECT COUNT(*) FROM ${DRILL_TENANT_SCOPE_SCHEMA}.\"${TABLE}\" WHERE tenant_id IS DISTINCT FROM '${DRILL_TENANT_ID}'::uuid;")"

        if [ "${RESTORED_COUNT}" = "${SCOPE_COUNT}" ] && [ "${SCOPE_OTHER_COUNT}" = "0" ]; then
            ok "Per-tenant restore: ${TABLE} target rows=${SCOPE_COUNT}, cross-tenant rows=0"
        else
            err "Per-tenant restore: ${TABLE} mismatch restored=${RESTORED_COUNT}, scoped=${SCOPE_COUNT}, crossTenant=${SCOPE_OTHER_COUNT}"
            DRILL_FAILED=1
        fi
    done
    IFS="${OLD_IFS}"

    if [ "${TABLE_COUNT}" -eq 0 ]; then
        err "Per-tenant restore: no tenant-scoped tables were discovered"
        DRILL_FAILED=1
    else
        ok "Per-tenant restore: validated ${TABLE_COUNT} tenant-scoped table(s)"
    fi

    for REQUIRED_TABLE in schools users; do
        REQUIRED_COUNT="$(psql_scalar "${DRILL_DB}" "SELECT COUNT(*) FROM ${DRILL_TENANT_SCOPE_SCHEMA}.\"${REQUIRED_TABLE}\";")"
        if echo "${REQUIRED_COUNT}" | grep -qE '^[0-9]+$' && [ "${REQUIRED_COUNT}" -gt 0 ]; then
            ok "Per-tenant restore: required table '${REQUIRED_TABLE}' has ${REQUIRED_COUNT} scoped row(s)"
        else
            err "Per-tenant restore: required table '${REQUIRED_TABLE}' expected > 0 scoped rows, got '${REQUIRED_COUNT}'"
            DRILL_FAILED=1
        fi
    done
}

# Core tables — must have at least one row in a real database.
# In a blank dev environment these may be empty; set DRILL_SKIP_BACKUP=1
# and point at a staging MinIO to test against real data.
check_table_nonempty "schools"
check_table_nonempty "users"
check_flyway
validate_tenant_restore_scope

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
    echo "  Tenant: ${DRILL_TENANT_ID}"
    echo "  Tenant scope: ${DRILL_DB}.${DRILL_TENANT_SCOPE_SCHEMA}"
    echo "══════════════════════════════════════════"
    exit ${PASS}
else
    echo "══════════════════════════════════════════"
    echo "  DRILL RESULT: FAIL  — see errors above"
    echo "  Dump: ${LATEST_OBJECT}"
    echo "  Tenant: ${DRILL_TENANT_ID:-not selected}"
    echo "  Tenant scope: ${DRILL_DB}.${DRILL_TENANT_SCOPE_SCHEMA}"
    echo "══════════════════════════════════════════"
    exit ${FAIL}
fi
