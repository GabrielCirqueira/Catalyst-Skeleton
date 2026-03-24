#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_DEV_CMD=${COMPOSE_DEV_CMD:-"docker compose --env-file ports.env -f docker/docker-compose.yaml"}

if [[ $# -eq 0 ]]; then
  echo "Usage: make db-restore ARGS=\"path/to/backup.sql\""
  exit 1
fi

FILE=$1

if [[ ! -f "$FILE" ]]; then
  echo "❌ File '$FILE' not found!"
  exit 1
fi

echo "⚠️  Restoring database from '$FILE'... This will OVERWRITE existing data!"
echo "Dropping and recreating 'skeleton' database..."
$COMPOSE_DEV_CMD exec -T database mysql -u root -proot -e "DROP DATABASE IF EXISTS skeleton; CREATE DATABASE skeleton;"

echo "Running SQL dump..."
cat "$FILE" | $COMPOSE_DEV_CMD exec -T database mysql -u skeleton -pskeleton skeleton

echo "✅ Database restore complete!"
