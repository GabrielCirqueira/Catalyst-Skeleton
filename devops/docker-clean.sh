#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_DEV_CMD=${COMPOSE_DEV_CMD:-"docker compose --env-file ports.env -f docker/docker-compose.yaml"}

echo "🧹 Cleaning unused docker resources..."

# Ask for confirmation if interactive, or use force
echo "This will remove stopped containers, networks not used, and unused images."

docker system prune -f 

# Optional prune for unused volumes (more aggressive)
# docker volume prune -f

echo "✅ Docker clean complete!"
