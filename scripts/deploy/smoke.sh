#!/usr/bin/env sh
set -eu

BASE_URL="${1:-http://localhost:18080}"
BASE_URL="${BASE_URL%/}"

echo "Checking actuator health at $BASE_URL/actuator/health/readiness"
curl -fsS "$BASE_URL/actuator/health/readiness" >/tmp/cloudcampus-readiness.json

echo "Checking application readiness at $BASE_URL/v1/system/readiness"
curl -fsS "$BASE_URL/v1/system/readiness" >/tmp/cloudcampus-system-readiness.json

echo "Smoke check passed for $BASE_URL."
