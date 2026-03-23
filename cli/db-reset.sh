#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "🔄 Resetting database... (dropping, creating and migrating)"

# Use COMPOSE_DEV_CMD equivalent if we are in make, else use simple compose
COMPOSE_CMD=${COMPOSE_DEV_CMD:-"docker compose --env-file ports.env -f docker/docker-compose.yaml"}

# Stop and remove volumes to ensure a fresh start if requested, but better to use doctrine commands
echo "Dropping database..."
$COMPOSE_CMD exec -T symfony php bin/console doctrine:database:drop --force --if-exists || true

echo "Creating database..."
$COMPOSE_CMD exec -T symfony php bin/console doctrine:database:create || true

echo "Running migrations..."
$COMPOSE_CMD exec -T symfony php bin/console doctrine:migrations:migrate --no-interaction

echo "✅ Database reset complete!"
