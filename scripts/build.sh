#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

printf '%s\n' 'Building backend...'
cd "$ROOT_DIR/backend"
mvn clean package

printf '%s\n' 'Building frontend...'
cd "$ROOT_DIR/frontend"
npm install
npm run build

printf '%s\n' 'Build completed successfully.'
