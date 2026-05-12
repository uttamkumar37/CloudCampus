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

RUN apk add --no-cache curl ca-certificates \
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

# ── Copy backup script and crontab ───────────────────────────────────────────
COPY backup.sh /usr/local/bin/backup.sh
RUN chmod +x /usr/local/bin/backup.sh

COPY crontab /etc/supercronic/crontab

# ── Default entrypoint: run supercronic with the crontab ─────────────────────
CMD ["supercronic", "/etc/supercronic/crontab"]
