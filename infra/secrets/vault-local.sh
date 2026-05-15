#!/usr/bin/env sh
# ─────────────────────────────────────────────────────────────────────────────
# CloudCampus — Local Vault dev bootstrap (CC-1906)
#
# Starts a HashiCorp Vault dev server and writes all CloudCampus secrets to
# the paths that Spring Cloud Vault would read in a production cluster.
#
# USE ONLY IN LOCAL DEVELOPMENT. The dev server stores everything in-memory
# and uses the root token "root" — it is not persistent or secure.
#
# Prerequisites:
#   brew install vault        (macOS)
#   apt-get install vault     (Linux)
#
# Usage:
#   ./infra/secrets/vault-local.sh          # starts Vault + writes secrets
#   ./infra/secrets/vault-local.sh teardown # kills the Vault process
#
# After running this script, start the backend with:
#   SPRING_CLOUD_VAULT_ENABLED=true \
#   SPRING_CLOUD_VAULT_TOKEN=root \
#   SPRING_CLOUD_VAULT_HOST=localhost \
#   SPRING_CLOUD_VAULT_PORT=8200 \
#   ./mvnw spring-boot:run -pl backend -Dspring-boot.run.profiles=dev
# ─────────────────────────────────────────────────────────────────────────────

set -eu

VAULT_ADDR="${VAULT_ADDR:-http://127.0.0.1:8200}"
VAULT_TOKEN="${VAULT_TOKEN:-root}"
VAULT_PIDFILE="/tmp/vault-cloudcampus.pid"
SECRET_PATH="secret/cloudcampus"

export VAULT_ADDR VAULT_TOKEN

log() { echo "[vault-local] $*"; }

# ── Teardown ──────────────────────────────────────────────────────────────────
if [ "${1:-}" = "teardown" ]; then
    if [ -f "${VAULT_PIDFILE}" ]; then
        PID="$(cat "${VAULT_PIDFILE}")"
        log "Stopping Vault (pid=${PID})..."
        kill "${PID}" 2>/dev/null || true
        rm -f "${VAULT_PIDFILE}"
        log "Vault stopped"
    else
        log "No Vault pidfile found at ${VAULT_PIDFILE}"
    fi
    exit 0
fi

# ── Start Vault dev server ────────────────────────────────────────────────────
if [ -f "${VAULT_PIDFILE}" ] && kill -0 "$(cat "${VAULT_PIDFILE}")" 2>/dev/null; then
    log "Vault already running (pid=$(cat "${VAULT_PIDFILE}"))"
else
    log "Starting Vault dev server on ${VAULT_ADDR}..."
    vault server -dev -dev-root-token-id="${VAULT_TOKEN}" \
        -dev-listen-address="127.0.0.1:8200" >/tmp/vault-cloudcampus.log 2>&1 &
    echo $! > "${VAULT_PIDFILE}"
    log "Vault started (pid=$(cat "${VAULT_PIDFILE}")) — logs at /tmp/vault-cloudcampus.log"

    # Wait for Vault to become ready.
    ATTEMPTS=0
    until vault status >/dev/null 2>&1 || [ "${ATTEMPTS}" -ge 20 ]; do
        sleep 0.5
        ATTEMPTS=$((ATTEMPTS + 1))
    done

    if ! vault status >/dev/null 2>&1; then
        log "ERROR: Vault did not become ready after 10 seconds"
        exit 1
    fi
    log "Vault is ready"
fi

# ── Write secrets ─────────────────────────────────────────────────────────────
log "Writing secrets to ${SECRET_PATH}..."

# Generate random secrets for local dev (non-prod, but not the hardcoded defaults).
JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32)}"
ENCRYPTION_SECRET="${ENCRYPTION_SECRET:-$(openssl rand -hex 32)}"
DB_PASSWORD="${POSTGRES_PASSWORD:-cloudcampus_dev}"
RABBITMQ_PASSWORD="${RABBITMQ_PASSWORD:-cloudcampus_dev}"

vault kv put "${SECRET_PATH}" \
    jwt_secret="${JWT_SECRET}" \
    encryption_secret="${ENCRYPTION_SECRET}" \
    db_password="${DB_PASSWORD}" \
    bootstrap_admin_password="admin123" \
    rabbitmq_password="${RABBITMQ_PASSWORD}" \
    mail_password="" \
    minio_access_key="minioadmin" \
    minio_secret_key="minioadmin"

log "Secrets written. Verify with:"
log "  vault kv get ${SECRET_PATH}"
log ""
log "Spring Cloud Vault path mapping (bootstrap.yml):"
log "  spring.cloud.vault.kv.backend: secret"
log "  spring.cloud.vault.kv.default-context: cloudcampus"
log ""
log "To stop Vault:  ./infra/secrets/vault-local.sh teardown"
