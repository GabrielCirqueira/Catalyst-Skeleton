#!/bin/bash
# devops/deploy.sh — Primeiro deploy em produção (execute na VPS)
#
# Uso (na VPS, a partir da raiz do projeto):
#   bash devops/deploy.sh
#
# Pré-requisitos:
#   - Execute devops/pre-deploy.sh LOCALMENTE antes, commite e dê push.
#   - Na VPS: git clone <repo> && cd <projeto>
#
# O que faz (nesta ordem):
#   1. Verifica pré-requisitos (Docker, Node.js, git, openssl)
#   2. Atualiza o código (git pull)
#   3. Cria o .env a partir de devops/.env.prod.example e gera todos os segredos
#   4. Builda os assets do React (npm ci && npm run build)
#   5. Builda a imagem Docker de produção (--no-cache)
#   6. Sobe o banco de dados e aguarda ficar pronto
#   7. Sobe o container PHP-FPM (bootstrap.sh: JWT, migrations, cache warmup)
#   8. Sobe o Nginx
#   9. Configura o certificado SSL via Certbot (Let's Encrypt)
#
# Para atualizações incrementais, use: bash devops/update.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

COMPOSE="docker compose -f $PROJECT_ROOT/docker/docker-compose.prod.yaml"
APP_CONTAINER="skeleton_symfony_prod"
LOG_DIR="/var/log/deploys"
LOG_FILE="$LOG_DIR/deploy-$(date +%Y%m%d-%H%M%S).log"

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

gen_hex()  { openssl rand -hex "${1:-32}"; }
gen_pass() { openssl rand -base64 "${1:-24}" | tr -d '/+='; }

# ─── Banner ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${BLUE}  ╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${BLUE}  ║      Catalyst Skeleton — Deploy Produção         ║${RESET}"
echo -e "${BOLD}${BLUE}  ╚══════════════════════════════════════════════════╝${RESET}"
echo ""

# ═══════════════════════════════════════════════════════════════
# PASSO 1 — Pré-requisitos
# ═══════════════════════════════════════════════════════════════
log "── [1/9] Verificando pré-requisitos ──"

check_cmd() {
  if command -v "$1" &>/dev/null; then
    ok "$1 ($(command -v "$1"))"
  else
    die "Dependência ausente: $1 — instale antes de continuar."
  fi
}

check_cmd git
check_cmd docker
check_cmd openssl
check_cmd node
check_cmd npm
check_cmd curl

if ! docker compose version &>/dev/null 2>&1; then
  die "docker compose plugin não encontrado. Instale o Docker Engine com o plugin compose."
fi
ok "docker compose"

if ! docker info &>/dev/null; then
  die "Docker daemon não está rodando."
fi
ok "Docker daemon ativo"

# ═══════════════════════════════════════════════════════════════
# PASSO 2 — Código atualizado
# ═══════════════════════════════════════════════════════════════
log "── [2/9] Atualizando código ──"

info "git pull origin main..."
git pull origin main
ok "Código atualizado ($(git rev-parse --short HEAD))"

# ═══════════════════════════════════════════════════════════════
# PASSO 3 — Criar .env com segredos gerados automaticamente
# ═══════════════════════════════════════════════════════════════
log "── [3/9] Configurando .env ──"

ENV_FILE="$PROJECT_ROOT/.env"
ENV_EXAMPLE="$SCRIPT_DIR/.env.prod.example"

[[ -f "$ENV_EXAMPLE" ]] || die "devops/.env.prod.example não encontrado.\n  Execute 'bash devops/pre-deploy.sh' localmente, commite e dê push."

# Valida que o domínio foi configurado pelo pre-deploy.sh
NGINX_CONF="$PROJECT_ROOT/docker/nginx/prod.conf"
if grep -q "catalyst-skeleton\.com" "$NGINX_CONF" 2>/dev/null; then
  die "docker/nginx/prod.conf ainda contém o domínio padrão 'catalyst-skeleton.com'.\n\n  Execute LOCALMENTE antes do deploy:\n    bash devops/pre-deploy.sh\n\n  Em seguida commite as alterações e dê push para a VPS."
fi

if [[ -f "$ENV_FILE" ]]; then
  warn ".env já existe — mantendo-o sem sobrescrever."
  warn "Para recriar do zero: rm .env && bash devops/deploy.sh"
