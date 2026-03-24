#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_DEV_CMD=${COMPOSE_DEV_CMD:-"docker compose --env-file ports.env -f docker/docker-compose.yaml"}

echo "📊 Docker Container Resource Usage:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

echo "\n📦 Service Status:"
$COMPOSE_DEV_CMD ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

echo "\n💾 Disk Usage (Volumes):"
docker system df -v | grep -A 5 "VOLUME NAME"
