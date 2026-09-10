#!/bin/bash
# install.sh — Instala o projeto em uma nova máquina
#
# Use este script quando o projeto já existe (foi criado via setup.sh em outro momento)
# e você precisa apenas configurar o ambiente local numa nova máquina.
#
# O que este script faz:
#   1. Verifica pré-requisitos (Docker, docker compose, git)
#   2. Configura as portas locais (devops/ports.env)
#   3. Cria o .env local se não existir (com segredos gerados para esta máquina)
#   4. Builda e sobe os containers
#   5. Instala dependências PHP (Composer)
#   6. Aguarda o banco de dados ficar pronto
#   7. Executa as migrations
#   8. Gera as chaves JWT
#   9. Verificação final

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# ─── Cores e helpers ──────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

ok()   { echo -e "${GREEN}  ✓${RESET} $*"; }
info() { echo -e "${CYAN}  →${RESET} $*"; }
warn() { echo -e "${YELLOW}  ⚠${RESET} $*"; }
err()  { echo -e "${RED}  ✗ ERRO:${RESET} $*" >&2; }
step() { echo ""; echo -e "${BOLD}${BLUE}━━ $* ${RESET}"; }
die()  { err "$*"; echo ""; exit 1; }

retry_cmd() {
  local n=1 max=3 delay=5
  while true; do
    "$@" && break || {
      if [[ $n -lt $max ]]; then
        ((n++))
        warn "Comando falhou. Tentativa $n/$max em ${delay}s..."
        sleep $delay
      else
        die "O comando falhou após $max tentativas: $*"
      fi
    }
  done
}

wait_for_container() {
  local cid="$1" name="${2:-container}"
  for i in $(seq 1 15); do
    local status
    status=$(docker inspect -f '{{.State.Status}}' "$cid" 2>/dev/null || echo "not_found")
    [[ "$status" == "running" ]] && return 0
    [[ $i -eq 1 ]] && info "Aguardando $name estabilizar..."
    sleep 2
  done
  return 1
}

# ─── Banner ───────────────────────────────────────────────────────────────────
clear
echo ""
echo -e "${BOLD}${BLUE}  ╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${BLUE}  ║           Instalação em nova máquina             ║${RESET}"
echo -e "${BOLD}${BLUE}  ╚══════════════════════════════════════════════════╝${RESET}"
echo ""
echo "  Configura o ambiente local para um projeto já existente."
echo ""

# ═══════════════════════════════════════════════════════════════
# PASSO 1 — Pré-requisitos
# ═══════════════════════════════════════════════════════════════
step "1/7 — Verificando pré-requisitos"

check_cmd() {
  if command -v "$1" &>/dev/null; then
    ok "$1 encontrado"
  else
    die "Dependência ausente: ${BOLD}$1${RESET}. Instale antes de continuar."
  fi
}

check_cmd docker
check_cmd openssl
check_cmd git

if docker compose version &>/dev/null 2>&1; then
  ok "docker compose (plugin v2)"
  COMPOSE_BIN="docker compose"
elif docker-compose version &>/dev/null 2>&1; then
  ok "docker-compose (standalone)"
  COMPOSE_BIN="docker-compose"
else
  die "docker compose não encontrado. Instale o Docker Desktop ou o plugin compose."
fi

if ! docker info &>/dev/null; then
  die "Docker daemon não está rodando. Inicie o Docker e tente novamente."
fi
ok "Docker daemon ativo"

# ═══════════════════════════════════════════════════════════════
# PASSO 2 — Portas locais
# ═══════════════════════════════════════════════════════════════
step "2/7 — Configuração de portas"

GET_PORT() {
  grep "^$1=" devops/ports.env 2>/dev/null | cut -d= -f2 | tr -d '[:space:]' || true
}

_BACKEND_DEF=$(GET_PORT "BACKEND_PORT");    _BACKEND_DEF=${_BACKEND_DEF:-1010}
_FRONTEND_DEF=$(GET_PORT "FRONTEND_PORT");  _FRONTEND_DEF=${_FRONTEND_DEF:-1012}
_DB_DEF=$(GET_PORT "DATABASE_HOST_PORT");   _DB_DEF=${_DB_DEF:-1013}
_SUPERVISOR_DEF=$(GET_PORT "SUPERVISOR_PORT"); _SUPERVISOR_DEF=${_SUPERVISOR_DEF:-1011}

echo "  Quais portas expor no ambiente local desta máquina?"
echo ""
read -rp "  Porta do Backend  (Symfony)   [$_BACKEND_DEF]: "  BACKEND_PORT;   BACKEND_PORT=${BACKEND_PORT:-$_BACKEND_DEF}
read -rp "  Porta do Frontend (Vite)      [$_FRONTEND_DEF]: " FRONTEND_PORT; FRONTEND_PORT=${FRONTEND_PORT:-$_FRONTEND_DEF}
read -rp "  Porta do Banco de Dados       [$_DB_DEF]: "        DB_PORT;       DB_PORT=${DB_PORT:-$_DB_DEF}
read -rp "  Porta do Supervisor           [$_SUPERVISOR_DEF]: " SUPERVISOR_PORT; SUPERVISOR_PORT=${SUPERVISOR_PORT:-$_SUPERVISOR_DEF}

