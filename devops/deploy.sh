#!/bin/bash
# devops/deploy.sh — Primeiro deploy em produção (execute na VPS)
#
# Uso (na VPS, a partir da raiz do projeto):
#   bash devops/deploy.sh
#
# Pré-requisitos na VPS (apenas):
#   - Docker Engine com plugin compose
#   - git, openssl, curl
#   - Node.js NÃO é necessário (build do React roda dentro de container Docker)
#
# O que faz (nesta ordem):
#   1.  Configuração do projeto (domínio, banco, e-mail) — interativo, salvo no estado
#   2.  Verifica pré-requisitos (Docker, git, openssl, curl)
#   3.  Atualiza o código (git pull na branch atual)
#   4.  Configura o .env de produção com segredos gerados automaticamente
#   5.  Configura o Nginx para o domínio informado
#   6.  Builda os assets do React via container node:20 (sem npm no host)
#   7.  Builda a imagem Docker de produção (--no-cache)
#   8.  Sobe o banco de dados e aguarda ficar pronto
#   9.  Sobe o container PHP-FPM (bootstrap.sh: JWT, migrations, cache warmup)
#   10. Sobe o Nginx e aguarda resposta
#   11. Emite certificado SSL via Certbot (Let's Encrypt) com verificação de DNS
#
# Retomada automática: se o script falhar, ao rodar novamente ele continua
# de onde parou graças ao arquivo .deploy-progress.
#
# Para atualizações incrementais após o primeiro deploy: bash devops/update.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# ─── Configuração de Estado (Persistence) ─────────────────────────────────────
STATE_FILE="$PROJECT_ROOT/.deploy-progress"

