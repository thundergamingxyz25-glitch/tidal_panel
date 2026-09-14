#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
command -v php >/dev/null || { echo "PHP 8.3+ is required" >&2; exit 1; }
command -v composer >/dev/null || { echo "Composer is required" >&2; exit 1; }
command -v node >/dev/null || { echo "Node.js 20+ is required" >&2; exit 1; }
command -v docker >/dev/null || { echo "Docker Engine is required" >&2; exit 1; }

cd "$ROOT_DIR/backend"
cp -n .env.example .env || true
php artisan key:generate --force
php artisan migrate --force
composer install --no-dev --optimize-autoloader

cd "$ROOT_DIR/frontend"
npm ci
npm run build

echo "TidePanel is built. Serve backend/public with Nginx and run the queue worker under systemd."
