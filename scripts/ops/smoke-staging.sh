#!/usr/bin/env sh
set -eu

BACKEND_URL="${BACKEND_URL:-http://127.0.0.1:8080}"
FRONTEND_URL="${FRONTEND_URL:-http://127.0.0.1:5173}"

check_url() {
  name="$1"
  url="$2"
  code="$(curl -fsS -o /dev/null -w '%{http_code}' "$url")"
  if [ "$code" != "200" ]; then
    echo "$name smoke failed: expected 200 from $url, got $code" >&2
    exit 1
  fi
  echo "$name smoke passed: $url"
}

check_url "backend health" "$BACKEND_URL/actuator/health"
check_url "backend readiness" "$BACKEND_URL/actuator/health/readiness"
check_url "frontend" "$FRONTEND_URL/"

if [ -n "${CLOUDCAMPUS_SMOKE_EMAIL:-}" ] && [ -n "${CLOUDCAMPUS_SMOKE_PASSWORD:-}" ]; then
  login_code="$(curl -fsS -o /tmp/cloudcampus-smoke-login.json -w '%{http_code}' \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"$CLOUDCAMPUS_SMOKE_EMAIL\",\"password\":\"$CLOUDCAMPUS_SMOKE_PASSWORD\"}" \
    "$FRONTEND_URL/v1/auth/login")"
  if [ "$login_code" != "200" ]; then
    echo "login smoke failed: expected 200, got $login_code" >&2
    exit 1
  fi
  echo "login smoke passed: credential accepted or MFA challenge returned"
fi
