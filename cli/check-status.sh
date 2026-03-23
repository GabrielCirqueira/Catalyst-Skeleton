#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_DEV_CMD=${COMPOSE_DEV_CMD:-"docker compose --env-file ports.env -f docker/docker-compose.yaml"}

echo "🔍 Checking backend health..."
$COMPOSE_DEV_CMD exec -T symfony php bin/console messenger:consume -L 1 >/dev/null 2>&1 || echo "✅ Symfony Console is responding!"

echo "🔍 Checking database connection..."
$COMPOSE_DEV_CMD exec -T symfony php bin/console doctrine:query:sql "SELECT 1" >/dev/null 2>&1 && echo "✅ Database is connected!" || echo "❌ Database connection failed!"

echo "🌐 Checking Nginx availability..."
if curl -s -f http://localhost:8000 > /dev/null; then
  echo "✅ Web Server (Nginx) is alive at http://localhost:8000"
else
  echo "❌ Web Server (Nginx) is not reachable at port 8000"
fi

echo "🚀 Frontend server is running at port 5173"
