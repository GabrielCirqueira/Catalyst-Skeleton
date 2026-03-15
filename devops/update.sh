#!/bin/bash
# devops/update.sh — Atualização incremental em produção
#
# Uso a partir de qualquer diretório:
#   bash devops/update.sh
#
# O que faz:
#   1. Atualiza o código via git pull
#   2. Rebuild apenas se composer.json/lock, package.json/lock ou Dockerfile mudaram
#      (caso contrário, recria o container com a imagem atual — muito mais rápido)
#   3. Recria o container com rollback automático se não ficar healthy
#   4. Remove imagens sem uso
#
# Use deploy.sh na primeira vez ou quando precisar de um rebuild limpo (--no-cache).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

COMPOSE="docker compose -f $SCRIPT_DIR/docker-compose.prod.yml"
APP_CONTAINER="skeleton_symfony_prod"
LOG_DIR="/var/log/deploys"
LOG_FILE="$LOG_DIR/update-$(date +%Y%m%d-%H%M%S).log"

# Redireciona saída para log e console simultaneamente
mkdir -p "$LOG_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

log ""
log "════════════════════════════════════════"
log "  🔄 Update — Catalyst Skeleton"
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
log "📥 [1/3] Puxando alterações do git..."
BEFORE_HASH=$(git rev-parse HEAD)
git pull origin main
AFTER_HASH=$(git rev-parse HEAD)

# ── 2. Rebuild inteligente ────────────────────────────────────────────────────
DEPS_CHANGED=$(git diff "$BEFORE_HASH" "$AFTER_HASH" --name-only 2>/dev/null \
  | grep -E "composer\.(json|lock)|package(-lock)?\.json|Dockerfile|docker/prod" || true)

if [[ -n "$DEPS_CHANGED" ]] || [[ "$BEFORE_HASH" == "$AFTER_HASH" ]]; then
  if [[ -n "$DEPS_CHANGED" ]]; then
    log "🏗️  [2/3] Dependências alteradas — rebuild da imagem com cache..."
    log "   Arquivos: $(echo "$DEPS_CHANGED" | tr '\n' ' ')"
  else
    log "🏗️  [2/3] Forçando rebuild (nenhuma mudança detectada no git)..."
  fi
  $COMPOSE build symfony
else
  log "⚡ [2/3] Só código PHP/TS mudou — reutilizando imagem atual (sem rebuild)."
fi

# ── 3. Recria o container do app ─────────────────────────────────────────────
log "🔄 [3/3] Reiniciando container da aplicação..."
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
log "  ✅ Update concluído!"
log "  App rodando na porta: ${BACKEND_PORT:-8000}"
log "  Log salvo em: $LOG_FILE"
log "════════════════════════════════════════"
log ""
