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
#   5.  Builda os assets do React via container node:20 (sem npm no host)
#   6.  Builda a imagem Docker de produção (--no-cache)
#   7.  Sobe o banco de dados e aguarda ficar pronto
#   8.  Sobe o container Symfony (nginx + PHP-FPM): JWT, migrations, cache warmup
#   9.  Verificação final + configuração opcional do Nginx do host
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
  step "1/9 — Configuração (Restaurado)"
  ok "Domínio:         $DEPLOY_DOMAIN"
  ok "E-mail SSL:      $DEPLOY_EMAIL"
  ok "Banco (nome):    $DEPLOY_DB_NAME"
  ok "Banco (usuário): $DEPLOY_DB_USER"
  ok "Porta HTTP:      $DEPLOY_PORT"
else
  step "1/9 — Configuração do projeto"
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

  # Porta HTTP do container
  echo ""
  echo "  Porta HTTP interna do container (deve ser única por app na VPS):"
  read -rp "    Porta [8080]: " DEPLOY_PORT
  DEPLOY_PORT=${DEPLOY_PORT:-8080}
  [[ "$DEPLOY_PORT" =~ ^[0-9]+$ ]] || die "Porta inválida: $DEPLOY_PORT"

  echo ""
  echo -e "  ${CYAN}Resumo da configuração:${RESET}"
  echo -e "  Domínio:          ${BOLD}$DEPLOY_DOMAIN${RESET}"
  echo -e "  URL da aplicação: ${BOLD}https://$DEPLOY_DOMAIN${RESET}"
  echo -e "  E-mail SSL:       $DEPLOY_EMAIL"
  echo -e "  Banco (nome):     $DEPLOY_DB_NAME"
  echo -e "  Banco (usuário):  $DEPLOY_DB_USER"
  echo -e "  Porta HTTP:       $DEPLOY_PORT"
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
  save_state "DEPLOY_PORT"     "$DEPLOY_PORT"
  mark_step "1"
fi