# Valida portas únicas
declare -A _seen=()
for _p in "$BACKEND_PORT" "$FRONTEND_PORT" "$DB_PORT" "$SUPERVISOR_PORT"; do
  [[ -n "${_seen[$_p]+x}" ]] && die "Porta $_p atribuída a mais de um serviço. Execute novamente com portas distintas."
  _seen[$_p]=1
done
unset _seen _p

if [[ -f "devops/ports.env" ]]; then
  sed -i "s/^BACKEND_PORT=.*/BACKEND_PORT=$BACKEND_PORT/"                devops/ports.env
  sed -i "s/^FRONTEND_PORT=.*/FRONTEND_PORT=$FRONTEND_PORT/"             devops/ports.env
  sed -i "s/^DATABASE_HOST_PORT=.*/DATABASE_HOST_PORT=$DB_PORT/"         devops/ports.env
  sed -i "s/^SUPERVISOR_PORT=.*/SUPERVISOR_PORT=$SUPERVISOR_PORT/"       devops/ports.env
  ok "devops/ports.env atualizado"
else
  printf 'BACKEND_PORT=%s\nFRONTEND_PORT=%s\nDATABASE_HOST_PORT=%s\nSUPERVISOR_PORT=%s\n' \
    "$BACKEND_PORT" "$FRONTEND_PORT" "$DB_PORT" "$SUPERVISOR_PORT" > devops/ports.env
  ok "devops/ports.env criado"
fi

# Lê o slug do projeto a partir do docker-compose (nome da DB) para montar o COMPOSE
PROJECT_SLUG=$(grep "MYSQL_DATABASE:" devops/docker-compose.yaml 2>/dev/null | awk '{print $NF}' | tr -d '"' | head -1)
PROJECT_SLUG=${PROJECT_SLUG:-skeleton}

COMPOSE="$COMPOSE_BIN -p ${PROJECT_SLUG} --env-file devops/ports.env -f devops/docker-compose.yaml"

# ═══════════════════════════════════════════════════════════════
# PASSO 3 — Arquivo .env
# ═══════════════════════════════════════════════════════════════
step "3/7 — Arquivo .env"

gen_hex()  { openssl rand -hex "${1:-32}"; }
gen_pass() { openssl rand -base64 "${1:-24}" | tr -d '/+='; }

if [[ -f ".env" ]]; then
  ok ".env já existe — será usado como está."
  # Lê credenciais existentes do banco para usá-las no docker-compose
  DB_PASSWORD=$(grep "^DATABASE_URL=" .env 2>/dev/null | sed 's|.*://[^:]*:\([^@]*\)@.*|\1|' || true)
  DB_ROOT_PASSWORD=$(grep "MYSQL_ROOT_PASSWORD:" devops/docker-compose.yaml 2>/dev/null | awk '{print $NF}' || true)
else
  if [[ ! -f ".tooling/env/.env.example" ]]; then
    die ".tooling/env/.env.example não encontrado. O repositório pode estar corrompido."
  fi

  warn ".env não encontrado. Gerando um para esta máquina..."

  APP_SECRET=$(gen_hex 32)
  JWT_PASSPHRASE=$(gen_hex 32)
  DB_PASSWORD=$(gen_pass 18)
  DB_ROOT_PASSWORD=$(gen_pass 18)

  cp .tooling/env/.env.example .env

  sed -i "s|^APP_SECRET=.*|APP_SECRET=${APP_SECRET}|"             .env
  sed -i "s|^JWT_PASSPHRASE=.*|JWT_PASSPHRASE=${JWT_PASSPHRASE}|" .env
  sed -i "s|^VITE_API_URL=.*|VITE_API_URL=http://localhost:${BACKEND_PORT}|" .env

  # Remove portas do .env (ficam apenas no ports.env)
  sed -i "/^BACKEND_PORT=/d;/^FRONTEND_PORT=/d;/^DATABASE_HOST_PORT=/d;/^SUPERVISOR_PORT=/d" .env

  # Atualiza DATABASE_URL com as credenciais geradas
  NEW_DB_URL="mysql://${PROJECT_SLUG}:${DB_PASSWORD}@database:3306/${PROJECT_SLUG}?serverVersion=8.0.32&charset=utf8mb4"
  sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"${NEW_DB_URL//&/\\&}\"|" .env

  # Atualiza docker-compose com as credenciais do banco
  sed -i "s|MYSQL_ROOT_PASSWORD:.*|MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}|" devops/docker-compose.yaml
  sed -i "s|MYSQL_PASSWORD:.*|MYSQL_PASSWORD: ${DB_PASSWORD}|"                devops/docker-compose.yaml

  ok ".env criado com segredos locais gerados"
