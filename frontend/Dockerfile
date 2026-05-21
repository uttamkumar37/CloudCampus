# syntax=docker/dockerfile:1.7

# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — Build the Vite static bundle.
#
# Using node:20-alpine (matches the Node version pinned in CI). The build
# stage installs all dev dependencies, runs `tsc -b && vite build`, and emits
# the static artefact under /app/dist.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps first so the layer is cacheable across source changes.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Now copy the rest and build.
COPY . .

# Build-time vars (defaults are dev-safe; override per environment with
# `--build-arg VITE_API_URL=https://api.cloudcampus.io`).
ARG VITE_API_URL=http://localhost:8080
ARG VITE_PUBLIC_APP_NAME=CloudCampus
ENV VITE_API_URL=$VITE_API_URL \
    VITE_PUBLIC_APP_NAME=$VITE_PUBLIC_APP_NAME

RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — Serve the static bundle with nginx (alpine).
#
# Image is tiny (~25 MB), root-less, and matches the nginx runtime already
# used in docker-compose.yml. The config:
#
#   • Serves /usr/share/nginx/html
#   • SPA fallback: any 404 falls back to index.html so client-side routes work
#   • Adds a /health endpoint for Kubernetes probes
#   • Caches /assets/* aggressively (fingerprinted by Vite)
#   • No caching for index.html so deploys are immediate
# ─────────────────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Drop default config so we own the routing.
RUN rm /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/cloudcampus-frontend.conf

# Run as the unprivileged nginx user (already in the base image).
USER nginx

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/health || exit 1
