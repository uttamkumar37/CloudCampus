#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"

run_npm_audit() {
  package_dir="$1"
  package_name="$2"

  if [ ! -f "$ROOT_DIR/$package_dir/package-lock.json" ]; then
    echo "Skipping $package_name audit: package-lock.json not found."
    return
  fi

  echo "Running $package_name production dependency audit for high/critical advisories..."
  (
    cd "$ROOT_DIR/$package_dir"
    npm audit --omit=dev --audit-level=high
  )
}

run_npm_audit "frontend" "frontend"
run_npm_audit "mobile" "mobile"

echo "Security audit gates passed."
