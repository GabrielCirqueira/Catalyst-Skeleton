#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if ! command -v jq &>/dev/null; then
  echo "Erro: 'jq' não está instalado. Instale com: apt install jq" >&2
  exit 1
fi

SERVICES=("symfony" "database" "nginx")
WEBHOOK_URL="${SLACK_WEBHOOK_URL}"

for SERVICE in "${SERVICES[@]}"; do
    STATUS=$(docker compose -f "$PROJECT_ROOT/docker/docker-compose.prod.yaml" ps --format json "skeleton_${SERVICE}_prod" | jq -r '.[0].Health // .[0].State')
    
    if [[ "$STATUS" != "healthy" && "$STATUS" != "running" ]]; then
        echo "🚨 Alerta: $SERVICE está com status $STATUS"
        
        if [[ -n "$WEBHOOK_URL" ]]; then
            curl -s -X POST "$WEBHOOK_URL" \
                -H 'Content-type: application/json' \
                --data "{\"text\":\"🚨 Container *$SERVICE* (produção) está fora do padrão! Status: $STATUS\"}"
        fi
    fi
done
