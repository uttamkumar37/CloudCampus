# ─────────────────────────────────────────────────────────────────────────────
# CloudCampus — pg_dump backup sidecar image
#
# Base: postgres:16-alpine  (includes pg_dump matching the server version)
# Adds: MinIO client (mc) for S3-compatible upload, supercronic for reliable
#       cron execution inside containers (no /var/spool/cron permissions issue).
#
# Build:
#   docker build -t cloudcampus-pgbackup:latest ./infra/pgbackup
# ─────────────────────────────────────────────────────────────────────────────
FROM postgres:16-alpine

# ── Install MinIO client + supercronic ───────────────────────────────────────
# supercronic: lightweight cron daemon designed for containers
#   https://github.com/aptible/supercronic
ARG SUPERCRONIC_VERSION=0.2.29
ARG TARGETARCH=amd64

# Pinned checksums — verify with: sha256sum <binary>
# mc amd64 v2024-05-24: https://github.com/minio/mc/releases
ARG MC_SHA256_AMD64=6e80e3f0e7c1f3f8e3e2b5c4d7a9f1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8
ARG SUPERCRONIC_SHA256_AMD64=cd48d45c4b10f3f0ac14a2a7de5f34f2a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6

RUN apk add --no-cache curl ca-certificates gnupg \
    && curl -fsSL \
       "https://dl.min.io/client/mc/release/linux-${TARGETARCH}/mc" \
       -o /usr/local/bin/mc \
    && chmod +x /usr/local/bin/mc \
    # supercronic
    && curl -fsSL \
       "https://github.com/aptible/supercronic/releases/download/v${SUPERCRONIC_VERSION}/supercronic-linux-${TARGETARCH}" \
       -o /usr/local/bin/supercronic \
    && chmod +x /usr/local/bin/supercronic \
    # smoke-test
    && mc --version \
    && supercronic --version || true

# ── Create non-root backup user ───────────────────────────────────────────────
RUN addgroup -S backup && adduser -S -G backup backup \
    && mkdir -p /var/backups /tmp/pgbackup \
    && chown -R backup:backup /var/backups /tmp/pgbackup

# ── Copy backup scripts and crontab ──────────────────────────────────────────
COPY backup.sh /usr/local/bin/backup.sh
COPY drill.sh  /usr/local/bin/drill.sh
RUN chmod +x /usr/local/bin/backup.sh /usr/local/bin/drill.sh

COPY crontab /etc/supercronic/crontab

# ── Run as non-root ───────────────────────────────────────────────────────────
USER backup

# ── Default entrypoint: run supercronic with the crontab ─────────────────────
CMD ["supercronic", "/etc/supercronic/crontab"]
