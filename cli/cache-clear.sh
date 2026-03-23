#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_DEV_CMD=${COMPOSE_DEV_CMD:-"docker compose --env-file ports.env -f docker/docker-compose.yaml"}

echo "💨 Clearing Symfony cache..."
$COMPOSE_DEV_CMD exec -T symfony php bin/console cache:clear

echo "🧹 Clearing Symfony logs..."
$COMPOSE_DEV_CMD exec -T symfony rm -rf var/log/*

echo "♻️  Cleaning frontend build assets..."
$COMPOSE_DEV_CMD exec -T vite-react rm -rf public/build/* || true

echo "✅ All cache cleared!"