else
  info "Copiando .env.prod.example → .env e gerando segredos..."

  cp "$ENV_EXAMPLE" "$ENV_FILE"

  APP_SECRET=$(gen_hex 32)
  JWT_PASSPHRASE=$(gen_hex 32)
  DB_PASSWORD=$(gen_pass 20)
  DB_ROOT_PASSWORD=$(gen_pass 20)

  DB_NAME=$(grep "^DB_NAME=" "$ENV_EXAMPLE" | cut -d= -f2 | xargs)
  DB_USER=$(grep "^DB_USER=" "$ENV_EXAMPLE" | cut -d= -f2 | xargs)

  # Substitui placeholders na ordem em que aparecem no arquivo
  sed -i "s|__GERADO_PELO_DEPLOY__|${APP_SECRET}|1"        "$ENV_FILE"
  sed -i "s|__GERADO_PELO_DEPLOY__|${DB_ROOT_PASSWORD}|1"  "$ENV_FILE"
  sed -i "s|__GERADO_PELO_DEPLOY__|${DB_PASSWORD}|1"        "$ENV_FILE"
  sed -i "s|__GERADO_PELO_DEPLOY__|${JWT_PASSPHRASE}|1"    "$ENV_FILE"
  # Reconstrói DATABASE_URL com a senha real
  sed -i "s|mysql://${DB_USER}:__GERADO_PELO_DEPLOY__@|mysql://${DB_USER}:${DB_PASSWORD}@|" "$ENV_FILE"

  if grep -q "__GERADO_PELO_DEPLOY__" "$ENV_FILE"; then
    die "Ainda há placeholders no .env. Revise $ENV_EXAMPLE."
  fi

  ok ".env criado com segredos gerados"
  echo ""
  echo -e "  ${BOLD}${YELLOW}⚠  SALVE ESTAS CREDENCIAIS — NÃO SERÃO EXIBIDAS NOVAMENTE:${RESET}"
  echo ""
  echo -e "  APP_SECRET:        ${APP_SECRET}"
  echo -e "  JWT_PASSPHRASE:    ${JWT_PASSPHRASE}"
  echo -e "  DB_USER:           ${DB_USER}"
  echo -e "  DB_PASSWORD:       ${DB_PASSWORD}"
  echo -e "  DB_ROOT_PASSWORD:  ${DB_ROOT_PASSWORD}"
  echo ""
  read -rp "  Pressione Enter após salvar as credenciais..."
fi

# ═══════════════════════════════════════════════════════════════
# PASSO 4 — Build do React
# ═══════════════════════════════════════════════════════════════
log "── [4/9] Buildando assets do React ──"

# Exporta VITE_API_BASE_URL para o build
if grep -q "^VITE_API_BASE_URL=" "$ENV_FILE"; then
  VITE_API_BASE_URL=$(grep "^VITE_API_BASE_URL=" "$ENV_FILE" | cut -d= -f2 | xargs)
  export VITE_API_BASE_URL
  info "VITE_API_BASE_URL=$VITE_API_BASE_URL"
fi

info "npm ci..."
npm ci --prefer-offline 2>/dev/null || npm ci

info "npm run build..."
npm run build

ok "Assets gerados em public/build/"

# ═══════════════════════════════════════════════════════════════
# PASSO 5 — Build da imagem Docker
# ═══════════════════════════════════════════════════════════════
log "── [5/9] Buildando imagem Docker (--no-cache) ──"

$COMPOSE build --no-cache symfony
ok "Imagem de produção construída"

# ═══════════════════════════════════════════════════════════════
# PASSO 6 — Banco de dados
# ═══════════════════════════════════════════════════════════════
log "── [6/9] Subindo banco de dados ──"

$COMPOSE up -d database

info "Aguardando MySQL (máx 60s)..."
DB_READY=false
for i in $(seq 1 12); do
  if $COMPOSE exec -T database mysqladmin ping -h localhost --silent 2>/dev/null; then
    DB_READY=true; break
  fi
  log "  Tentativa $i/12 — aguardando banco..."
  sleep 5
done
[[ "$DB_READY" == "true" ]] || die "Banco não ficou pronto em 60s.\n  Logs: $COMPOSE logs database"

ok "Banco de dados pronto"

# ═══════════════════════════════════════════════════════════════
# PASSO 7 — Container Symfony (PHP-FPM)
# ═══════════════════════════════════════════════════════════════
log "── [7/9] Subindo container Symfony ──"

$COMPOSE up -d --force-recreate symfony

info "Aguardando healthcheck (máx 90s)..."
HEALTHY=false
for i in $(seq 1 18); do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$APP_CONTAINER" 2>/dev/null || echo "unknown")
  if [[ "$STATUS" == "healthy" ]]; then
    HEALTHY=true; break
  elif [[ "$STATUS" == "unhealthy" ]]; then
    docker logs --tail 40 "$APP_CONTAINER" 2>&1 || true
    die "Container ficou unhealthy. Veja os logs acima."
  fi
  log "  Tentativa $i/18 — status: $STATUS"
  sleep 5
