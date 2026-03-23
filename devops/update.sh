#!/bin/bash
# devops/update.sh — Atualização incremental em produção (execute na VPS)
#
# Uso (na VPS, a partir da raiz do projeto):
#   bash devops/update.sh
#
# Execute este script toda vez que levar novas versões de código para produção.
# Para o primeiro deploy, use: bash devops/deploy.sh
#
# O que faz:
#   1. Puxa o código atualizado (git pull)
#   2. Rebuilda o React apenas se arquivos do frontend mudaram
#   3. Rebuilda a imagem Docker apenas se dependências ou Dockerfile mudaram
#      (caso contrário, recria o container com a imagem atual — muito mais rápido)
#   4. Recria o container Symfony com rollback automático em caso de falha
#   5. Remove imagens não utilizadas

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

COMPOSE="docker compose -f $PROJECT_ROOT/docker/docker-compose.prod.yaml"
APP_CONTAINER="skeleton_symfony_prod"
LOG_DIR="/var/log/deploys"
LOG_FILE="$LOG_DIR/update-$(date +%Y%m%d-%H%M%S).log"

mkdir -p "$LOG_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

# ─── Cores e helpers ──────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

ok()   { echo -e "${GREEN}  ✓${RESET} $*"; }
info() { echo -e "${CYAN}  →${RESET} $*"; }
warn() { echo -e "${YELLOW}  ⚠${RESET} $*"; }
log()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

die() {
  echo -e "${RED}  ✗ FATAL:${RESET} $*" >&2
  log "FATAL: $*"
  echo ""
  echo "  Log completo em: $LOG_FILE"
  echo ""
  exit 1
}

# ─── Banner ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${BLUE}  ╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${BLUE}  ║      Catalyst Skeleton — Update Produção         ║${RESET}"
echo -e "${BOLD}${BLUE}  ╚══════════════════════════════════════════════════╝${RESET}"
echo ""

# ─── Validação ────────────────────────────────────────────────────────────────
[[ -f "$PROJECT_ROOT/.env" ]] || die ".env não encontrado.\n  Execute primeiro: bash devops/deploy.sh"

if ! docker info &>/dev/null; then
  die "Docker daemon não está rodando."
fi

# ── Guarda imagem atual para rollback ─────────────────────────────────────────
PREVIOUS_IMAGE=$(docker inspect "$APP_CONTAINER" --format='{{.Config.Image}}' 2>/dev/null || echo "")

# ═══════════════════════════════════════════════════════════════
# PASSO 1 — Atualizar código
# ═══════════════════════════════════════════════════════════════
log "── [1/4] Atualizando código ──"

BEFORE_HASH=$(git rev-parse HEAD)
info "git pull origin main..."
git pull origin main
AFTER_HASH=$(git rev-parse HEAD)

if [[ "$BEFORE_HASH" == "$AFTER_HASH" ]]; then
  warn "Nenhuma mudança no git. Prosseguindo com force-recreate do container."
fi

ok "$(git log --oneline -1)"

# ═══════════════════════════════════════════════════════════════
# PASSO 2 — Rebuild do React (se frontend mudou)
# ═══════════════════════════════════════════════════════════════
log "── [2/4] Frontend ──"

FRONTEND_CHANGED=$(git diff "$BEFORE_HASH" "$AFTER_HASH" --name-only 2>/dev/null \
  | grep -E "^web/|^assets/|package(-lock)?\.json|tsconfig|vite\.config|tailwind|postcss|biome" || true)

if [[ -n "$FRONTEND_CHANGED" ]] || [[ "$BEFORE_HASH" == "$AFTER_HASH" ]]; then
  if [[ -n "$FRONTEND_CHANGED" ]]; then
    info "Arquivos de frontend alterados — rebuild React..."
    log "  Arquivos: $(echo "$FRONTEND_CHANGED" | tr '\n' ' ')"
  else
    info "Forçando rebuild do React (sem mudanças detectadas no git)..."
  fi

  # Lê variável de ambiente para o build
  VITE_API_BASE_URL_VAL=""
  if grep -q "^VITE_API_BASE_URL=" "$PROJECT_ROOT/.env"; then
    VITE_API_BASE_URL_VAL=$(grep "^VITE_API_BASE_URL=" "$PROJECT_ROOT/.env" | cut -d= -f2 | xargs)
  fi

  info "Buildando assets via container node:20 (sem npm no host)..."
  docker run --rm \
    -v "$PROJECT_ROOT":/app \
    -w /app \
    -e VITE_API_BASE_URL="$VITE_API_BASE_URL_VAL" \
    -e CI=true \
    -e HUSKY=0 \
    node:20 \
    sh -c "HUSKY=0 npm ci --prefer-offline 2>/dev/null || HUSKY=0 npm ci && NODE_ENV=production npm run build"
  ok "Assets do React atualizados em public/build/"
