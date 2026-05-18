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

ARG SUPERCRONIC_VERSION=0.2.29

# ── Install MinIO client + supercronic ───────────────────────────────────────
# Architecture is detected at build time so this image builds correctly on
# both amd64 (CI / prod) and arm64 (Apple Silicon dev machines).
RUN apk add --no-cache curl ca-certificates gnupg gnupg-utils \
    && ARCH=$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/') \
    && curl -fsSL \
       "https://dl.min.io/client/mc/release/linux-${ARCH}/mc" \
       -o /usr/local/bin/mc \
    && chmod +x /usr/local/bin/mc \
    && curl -fsSL \
       "https://github.com/aptible/supercronic/releases/download/v${SUPERCRONIC_VERSION}/supercronic-linux-${ARCH}" \
       -o /usr/local/bin/supercronic \
    && chmod +x /usr/local/bin/supercronic \
    && mc --version \
    && test -x /usr/local/bin/supercronic

# ── Create non-root backup user ───────────────────────────────────────────────
RUN addgroup -S backup && adduser -S -G backup backup \
    && mkdir -p /var/backups /tmp/pgbackup \
    && chown -R backup:backup /var/backups /tmp/pgbackup

# ── Copy backup scripts and crontab ──────────────────────────────────────────
COPY backup.sh /usr/local/bin/backup.sh
COPY drill.sh  /usr/local/bin/drill.sh
RUN chmod +x /usr/local/bin/backup.sh /usr/local/bin/drill.sh

COPY crontab /etc/supercronic/crontab
RUN supercronic -test /etc/supercronic/crontab

# ── Run as non-root ───────────────────────────────────────────────────────────
USER backup

# ── Default entrypoint: run supercronic with the crontab ─────────────────────
CMD ["supercronic", "/etc/supercronic/crontab"]
