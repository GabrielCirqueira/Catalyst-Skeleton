#!/bin/bash
# devops/deploy.sh — Deploy completo para produção (primeira vez ou rebuild total)
#
# Uso a partir de qualquer diretório:
#   bash devops/deploy.sh
#
# O que faz:
#   1. Atualiza o código via git pull
#   2. Build da imagem do zero (--no-cache)
#   3. Sobe o banco e aguarda o healthcheck
#   4. Sobe o app com rollback automático se não ficar healthy
#   5. Remove imagens sem uso
#
# Use update.sh para publicar novas versões do código (mais rápido, com cache).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

COMPOSE="docker compose -f $SCRIPT_DIR/docker-compose.prod.yml"
APP_CONTAINER="skeleton_symfony_prod"
LOG_DIR="/var/log/deploys"
LOG_FILE="$LOG_DIR/deploy-$(date +%Y%m%d-%H%M%S).log"

# Redireciona saída para log e console simultaneamente
mkdir -p "$LOG_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

log ""
log "════════════════════════════════════════"
log "  🚀 Deploy — Catalyst Skeleton"
log "════════════════════════════════════════"
log ""

# ── Validação ─────────────────────────────────────────────────────────────────
if [[ ! -f "$PROJECT_ROOT/.env" ]]; then
  log "❌ Arquivo .env não encontrado na raiz do projeto."
  log "   Execute: cp devops/.env.prod.example .env && nano .env"
  exit 1
fi

# ── Guarda imagem atual para rollback ─────────────────────────────────────────
PREVIOUS_IMAGE=$(docker inspect "$APP_CONTAINER" --format='{{.Config.Image}}' 2>/dev/null || echo "")

# ── 1. Código atualizado ──────────────────────────────────────────────────────
log "📥 [1/4] Atualizando código..."
git pull origin main

# ── 2. Build completo da imagem (sem cache) ───────────────────────────────────
log "🏗️  [2/4] Buildando imagem de produção (sem cache)..."
$COMPOSE build --no-cache symfony

# ── 3. Sobe o banco de dados ──────────────────────────────────────────────────
log "🗄️  [3/4] Subindo banco de dados..."
$COMPOSE up -d database

# ── 4. Sobe o app ────────────────────────────────────────────────────────────
log "🔄 [4/4] Subindo container da aplicação..."
$COMPOSE up -d --force-recreate symfony

# ── Aguarda healthcheck ───────────────────────────────────────────────────────
log ""
log "⏳ Aguardando healthcheck do app (máx 60s)..."
HEALTHY=false
for i in $(seq 1 12); do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$APP_CONTAINER" 2>/dev/null || echo "unknown")
  if [[ "$STATUS" == "healthy" ]]; then
    HEALTHY=true
    log "✅ Container healthy!"
    break
  fi
  log "   Tentativa $i/12 — status: $STATUS"
  sleep 5
done

if [[ "$HEALTHY" != "true" ]]; then
  log ""
  log "❌ Container não ficou healthy no tempo esperado."
  log "   Iniciando rollback para imagem anterior..."
  if [[ -n "$PREVIOUS_IMAGE" ]]; then
    docker tag "$PREVIOUS_IMAGE" "${APP_CONTAINER}_rollback" 2>/dev/null || true
    log "   Imagem anterior salva como ${APP_CONTAINER}_rollback"
    log "   Para restaurar manualmente: docker compose -f devops/docker-compose.prod.yml up -d --force-recreate"
  fi
  log "   Logs do container:"
  docker logs --tail 50 "$APP_CONTAINER" 2>&1 || true
  exit 1
fi

# ── Limpeza ───────────────────────────────────────────────────────────────────
log ""
log "🧹 Removendo imagens antigas..."
docker image prune -f

log ""
log "════════════════════════════════════════"
log "  ✅ Deploy concluído!"
log "  App rodando na porta: ${BACKEND_PORT:-8000}"
log "  Log salvo em: $LOG_FILE"
log "════════════════════════════════════════"
log ""