done

if [[ "$HEALTHY" != "true" ]]; then
  docker logs --tail 50 "$APP_CONTAINER" 2>&1 || true
  die "Container não ficou healthy em 90s."
fi

ok "Container Symfony saudável"

# ═══════════════════════════════════════════════════════════════
# PASSO 8 — Nginx
# ═══════════════════════════════════════════════════════════════
log "── [8/9] Subindo Nginx ──"

$COMPOSE up -d nginx

info "Aguardando Nginx (máx 30s)..."
for i in $(seq 1 6); do
  if curl -sf -o /dev/null --max-time 3 http://localhost 2>/dev/null; then
    ok "Nginx respondendo"; break
  fi
  sleep 5
  if [[ $i -eq 6 ]]; then
    warn "Nginx pode não estar respondendo — verifique: $COMPOSE logs nginx"
  fi
done

# ═══════════════════════════════════════════════════════════════
# PASSO 9 — Certificado SSL (Let's Encrypt)
# ═══════════════════════════════════════════════════════════════
log "── [9/9] Certificado SSL (Let's Encrypt) ──"

CERTBOT_EMAIL_VAL=$(grep "^CERTBOT_EMAIL=" "$ENV_FILE" 2>/dev/null | cut -d= -f2 | xargs || echo "")
CERTBOT_DOMAIN_VAL=$(grep "^CERTBOT_DOMAIN=" "$ENV_FILE" 2>/dev/null | cut -d= -f2 | xargs || \
                     grep "^VITE_API_BASE_URL=" "$ENV_FILE" | cut -d= -f2 | sed 's|https://||;s|http://||' | xargs)

if [[ -z "$CERTBOT_EMAIL_VAL" ]] || [[ -z "$CERTBOT_DOMAIN_VAL" ]]; then
  warn "CERTBOT_EMAIL ou CERTBOT_DOMAIN ausentes no .env — SSL pulado."
  warn "Configure e rode manualmente: $COMPOSE run --rm certbot certonly ..."
else
  # Verifica se já existe certificado válido
  if $COMPOSE run --rm --entrypoint "" certbot certbot certificates 2>/dev/null | grep -q "$CERTBOT_DOMAIN_VAL"; then
    ok "Certificado já existe para $CERTBOT_DOMAIN_VAL"
  else
    info "Solicitando certificado para $CERTBOT_DOMAIN_VAL..."
    $COMPOSE run --rm certbot certonly \
      --webroot \
      --webroot-path=/var/www/public \
      --email "$CERTBOT_EMAIL_VAL" \
      --agree-tos \
      --no-eff-email \
      -d "$CERTBOT_DOMAIN_VAL" \
      && ok "Certificado SSL emitido para $CERTBOT_DOMAIN_VAL" \
      || warn "Falha ao emitir certificado — verifique se o DNS aponta para esta VPS."
  fi

  $COMPOSE exec nginx nginx -s reload 2>/dev/null && info "Nginx recarregado com HTTPS" || true
fi

# ─── Limpeza ──────────────────────────────────────────────────────────────────
docker image prune -f --filter "until=24h" 2>/dev/null || true

# ─── Resumo final ─────────────────────────────────────────────────────────────
VITE_URL=$(grep "^VITE_API_BASE_URL=" "$ENV_FILE" 2>/dev/null | cut -d= -f2 | xargs || echo "—")
DB_NAME_LOG=$(grep "^DB_NAME=" "$ENV_FILE" 2>/dev/null | cut -d= -f2 | xargs || echo "—")

echo ""
echo -e "${BOLD}${GREEN}  ╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${GREEN}  ║          ✅  Deploy concluído com sucesso!        ║${RESET}"
echo -e "${BOLD}${GREEN}  ╚══════════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  ${BOLD}URL:${RESET}            $VITE_URL"
echo -e "  ${BOLD}Banco:${RESET}          $DB_NAME_LOG"
echo -e "  ${BOLD}Log salvo em:${RESET}   $LOG_FILE"
echo ""
echo -e "  ${CYAN}Próximas vezes:${RESET} bash devops/update.sh"
echo -e "  ${CYAN}Logs:${RESET}           bash devops/logs-prod.sh"
echo -e "  ${CYAN}Backup:${RESET}         bash devops/backup.sh"
echo ""