else
  ok "Nenhum arquivo de frontend alterado — build React pulado."
fi

# ═══════════════════════════════════════════════════════════════
# PASSO 3 — Rebuild Docker (apenas se necessário)
# ═══════════════════════════════════════════════════════════════
log "── [3/4] Imagem Docker ──"

DEPS_CHANGED=$(git diff "$BEFORE_HASH" "$AFTER_HASH" --name-only 2>/dev/null \
  | grep -E "composer\.(json|lock)|Dockerfile|docker/php|docker/docker-compose" || true)

if [[ -n "$DEPS_CHANGED" ]] || [[ "$BEFORE_HASH" == "$AFTER_HASH" ]]; then
  if [[ -n "$DEPS_CHANGED" ]]; then
    info "Dependências PHP ou Dockerfile alterados — rebuild da imagem com cache..."
    log "  Arquivos: $(echo "$DEPS_CHANGED" | tr '\n' ' ')"
  else
    info "Forçando rebuild da imagem (sem mudanças detectadas no git)..."
  fi
  $COMPOSE build symfony
  ok "Imagem Docker atualizada"
else
  ok "Dependências PHP inalteradas — reutilizando imagem atual (sem rebuild)."
fi

# ═══════════════════════════════════════════════════════════════
# PASSO 4 — Recriar container Symfony
# ═══════════════════════════════════════════════════════════════
log "── [4/4] Reiniciando container Symfony ──"

$COMPOSE up -d --force-recreate symfony

info "Aguardando healthcheck (máx 90s)..."
HEALTHY=false
for i in $(seq 1 18); do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$APP_CONTAINER" 2>/dev/null || echo "unknown")
  if [[ "$STATUS" == "healthy" ]]; then
    HEALTHY=true; break
  elif [[ "$STATUS" == "unhealthy" ]]; then
    docker logs --tail 40 "$APP_CONTAINER" 2>&1 || true
    # Rollback
    if [[ -n "$PREVIOUS_IMAGE" ]]; then
      warn "Tentando rollback para imagem anterior..."
      docker tag "$PREVIOUS_IMAGE" "${APP_CONTAINER}_rollback" 2>/dev/null || true
      warn "Imagem anterior marcada como ${APP_CONTAINER}_rollback"
      warn "Para restaurar: $COMPOSE up -d --force-recreate symfony"
    fi
    die "Container ficou unhealthy. Rollback necessário — veja os logs acima."
  fi
  log "  Tentativa $i/18 — status: $STATUS"
  sleep 5
done

if [[ "$HEALTHY" != "true" ]]; then
  docker logs --tail 50 "$APP_CONTAINER" 2>&1 || true
  if [[ -n "$PREVIOUS_IMAGE" ]]; then
    warn "Tentando rollback para imagem anterior..."
    docker tag "$PREVIOUS_IMAGE" "${APP_CONTAINER}_rollback" 2>/dev/null || true
  fi
  die "Container não ficou healthy em 90s."
fi

ok "Container Symfony saudável"

# ─── Limpeza ──────────────────────────────────────────────────────────────────
docker image prune -f --filter "until=24h" 2>/dev/null || true

# ─── Resumo ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}  ╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${GREEN}  ║          ✅  Update concluído com sucesso!        ║${RESET}"
echo -e "${BOLD}${GREEN}  ╚══════════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  ${BOLD}Commit:${RESET}         $(git log --oneline -1)"
echo -e "  ${BOLD}Log salvo em:${RESET}   $LOG_FILE"
echo ""
echo -e "  ${CYAN}Logs:${RESET}           bash devops/logs-prod.sh"
echo ""
