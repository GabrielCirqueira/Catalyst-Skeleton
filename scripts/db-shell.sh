#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_DEV_CMD=${COMPOSE_DEV_CMD:-"docker compose --env-file ports.env -f docker/docker-compose.yaml"}

echo "🐚 Opening MySQL shell for 'skeleton' database..."
$COMPOSE_DEV_CMD exec database mysql -u skeleton -pskeleton skeleton