# Garante que DEPLOY_BRANCH e DEPLOY_PORT estejam definidos mesmo em restauração
DEPLOY_BRANCH=${DEPLOY_BRANCH:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")}
DEPLOY_PORT=${DEPLOY_PORT:-8080}

# ═══════════════════════════════════════════════════════════════
# PASSO 2 — Pré-requisitos
# ═══════════════════════════════════════════════════════════════
step "2/9 — Verificando pré-requisitos"

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
step "3/9 — Atualizando código"

info "git pull origin $DEPLOY_BRANCH..."
if ! git pull origin "$DEPLOY_BRANCH"; then
  warn "git pull falhou — continuando com código local ($(git rev-parse --short HEAD))."
fi
ok "Commit: $(git rev-parse --short HEAD) — $(git log -1 --format='%s')"

# ═══════════════════════════════════════════════════════════════
# PASSO 4 — Configurar .env de produção
# ═══════════════════════════════════════════════════════════════
if is_step_done "4" && [[ -f "$ENV_FILE" ]]; then
  step "4/9 — .env (Restaurado)"
  ok ".env já configurado."
  # Carrega segredos do state para uso no resumo final
  APP_SECRET=${DEPLOY_APP_SECRET:-$(grep "^APP_SECRET=" "$ENV_FILE" 2>/dev/null | cut -d= -f2 || echo "")}
  DB_PASSWORD=${DEPLOY_DB_PASSWORD:-$(grep "^MYSQL_PASSWORD=" "$ENV_FILE" 2>/dev/null | cut -d= -f2 || echo "")}
  DB_ROOT_PASSWORD=${DEPLOY_DB_ROOT_PASSWORD:-""}
  JWT_PASSPHRASE=${DEPLOY_JWT_PASSPHRASE:-$(grep "^JWT_PASSPHRASE=" "$ENV_FILE" 2>/dev/null | cut -d= -f2 || echo "")}
else
  step "4/9 — Configurando .env de produção"

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
# PASSO 5 — Build dos assets do React (via container Docker)
# ═══════════════════════════════════════════════════════════════
if is_step_done "5" && [[ -d "$PROJECT_ROOT/public/build" ]] && [[ -n "$(ls -A "$PROJECT_ROOT/public/build" 2>/dev/null)" ]]; then
  step "5/9 — Build React (Restaurado)"
  ok "Assets já buildados em public/build/"
else
  step "5/9 — Buildando assets do React (container node:20 — sem npm no host)"

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
  mark_step "5"
fi

# ═══════════════════════════════════════════════════════════════
# PASSO 6 — Build da imagem Docker de produção
# ═══════════════════════════════════════════════════════════════
if is_step_done "6"; then
  step "6/9 — Imagem Docker (Restaurado)"
  ok "Imagem já construída."
else
  step "6/9 — Buildando imagem Docker de produção"

  info "Pre-pull de imagens base..."
  for img in "php:8.4-fpm-alpine" "mysql:8.3"; do
    info "  Baixando $img..."
    retry_cmd docker pull "$img" --quiet
  done

  info "Buildando imagem PHP de produção (pode demorar na primeira vez)..."
  retry_cmd $COMPOSE build --no-cache symfony

  ok "Imagem de produção construída"
  mark_step "6"
fi

# ═══════════════════════════════════════════════════════════════
# PASSO 7 — Banco de dados
# ═══════════════════════════════════════════════════════════════
step "7/9 — Subindo banco de dados"

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
# PASSO 8 — Container Symfony (nginx + PHP-FPM)
# ═══════════════════════════════════════════════════════════════
step "8/9 — Subindo container Symfony"

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
# PASSO 9 — Verificação final
# ═══════════════════════════════════════════════════════════════
step "9/9 — Verificação final"

# Verifica se o container HTTP está respondendo na porta $DEPLOY_PORT
HTTP_OK=false
for i in $(seq 1 12); do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://127.0.0.1:${DEPLOY_PORT}/api/v1/health" 2>/dev/null || echo "000")
  if [[ "$HTTP_CODE" =~ ^(200|204|302)$ ]]; then
    HTTP_OK=true; break
  fi
  log "  Tentativa $i/12 — HTTP $HTTP_CODE na porta $DEPLOY_PORT..."
  sleep 5
done

if [[ "$HTTP_OK" == "true" ]]; then
  ok "Container respondendo em http://127.0.0.1:${DEPLOY_PORT}/api/v1/health (HTTP $HTTP_CODE)"
else
  warn "Container não respondeu na porta $DEPLOY_PORT em 60s."
  warn "Verifique: docker logs $APP_CONTAINER"
fi

info "Status dos containers:"
$COMPOSE ps

# ─── Limpeza ──────────────────────────────────────────────────────────────────
docker image prune -f --filter "until=24h" 2>/dev/null || true

# ─── Marca como concluído ─────────────────────────────────────────────────────
{
  echo "deploy_concluido=$(date)"
  echo "domain=${DEPLOY_DOMAIN}"
  echo "commit=$(git rev-parse --short HEAD)"
  echo "log=$LOG_FILE"
} > "$PROJECT_ROOT/.deploy-done"

# ═══════════════════════════════════════════════════════════════
# OPCIONAL — Configurar Nginx do HOST
# ═══════════════════════════════════════════════════════════════
echo ""
echo -e "${BOLD}${CYAN}━━ Configuração do Nginx do HOST (opcional) ${RESET}"
echo ""
echo -e "  O container expõe HTTP em ${BOLD}127.0.0.1:${DEPLOY_PORT}${RESET}."
echo -e "  O Nginx do host precisa ser configurado como proxy reverso."
echo ""
read -rp "  Deseja configurar o Nginx do host agora? [S/n]: " CONFIGURE_NGINX
CONFIGURE_NGINX="${CONFIGURE_NGINX:-S}"

if [[ "${CONFIGURE_NGINX,,}" =~ ^s$ ]]; then

  # ── Verifica pré-requisitos ──
  NGINX_OK_HOST=true
  command -v nginx &>/dev/null || { warn "nginx não instalado no host. Instale com: apt install nginx"; NGINX_OK_HOST=false; }
  command -v certbot &>/dev/null || { warn "certbot não instalado no host. Instale com: apt install certbot python3-certbot-nginx"; NGINX_OK_HOST=false; }

  if [[ "$NGINX_OK_HOST" != "true" ]]; then
    warn "Instale os pacotes acima e rode este bloco manualmente:"
    echo ""
    echo -e "  ${CYAN}DOMAIN=${DEPLOY_DOMAIN}${RESET}"
    echo -e "  ${CYAN}PORT=${DEPLOY_PORT}${RESET}"
    echo -e "  ${CYAN}sed -e \"s|__DOMAIN__|\${DOMAIN}|g\" -e \"s|__PORT__|\${PORT}|g\" \\${RESET}"
    echo -e "  ${CYAN}    docker/nginx/prod.conf > /etc/nginx/sites-available/\$DOMAIN${RESET}"
    echo -e "  ${CYAN}ln -sf /etc/nginx/sites-available/\$DOMAIN /etc/nginx/sites-enabled/\$DOMAIN${RESET}"
    echo -e "  ${CYAN}nginx -t && systemctl reload nginx${RESET}"
    echo -e "  ${CYAN}certbot --nginx -d \$DOMAIN --email ${DEPLOY_EMAIL} --agree-tos --no-eff-email${RESET}"
  else

    NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
    NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
    NGINX_DEST="${NGINX_SITES_AVAILABLE}/${DEPLOY_DOMAIN}"

    info "Aplicando template docker/nginx/prod.conf..."
    sed \
      -e "s|__DOMAIN__|${DEPLOY_DOMAIN}|g" \
      -e "s|__PORT__|${DEPLOY_PORT}|g" \
      "$PROJECT_ROOT/docker/nginx/prod.conf" \
      > "$NGINX_DEST"
    ok "Config gerado: $NGINX_DEST"

    # Symlink em sites-enabled
    if [[ ! -L "${NGINX_SITES_ENABLED}/${DEPLOY_DOMAIN}" ]]; then
      ln -sf "$NGINX_DEST" "${NGINX_SITES_ENABLED}/${DEPLOY_DOMAIN}"
      ok "Symlink criado em sites-enabled"
    else
      ok "Symlink já existe em sites-enabled"
    fi

    # Testa config nginx
    info "Testando configuração do Nginx..."
    if nginx -t 2>&1; then
      ok "Configuração do Nginx válida"
      systemctl reload nginx && ok "Nginx recarregado"
    else
      warn "Configuração do Nginx inválida. Corrija $NGINX_DEST antes de recarregar."
    fi

    # ── Verifica DNS antes do Certbot ──
    SERVER_IP=$(curl -sf --max-time 5 "https://api.ipify.org" 2>/dev/null || echo "")
    DOMAIN_IP=$(getent hosts "$DEPLOY_DOMAIN" 2>/dev/null | awk '{print $1}' | head -1 || echo "")

    echo ""
    info "IP desta VPS:      ${SERVER_IP:-desconhecido}"
    info "IP do domínio:     ${DOMAIN_IP:-não resolvido}"
    echo ""

    DNS_OK=false
    [[ -n "$SERVER_IP" && -n "$DOMAIN_IP" && "$SERVER_IP" == "$DOMAIN_IP" ]] && DNS_OK=true

    if [[ "$DNS_OK" == "true" ]]; then
      ok "DNS propagado — $DEPLOY_DOMAIN aponta para este servidor"
    else
      warn "DNS ainda não propagado (ou $DEPLOY_DOMAIN não aponta para $SERVER_IP)."
      warn "O certbot falha se o DNS não estiver resolvendo para este IP."
      echo ""
      read -rp "  Tentar emitir o certificado mesmo assim? [s/N]: " TRY_CERT_INPUT
      [[ ! "${TRY_CERT_INPUT,,}" =~ ^s$ ]] && DNS_OK="skip"
    fi

    if [[ "$DNS_OK" != "skip" ]]; then
      info "Emitindo certificado SSL via Let's Encrypt..."
      if certbot --nginx \
          -d "$DEPLOY_DOMAIN" \
          --email "$DEPLOY_EMAIL" \
          --agree-tos \
          --no-eff-email \
          --non-interactive; then
        ok "Certificado SSL emitido para $DEPLOY_DOMAIN"
        systemctl reload nginx && ok "Nginx recarregado com HTTPS"
      else
        warn "Certbot falhou. Tente manualmente após confirmar o DNS:"
        echo "    certbot --nginx -d $DEPLOY_DOMAIN --email $DEPLOY_EMAIL --agree-tos --no-eff-email"
      fi
    else
      warn "Certificado SSL pulado. Quando o DNS estiver propagado, rode:"
      echo -e "  ${CYAN}certbot --nginx -d $DEPLOY_DOMAIN --email $DEPLOY_EMAIL --agree-tos --no-eff-email${RESET}"
    fi

    echo ""
    echo -e "  ${BOLD}Arquivo de config gerado:${RESET}"
    echo "  ────────────────────────────────────────────────────────────"
    cat "$NGINX_DEST"
    echo "  ────────────────────────────────────────────────────────────"
    echo ""
    warn "Lembrete: o arquivo docker/nginx/prod.conf no repositório é o"
    warn "template original (com placeholders). O arquivo gerado acima"
    warn "($NGINX_DEST) é a versão final para este servidor."
    warn "Não commite o arquivo gerado — ele contém caminhos absolutos."

  fi  # nginx + certbot instalados
fi  # configurar nginx

# ─── Resumo final ─────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}  ╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${GREEN}  ║          ✅  Deploy concluído com sucesso!        ║${RESET}"
echo -e "${BOLD}${GREEN}  ╚══════════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  ${BOLD}Domínio:${RESET}        $DEPLOY_DOMAIN"
echo -e "  ${BOLD}Container HTTP:${RESET} 127.0.0.1:${DEPLOY_PORT} (nginx+fpm dentro do container)"
echo -e "  ${BOLD}Banco:${RESET}          $DEPLOY_DB_NAME (usuário: $DEPLOY_DB_USER)"
echo -e "  ${BOLD}Commit:${RESET}         $(git rev-parse --short HEAD)"
echo -e "  ${BOLD}Log salvo em:${RESET}   $LOG_FILE"
echo ""
echo -e "  ${YELLOW}Credenciais (também salvas no .env — não commite!):${RESET}"
echo -e "  APP_SECRET:       ${APP_SECRET:0:16}..."
echo -e "  JWT_PASSPHRASE:   ${JWT_PASSPHRASE:0:16}..."
echo -e "  DB_PASSWORD:      ${DB_PASSWORD:-<ver .env>}"
echo ""
echo -e "  ${BOLD}${CYAN}Arquitetura em produção:${RESET}"
echo -e "  Internet → Nginx do host (80/443) → container HTTP (127.0.0.1:${DEPLOY_PORT})"
echo ""
echo -e "  ${CYAN}Próximas atualizações:${RESET}  bash devops/update.sh"
echo -e "  ${CYAN}Logs:${RESET}                   bash devops/logs-prod.sh"
echo -e "  ${CYAN}Backup do banco:${RESET}         bash devops/backup.sh"
echo -e "  ${CYAN}Monitorar:${RESET}               bash devops/monitor.sh"
echo ""
