#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

printf '%s\n' 'Starting backend (Spring Boot) and frontend (Vite)...'

(
  cd "$ROOT_DIR/backend"
  mvn spring-boot:run
) &
BACKEND_PID=$!

(
  cd "$ROOT_DIR/frontend"
  npm run dev
) &
FRONTEND_PID=$!

cleanup() {
  printf '\n%s\n' 'Stopping development processes...'
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}

trap cleanup INT TERM
wait "$BACKEND_PID" "$FRONTEND_PID"
