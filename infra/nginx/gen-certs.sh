#!/usr/bin/env sh
# Generate a self-signed TLS certificate for local development.
# In production, replace certs/server.crt and certs/server.key with
# a certificate signed by a trusted CA (Let's Encrypt, ACM, etc.)
set -eu
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CERT_DIR="${SCRIPT_DIR}/certs"
mkdir -p "${CERT_DIR}"

openssl req -x509 -nodes -days 365 \
    -newkey rsa:4096 \
    -keyout "${CERT_DIR}/server.key" \
    -out    "${CERT_DIR}/server.crt" \
    -subj   "/C=US/ST=Dev/L=Dev/O=CloudCampus/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

chmod 600 "${CERT_DIR}/server.key"
echo "Self-signed cert generated at ${CERT_DIR}/"