fi

# ═══════════════════════════════════════════════════════════════
# PASSO 4 — Build e subida dos containers
# ═══════════════════════════════════════════════════════════════
step "4/7 — Buildando e subindo containers"

info "Parando containers anteriores (se houver)..."
$COMPOSE down --volumes --remove-orphans 2>/dev/null || true

# Remove deps locais para evitar conflito de permissão com volumes Docker
if [[ -d "vendor" ]] || [[ -d "node_modules" ]]; then
  info "Limpando dependências locais..."
  rm -rf vendor node_modules 2>/dev/null || true
fi

info "Buildando imagens..."
retry_cmd $COMPOSE build

info "Subindo containers..."
retry_cmd $COMPOSE up -d

ok "Containers rodando"

# ═══════════════════════════════════════════════════════════════
# PASSO 5 — Dependências PHP
# ═══════════════════════════════════════════════════════════════
step "5/7 — Instalando dependências PHP"

USER_ID=$(id -u)
GROUP_ID=$(id -g)

info "Executando composer install no container..."
$COMPOSE run --rm --entrypoint "" --user "${USER_ID}:${GROUP_ID}" --env HOME=/tmp/git-home symfony \
  sh -lc 'mkdir -p "$HOME" && git config --global --add safe.directory /var/www/html && composer install --no-interaction --prefer-dist' \
  || die "Falha ao instalar dependências PHP."

ok "Dependências PHP instaladas"

# ═══════════════════════════════════════════════════════════════
# PASSO 6 — Banco de dados: aguarda + migrations + JWT
# ═══════════════════════════════════════════════════════════════
step "6/7 — Banco de dados e aplicação"

DB_CONTAINER_ID=$($COMPOSE ps -q database 2>/dev/null || echo "")
[[ -z "$DB_CONTAINER_ID" ]] && DB_CONTAINER_ID=$(docker ps --format '{{.Names}}' | grep -E "${PROJECT_SLUG}.*database" | head -1)
[[ -z "$DB_CONTAINER_ID" ]] && die "Container 'database' não encontrado. Verifique docker compose ps."

info "Aguardando MySQL ficar pronto..."
for i in $(seq 1 30); do
  docker exec "$DB_CONTAINER_ID" mysqladmin ping -h localhost --silent 2>/dev/null && break
  [[ $i -eq 30 ]] && die "MySQL não respondeu após 90s. Verifique docker logs."
  sleep 3
done
ok "MySQL pronto"

SYMFONY_CONTAINER_ID=$($COMPOSE ps -q symfony 2>/dev/null || echo "")
[[ -z "$SYMFONY_CONTAINER_ID" ]] && SYMFONY_CONTAINER_ID=$(docker ps --format '{{.Names}}' | grep -E "${PROJECT_SLUG}.*symfony" | head -1)
[[ -z "$SYMFONY_CONTAINER_ID" ]] && die "Container 'symfony' não encontrado."

if ! wait_for_container "$SYMFONY_CONTAINER_ID" "symfony"; then
  die "Container Symfony não estabilizou. Verifique docker logs."
fi

info "Executando migrations..."
docker exec "$SYMFONY_CONTAINER_ID" php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration
ok "Migrations executadas"

info "Gerando chaves JWT..."
docker exec "$SYMFONY_CONTAINER_ID" php bin/console lexik:jwt:generate-keypair --skip-if-exists --no-interaction
ok "JWT OK"

# ═══════════════════════════════════════════════════════════════
# PASSO 7 — Verificação final
# ═══════════════════════════════════════════════════════════════
step "7/7 — Verificação final"

APP_OK=false
for i in $(seq 1 10); do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${BACKEND_PORT}/api/v1/health" 2>/dev/null || echo "000")
  if [[ "$HTTP_CODE" =~ ^(200|204|302)$ ]]; then
    APP_OK=true; break
  fi
  sleep 3
done

[[ "$APP_OK" == true ]] && ok "Aplicação respondendo!" || warn "Aplicação demorando a responder. Aguarde alguns segundos e tente acessar."

# ─── Resumo ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}  ╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${GREEN}  ║        ✅  Instalação concluída com sucesso!      ║${RESET}"
echo -e "${BOLD}${GREEN}  ╚══════════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  ${BOLD}Backend:${RESET}   http://127.0.0.1:${BACKEND_PORT}"
echo -e "  ${BOLD}Frontend:${RESET}  http://127.0.0.1:${FRONTEND_PORT}"
echo -e "  ${BOLD}Banco:${RESET}     127.0.0.1:${DB_PORT}"
echo ""
echo -e "  ${CYAN}Comandos úteis:${RESET}"
echo "   make up-d      subir containers (background)"
echo "   make down      parar containers"
echo "   make help      ver todos os comandos"
echo ""