if [[ -f "$STATE_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$STATE_FILE"
fi

save_state() {
  local key="$1"; local value="$2"
  if [[ -f "$STATE_FILE" ]]; then
    sed -i "/^export ${key}=/d" "$STATE_FILE" 2>/dev/null || true
  fi
  echo "export ${key}=\"${value}\"" >> "$STATE_FILE"
  export "${key}=${value}"
}

mark_step() { save_state "STEP_${1}_DONE" "1"; }

is_step_done() {
  local var="STEP_${1}_DONE"
  [[ "${!var:-0}" == "1" ]]
}

# ─── Cores e helpers ──────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

ok()   { echo -e "${GREEN}  ✓${RESET} $*"; }
info() { echo -e "${CYAN}  →${RESET} $*"; }
warn() { echo -e "${YELLOW}  ⚠${RESET} $*"; }
err()  { echo -e "${RED}  ✗ ERRO:${RESET} $*" >&2; }
step() { echo ""; echo -e "${BOLD}${BLUE}━━ $* ${RESET}"; }
log()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

gen_hex()  { openssl rand -hex "${1:-32}"; }
gen_pass() { openssl rand -base64 "${1:-24}" | tr -d '/+='; }

COMPOSE="docker compose -f $PROJECT_ROOT/docker/docker-compose.prod.yaml"
ENV_FILE="$PROJECT_ROOT/.env"

LOG_DIR="/var/log/deploys"
LOG_FILE="$LOG_DIR/deploy-$(date +%Y%m%d-%H%M%S).log"
mkdir -p "$LOG_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

# ─── Reset total ──────────────────────────────────────────────────────────────
critical_reset() {
  warn "Realizando reset total do deploy..."
  rm -f "$ENV_FILE" "$STATE_FILE" "$PROJECT_ROOT/.deploy-done"
  rm -rf "$PROJECT_ROOT/public/build" 2>/dev/null || true
  rm -rf "$PROJECT_ROOT/config/jwt"/*.pem 2>/dev/null || true
  if docker info &>/dev/null; then
    $COMPOSE down --volumes --remove-orphans 2>/dev/null || true
  fi
  info "Reset concluído. Reiniciando deploy..."
  exec bash "$0"
}

die() {
  err "$*"
  echo ""
  echo -e "  ${YELLOW}O progresso foi salvo em: $STATE_FILE${RESET}"
  echo -e "  ${YELLOW}Rode o script novamente para continuar do passo onde parou.${RESET}"
  echo ""
  read -rp "  Ou deseja fazer um reset total e tentar do zero? [s/N]: " DO_RESET
  if [[ "${DO_RESET,,}" =~ ^s$ ]]; then
    critical_reset
  fi
  echo ""
  echo "  Log completo em: $LOG_FILE"
  echo ""
  exit 1
}

retry_cmd() {
  local n=1; local max=3; local delay=8
  while true; do
    "$@" && break || {
      if [[ $n -lt $max ]]; then
        ((n++))
        warn "Comando falhou. Tentativa $n/$max em ${delay}s..."
        sleep "$delay"
      else
        die "O comando falhou após $max tentativas: $*"
      fi
    }
  done
}

wait_for_container() {
  local cid="$1"; local name="${2:-container}"; local max_tries=20
  for i in $(seq 1 $max_tries); do
    local status
    status=$(docker inspect -f '{{.State.Status}}' "$cid" 2>/dev/null || echo "not_found")
    if [[ "$status" == "running" ]]; then return 0; fi
    if [[ $i -eq 1 ]]; then info "Aguardando $name estabilizar (status: $status)..."; fi
    sleep 3
  done
  return 1
}

# ─── Banner ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${BLUE}  ╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${BLUE}  ║      Catalyst Skeleton — Deploy Produção         ║${RESET}"
echo -e "${BOLD}${BLUE}  ╚══════════════════════════════════════════════════╝${RESET}"
echo ""
log "Deploy iniciado (PID: $$, Log: $LOG_FILE)"

# ─── Verificar se já foi concluído ────────────────────────────────────────────
if [[ -f "$PROJECT_ROOT/.deploy-done" ]]; then
  echo -e "${YELLOW}  ⚠  Este servidor já possui um deploy concluído (.deploy-done encontrado).${RESET}"
  echo ""
  echo -e "  Para atualizar o projeto use: ${BOLD}bash devops/update.sh${RESET}"
  echo ""
  read -rp "  Deseja refazer o deploy do zero? [s/N]: " RERUN
  if [[ ! "${RERUN,,}" =~ ^s$ ]]; then
    echo ""
    info "Deploy cancelado."
    echo ""
    exit 0
  fi
  rm -f "$STATE_FILE" "$PROJECT_ROOT/.deploy-done"
  echo ""
fi

# ═══════════════════════════════════════════════════════════════
# PASSO 1 — Configuração do projeto (domínio, banco, e-mail)
# ═══════════════════════════════════════════════════════════════
if is_step_done "1" && [[ -n "${DEPLOY_DOMAIN:-}" ]]; then
  step "1/11 — Configuração (Restaurado)"
  ok "Domínio:         $DEPLOY_DOMAIN"
  ok "E-mail SSL:      $DEPLOY_EMAIL"
  ok "Banco (nome):    $DEPLOY_DB_NAME"
  ok "Banco (usuário): $DEPLOY_DB_USER"
else
  step "1/11 — Configuração do projeto"
  echo ""
  echo "  Informe os dados de produção abaixo."
  echo "  Os segredos (senhas, tokens) serão gerados automaticamente."
  echo ""

  # Domínio
  read -rp "  Domínio da aplicação (ex: meusite.com): " DEPLOY_DOMAIN
  DEPLOY_DOMAIN=$(echo "$DEPLOY_DOMAIN" | sed 's|https\?://||;s|/.*$||' | xargs)
  [[ -z "$DEPLOY_DOMAIN" ]] && die "Domínio não pode ser vazio."

  # E-mail para SSL
  read -rp "  E-mail para certificado SSL (Let's Encrypt): " DEPLOY_EMAIL
  [[ -z "$DEPLOY_EMAIL" ]] && die "E-mail não pode ser vazio."

  # Banco de dados
  echo ""
  echo "  Banco de dados MySQL:"
  read -rp "    Nome do banco    [app]: " DEPLOY_DB_NAME
  DEPLOY_DB_NAME=${DEPLOY_DB_NAME:-app}
  read -rp "    Usuário do banco [app]: " DEPLOY_DB_USER
  DEPLOY_DB_USER=${DEPLOY_DB_USER:-app}

  # Branch git
  DETECTED_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
  echo ""
  read -rp "  Branch para deploy [$DETECTED_BRANCH]: " DEPLOY_BRANCH
  DEPLOY_BRANCH=${DEPLOY_BRANCH:-$DETECTED_BRANCH}

  echo ""
  echo -e "  ${CYAN}Resumo da configuração:${RESET}"
  echo -e "  Domínio:          ${BOLD}$DEPLOY_DOMAIN${RESET}"
  echo -e "  URL da aplicação: ${BOLD}https://$DEPLOY_DOMAIN${RESET}"
  echo -e "  E-mail SSL:       $DEPLOY_EMAIL"
  echo -e "  Banco (nome):     $DEPLOY_DB_NAME"
  echo -e "  Banco (usuário):  $DEPLOY_DB_USER"
  echo -e "  Branch:           $DEPLOY_BRANCH"
  echo ""
  read -rp "  Confirmar? [S/n]: " CONFIRM
  if [[ "${CONFIRM,,}" =~ ^n$ ]]; then
    info "Rode o script novamente para reconfigurar."
    exit 0
  fi

  save_state "DEPLOY_DOMAIN"   "$DEPLOY_DOMAIN"
  save_state "DEPLOY_EMAIL"    "$DEPLOY_EMAIL"
  save_state "DEPLOY_DB_NAME"  "$DEPLOY_DB_NAME"
  save_state "DEPLOY_DB_USER"  "$DEPLOY_DB_USER"
  save_state "DEPLOY_BRANCH"   "$DEPLOY_BRANCH"
  mark_step "1"
fi

# Garante que DEPLOY_BRANCH esteja definido mesmo em restauração
DEPLOY_BRANCH=${DEPLOY_BRANCH:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")}

# ═══════════════════════════════════════════════════════════════
# PASSO 2 — Pré-requisitos
# ═══════════════════════════════════════════════════════════════
step "2/11 — Verificando pré-requisitos"

check_cmd() {
  if command -v "$1" &>/dev/null; then
    ok "$1 ($(command -v "$1"))"
  else
    die "Dependência ausente: $1\n  Instale com: apt-get install -y $1"
  fi
}

check_cmd git
check_cmd docker
check_cmd openssl
check_cmd curl

if ! docker compose version &>/dev/null 2>&1; then
  die "docker compose plugin não encontrado.\n  Instale: https://docs.docker.com/engine/install/"
fi
ok "docker compose ($(docker compose version --short))"

if ! docker info &>/dev/null; then
  die "Docker daemon não está rodando.\n  Inicie com: systemctl start docker"
fi
ok "Docker daemon ativo"

# ═══════════════════════════════════════════════════════════════
# PASSO 3 — Atualizar código
# ═══════════════════════════════════════════════════════════════
step "3/11 — Atualizando código"

info "git pull origin $DEPLOY_BRANCH..."
if ! git pull origin "$DEPLOY_BRANCH"; then
  warn "git pull falhou — continuando com código local ($(git rev-parse --short HEAD))."
fi
ok "Commit: $(git rev-parse --short HEAD) — $(git log -1 --format='%s')"

# ═══════════════════════════════════════════════════════════════
# PASSO 4 — Configurar .env de produção
# ═══════════════════════════════════════════════════════════════
if is_step_done "4" && [[ -f "$ENV_FILE" ]]; then
  step "4/11 — .env (Restaurado)"
  ok ".env já configurado."
  # Carrega segredos do state para uso no resumo final
  APP_SECRET=${DEPLOY_APP_SECRET:-$(grep "^APP_SECRET=" "$ENV_FILE" 2>/dev/null | cut -d= -f2 || echo "")}
  DB_PASSWORD=${DEPLOY_DB_PASSWORD:-$(grep "^MYSQL_PASSWORD=" "$ENV_FILE" 2>/dev/null | cut -d= -f2 || echo "")}
  DB_ROOT_PASSWORD=${DEPLOY_DB_ROOT_PASSWORD:-""}
  JWT_PASSPHRASE=${DEPLOY_JWT_PASSPHRASE:-$(grep "^JWT_PASSPHRASE=" "$ENV_FILE" 2>/dev/null | cut -d= -f2 || echo "")}
else
  step "4/11 — Configurando .env de produção"

  # Gera segredos
  APP_SECRET=$(gen_hex 32)
  JWT_PASSPHRASE=$(gen_hex 32)
  DB_PASSWORD=$(gen_pass 22)
  DB_ROOT_PASSWORD=$(gen_pass 22)

  info "Segredos gerados automaticamente."

  # Monta o .env de produção completo
  cat > "$ENV_FILE" <<ENV
# Gerado automaticamente por devops/deploy.sh em $(date)
# NÃO commite este arquivo — ele está no .gitignore

# ── Symfony ───────────────────────────────────────────────────────────────────
APP_ENV=prod
APP_DEBUG=false
APP_SECRET=${APP_SECRET}

# ── Banco de dados ────────────────────────────────────────────────────────────
MYSQL_ROOT_PASSWORD=${DB_ROOT_PASSWORD}
MYSQL_DATABASE=${DEPLOY_DB_NAME}
MYSQL_USER=${DEPLOY_DB_USER}
MYSQL_PASSWORD=${DB_PASSWORD}
DATABASE_URL="mysql://${DEPLOY_DB_USER}:${DB_PASSWORD}@database:3306/${DEPLOY_DB_NAME}?serverVersion=8.0.32&charset=utf8mb4"

# ── JWT ───────────────────────────────────────────────────────────────────────
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=${JWT_PASSPHRASE}
JWT_TTL=3600

# ── Frontend ──────────────────────────────────────────────────────────────────
VITE_API_URL=https://${DEPLOY_DOMAIN}
VITE_API_BASE_URL=https://${DEPLOY_DOMAIN}

# ── Mensageria ────────────────────────────────────────────────────────────────
MESSENGER_TRANSPORT_DSN=doctrine://default?auto_setup=0

# ── Mailer ────────────────────────────────────────────────────────────────────
MAILER_DSN=null://null

# ── Certbot ───────────────────────────────────────────────────────────────────
CERTBOT_DOMAIN=${DEPLOY_DOMAIN}
CERTBOT_EMAIL=${DEPLOY_EMAIL}
ENV

  ok ".env criado"

  # Salva segredos no state para restauração
  save_state "DEPLOY_APP_SECRET"       "$APP_SECRET"
  save_state "DEPLOY_JWT_PASSPHRASE"   "$JWT_PASSPHRASE"
  save_state "DEPLOY_DB_PASSWORD"      "$DB_PASSWORD"
  save_state "DEPLOY_DB_ROOT_PASSWORD" "$DB_ROOT_PASSWORD"

  echo ""
  echo -e "  ${BOLD}${YELLOW}⚠  SALVE ESTAS CREDENCIAIS — NÃO SERÃO EXIBIDAS NOVAMENTE:${RESET}"
  echo ""
  echo -e "  APP_SECRET:        ${APP_SECRET}"
  echo -e "  JWT_PASSPHRASE:    ${JWT_PASSPHRASE}"
  echo -e "  DB_USER:           ${DEPLOY_DB_USER}"
  echo -e "  DB_PASSWORD:       ${DB_PASSWORD}"
  echo -e "  DB_ROOT_PASSWORD:  ${DB_ROOT_PASSWORD}"
  echo ""
  read -rp "  Pressione Enter após salvar as credenciais..."

  mark_step "4"
fi

# ═══════════════════════════════════════════════════════════════
# PASSO 5 — Configurar Nginx para o domínio
# ═══════════════════════════════════════════════════════════════
step "5/11 — Configurando Nginx"

NGINX_CONF="$PROJECT_ROOT/docker/nginx/prod.conf"
[[ -f "$NGINX_CONF" ]] || die "docker/nginx/prod.conf não encontrado."

NGINX_CURRENT_DOMAIN=$(grep -E "^\s*server_name\s" "$NGINX_CONF" 2>/dev/null | head -1 | awk '{print $2}' | tr -d ';' || echo "")

if [[ "$NGINX_CURRENT_DOMAIN" != "$DEPLOY_DOMAIN" ]]; then
  info "Atualizando server_name: '$NGINX_CURRENT_DOMAIN' → '$DEPLOY_DOMAIN'..."
  sed -i "s|server_name .*;|server_name ${DEPLOY_DOMAIN};|g" "$NGINX_CONF"
  ok "Nginx configurado para: $DEPLOY_DOMAIN"
else
  ok "Nginx já configurado para: $DEPLOY_DOMAIN"
fi

# ═══════════════════════════════════════════════════════════════
# PASSO 6 — Build dos assets do React (via container Docker)
# ═══════════════════════════════════════════════════════════════
if is_step_done "6" && [[ -d "$PROJECT_ROOT/public/build" ]] && [[ -n "$(ls -A "$PROJECT_ROOT/public/build" 2>/dev/null)" ]]; then
  step "6/11 — Build React (Restaurado)"
  ok "Assets já buildados em public/build/"
else
  step "6/11 — Buildando assets do React (container node:20 — sem npm no host)"

  VITE_API_URL_VAL=$(grep "^VITE_API_URL=" "$ENV_FILE" | cut -d= -f2 | xargs 2>/dev/null || echo "https://$DEPLOY_DOMAIN")
  info "VITE_API_URL=$VITE_API_URL_VAL"

  info "Baixando imagem node:20..."
  retry_cmd docker pull node:20 --quiet

  info "Executando npm ci && npm run build dentro do container..."
  docker run --rm \
    -v "$PROJECT_ROOT":/app \
    -w /app \
    -e VITE_API_URL="$VITE_API_URL_VAL" \
    -e VITE_API_BASE_URL="$VITE_API_URL_VAL" \
    -e CI=true \
    -e HUSKY=0 \
    node:20 \
    sh -c "HUSKY=0 npm ci && NODE_ENV=production npm run build" \
    || die "Build do React falhou. Verifique os logs acima."

  [[ -d "$PROJECT_ROOT/public/build" ]] \
    || die "public/build não foi gerado após o build. Verifique o vite.config.js."

  ok "Assets gerados em public/build/"
  mark_step "6"
fi

# ═══════════════════════════════════════════════════════════════
# PASSO 7 — Build da imagem Docker de produção
# ═══════════════════════════════════════════════════════════════
if is_step_done "7"; then
  step "7/11 — Imagem Docker (Restaurado)"
  ok "Imagem já construída."
else
  step "7/11 — Buildando imagem Docker de produção"

  info "Pre-pull de imagens base..."
  for img in "php:8.4-fpm-alpine" "nginx:alpine" "mysql:8.3" "certbot/certbot"; do
    info "  Baixando $img..."
    retry_cmd docker pull "$img" --quiet
  done

  info "Buildando imagem PHP de produção (pode demorar na primeira vez)..."
  retry_cmd $COMPOSE build --no-cache symfony

  ok "Imagem de produção construída"
  mark_step "7"
fi

# ═══════════════════════════════════════════════════════════════
# PASSO 8 — Banco de dados
# ═══════════════════════════════════════════════════════════════
step "8/11 — Subindo banco de dados"

$COMPOSE up -d database

# Detecta container do banco
DB_CONTAINER=$($COMPOSE ps --format '{{.Name}}' database 2>/dev/null | head -1 || echo "")
if [[ -z "$DB_CONTAINER" ]]; then
  DB_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E "database.*prod|prod.*database" | head -1 || echo "")
fi
[[ -z "$DB_CONTAINER" ]] && die "Container do banco não encontrado. Verifique: $COMPOSE logs database"

info "Aguardando MySQL (container: $DB_CONTAINER, máx 90s)..."
DB_READY=false
for i in $(seq 1 18); do
  if docker exec "$DB_CONTAINER" mysqladmin ping -h localhost --silent 2>/dev/null; then
    DB_READY=true; break
  fi
  log "  Tentativa $i/18 — aguardando MySQL..."
  sleep 5
done

if [[ "$DB_READY" != "true" ]]; then
  docker logs --tail 30 "$DB_CONTAINER" 2>&1 || true
  die "MySQL não ficou pronto em 90s."
fi
ok "MySQL pronto"

# ═══════════════════════════════════════════════════════════════
# PASSO 9 — Container Symfony (PHP-FPM)
# ═══════════════════════════════════════════════════════════════
step "9/11 — Subindo container Symfony"

$COMPOSE up -d --force-recreate symfony

# Detecta container Symfony
APP_CONTAINER=$($COMPOSE ps --format '{{.Name}}' symfony 2>/dev/null | head -1 || echo "")
if [[ -z "$APP_CONTAINER" ]]; then
  APP_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E "symfony.*prod|prod.*symfony" | head -1 || echo "")
fi
[[ -z "$APP_CONTAINER" ]] && die "Container Symfony não encontrado. Verifique: $COMPOSE logs symfony"

info "Container detectado: $APP_CONTAINER"
if ! wait_for_container "$APP_CONTAINER" "Symfony"; then
  docker logs --tail 40 "$APP_CONTAINER" 2>&1 || true
  die "Container Symfony não estabilizou (não saiu do estado de restart)."
fi

info "Aguardando healthcheck do Symfony (máx 120s — inclui migrations e cache warmup)..."
HEALTHY=false
for i in $(seq 1 24); do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$APP_CONTAINER" 2>/dev/null || echo "unknown")
  case "$STATUS" in
    healthy)
      HEALTHY=true; break ;;
    unhealthy)
      docker logs --tail 60 "$APP_CONTAINER" 2>&1 || true
      die "Container ficou unhealthy. Veja os logs acima." ;;
    *)
      log "  Tentativa $i/24 — healthcheck: $STATUS" ;;
  esac
  sleep 5
done

if [[ "$HEALTHY" != "true" ]]; then
  STATUS_FINAL=$(docker inspect --format='{{.State.Health.Status}}' "$APP_CONTAINER" 2>/dev/null || echo "unknown")
  if [[ "$STATUS_FINAL" == "starting" ]]; then
    warn "Healthcheck ainda em 'starting' após 120s — a aplicação pode estar lenta para iniciar."
    warn "Verifique: docker logs $APP_CONTAINER"
  else
    docker logs --tail 60 "$APP_CONTAINER" 2>&1 || true
    die "Container Symfony não ficou healthy em 120s."
  fi
fi

ok "Container Symfony saudável"

# ═══════════════════════════════════════════════════════════════
# PASSO 10 — Nginx
# ═══════════════════════════════════════════════════════════════
step "10/11 — Subindo Nginx"

$COMPOSE up -d nginx

info "Aguardando Nginx (máx 30s)..."
NGINX_OK=false
for i in $(seq 1 6); do
  if curl -sf -o /dev/null --max-time 5 "http://localhost" 2>/dev/null; then
    NGINX_OK=true; ok "Nginx respondendo em http://localhost"; break
  fi
  sleep 5
done
[[ "$NGINX_OK" == "true" ]] || warn "Nginx pode não estar respondendo. Verifique: $COMPOSE logs nginx"

# ═══════════════════════════════════════════════════════════════
# PASSO 11 — Certificado SSL (Let's Encrypt)
# ═══════════════════════════════════════════════════════════════
step "11/11 — Certificado SSL (Let's Encrypt)"

# Verifica se o DNS aponta para esta VPS
SERVER_IP=$(curl -sf --max-time 5 "https://api.ipify.org" 2>/dev/null || echo "")
DOMAIN_IP=$(getent hosts "$DEPLOY_DOMAIN" 2>/dev/null | awk '{print $1}' | head -1 || echo "")
TRY_SSL=true

if [[ -n "$SERVER_IP" ]] && [[ -n "$DOMAIN_IP" ]] && [[ "$SERVER_IP" != "$DOMAIN_IP" ]]; then
  warn "DNS de $DEPLOY_DOMAIN aponta para $DOMAIN_IP, mas este servidor é $SERVER_IP."
  warn "O certificado SSL irá falhar se o DNS não estiver propagado."
  echo ""
  read -rp "  Tentar emitir o certificado mesmo assim? [y/N]: " TRY_SSL_INPUT
  if [[ ! "${TRY_SSL_INPUT,,}" =~ ^y$ ]]; then
    TRY_SSL=false
    warn "SSL pulado."
    echo ""
    echo -e "  Quando o DNS estiver propagado, rode manualmente:"
    echo -e "  ${CYAN}$COMPOSE run --rm certbot certonly --webroot --webroot-path=/var/www/public \\${RESET}"
    echo -e "  ${CYAN}  --email $DEPLOY_EMAIL --agree-tos --no-eff-email -d $DEPLOY_DOMAIN${RESET}"
    echo ""
    echo -e "  Depois recarregue o Nginx:"
    echo -e "  ${CYAN}$COMPOSE exec nginx nginx -s reload${RESET}"
  fi
fi

if [[ "$TRY_SSL" == "true" ]]; then
  # Verifica se já existe certificado válido
  if $COMPOSE run --rm --entrypoint "" certbot certbot certificates 2>/dev/null | grep -q "$DEPLOY_DOMAIN"; then
    ok "Certificado já existe para $DEPLOY_DOMAIN"
  else
    info "Solicitando certificado para $DEPLOY_DOMAIN..."
    if $COMPOSE run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/public \
        --email "$DEPLOY_EMAIL" \
        --agree-tos \
        --no-eff-email \
        -d "$DEPLOY_DOMAIN"; then
      ok "Certificado SSL emitido para $DEPLOY_DOMAIN"
      $COMPOSE exec nginx nginx -s reload 2>/dev/null && info "Nginx recarregado com HTTPS" || true
    else
      warn "Falha ao emitir certificado. Isso não impede o funcionamento via HTTP."
      warn "Tente manualmente após verificar o DNS:"
      echo "    $COMPOSE run --rm certbot certonly --webroot --webroot-path=/var/www/public --email $DEPLOY_EMAIL --agree-tos --no-eff-email -d $DEPLOY_DOMAIN"
    fi
  fi
fi

# ─── Verificação final ────────────────────────────────────────────────────────
log "── Verificação final ──"

PROTO="https"
$COMPOSE ps certbot &>/dev/null && \
  $COMPOSE run --rm --entrypoint "" certbot certbot certificates 2>/dev/null | grep -q "$DEPLOY_DOMAIN" \
  || PROTO="http"

APP_URL="${PROTO}://${DEPLOY_DOMAIN}"
APP_OK=false
info "Testando $APP_URL/api/v1/health..."
for i in $(seq 1 8); do
  HTTP_CODE=$(curl -sk -o /dev/null -w "%{http_code}" --max-time 8 "$APP_URL/api/v1/health" 2>/dev/null || echo "000")
  if [[ "$HTTP_CODE" =~ ^(200|204|302)$ ]]; then
    APP_OK=true; break
  fi
  log "  Tentativa $i/8 — HTTP $HTTP_CODE"
  sleep 5
done

[[ "$APP_OK" == "true" ]] \
  && ok "Aplicação respondendo em $APP_URL (HTTP $HTTP_CODE)" \
  || warn "Aplicação ainda não respondendo — pode precisar de mais tempo. Verifique: docker logs $APP_CONTAINER"

# ─── Limpeza ──────────────────────────────────────────────────────────────────
docker image prune -f --filter "until=24h" 2>/dev/null || true

# ─── Marca como concluído ─────────────────────────────────────────────────────
{
  echo "deploy_concluido=$(date)"
  echo "domain=${DEPLOY_DOMAIN}"
  echo "commit=$(git rev-parse --short HEAD)"
  echo "log=$LOG_FILE"
} > "$PROJECT_ROOT/.deploy-done"

# ─── Resumo final ─────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}  ╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${GREEN}  ║          ✅  Deploy concluído com sucesso!        ║${RESET}"
echo -e "${BOLD}${GREEN}  ╚══════════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  ${BOLD}URL:${RESET}            https://$DEPLOY_DOMAIN"
echo -e "  ${BOLD}Banco:${RESET}          $DEPLOY_DB_NAME (usuário: $DEPLOY_DB_USER)"
echo -e "  ${BOLD}Commit:${RESET}         $(git rev-parse --short HEAD)"
echo -e "  ${BOLD}Log salvo em:${RESET}   $LOG_FILE"
echo ""
echo -e "  ${YELLOW}Credenciais (também salvas no .env — não commite!):${RESET}"
echo -e "  APP_SECRET:       ${APP_SECRET:0:16}..."
echo -e "  JWT_PASSPHRASE:   ${JWT_PASSPHRASE:0:16}..."
echo -e "  DB_PASSWORD:      ${DB_PASSWORD:-<ver .env>}"
echo ""
echo -e "  ${CYAN}Próximas atualizações:${RESET}  bash devops/update.sh"
echo -e "  ${CYAN}Logs:${RESET}                   bash devops/logs-prod.sh"
echo -e "  ${CYAN}Backup do banco:${RESET}         bash devops/backup.sh"
echo -e "  ${CYAN}Monitorar:${RESET}               bash devops/monitor.sh"
echo ""
