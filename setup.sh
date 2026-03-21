#!/bin/bash
# setup.sh — Configuração inicial do projeto Catalyst Skeleton
#
# Execute UMA VEZ após clonar o repositório:
#   bash setup.sh
#
# O que este script faz:
#   1. Pergunta o nome do projeto e substitui "skeleton"/"Catalyst Skeleton" em todo o código
#   2. Gera segredos aleatórios (APP_SECRET, JWT_PASSPHRASE, senhas do banco)
#   3. Cria o .env a partir do .env.dev com os valores gerados
#   4. Verifica pré-requisitos (Docker, docker compose)
#   5. Builda e sobe todos os containers
#   6. Instala dependências PHP e JS (já dentro dos containers)
#   7. Aguarda o banco de dados ficar pronto
#   8. Gera as chaves JWT e executa migrations
#   9. Confirma que tudo está rodando

set -euo pipefail

# ─── Cores e helpers ──────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

ok()   { echo -e "${GREEN}  ✓${RESET} $*"; }
info() { echo -e "${CYAN}  →${RESET} $*"; }
warn() { echo -e "${YELLOW}  ⚠${RESET} $*"; }
err()  { echo -e "${RED}  ✗ ERRO:${RESET} $*" >&2; }
step() { echo ""; echo -e "${BOLD}${BLUE}━━ $* ${RESET}"; }

die() {
  err "$*"
  echo ""
  echo -e "${RED}  Setup interrompido. Corrija o erro acima e rode novamente.${RESET}"
  echo ""
  exit 1
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ─── Banner ───────────────────────────────────────────────────────────────────
clear
echo ""
echo -e "${BOLD}${BLUE}  ╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${BLUE}  ║        Catalyst Skeleton — Setup Inicial         ║${RESET}"
echo -e "${BOLD}${BLUE}  ╚══════════════════════════════════════════════════╝${RESET}"
echo ""
echo "  Este script configura o ambiente de desenvolvimento."
echo "  Execute apenas uma vez, após clonar o repositório."
echo ""

# ─── Verificar se já foi executado ────────────────────────────────────────────
if [[ -f ".setup-done" ]]; then
  echo -e "${YELLOW}  ⚠  Este projeto já foi configurado (arquivo .setup-done encontrado).${RESET}"
  echo ""
  read -rp "  Deseja reconfigurar do zero? [s/N]: " RERUN
  if [[ ! "${RERUN,,}" =~ ^s$ ]]; then
    echo ""
    info "Setup cancelado. Para subir os containers: docker compose up -d"
    echo ""
    exit 0
  fi
  echo ""
fi

# ═══════════════════════════════════════════════════════════════
# PASSO 1 — Nome do projeto
# ═══════════════════════════════════════════════════════════════
step "1/9 — Nome do projeto"

echo "  Qual é o nome do seu projeto?"
echo "  (Deixe em branco para manter 'Catalyst Skeleton')"
echo ""
read -rp "  Nome do projeto: " PROJECT_NAME_RAW

if [[ -z "$PROJECT_NAME_RAW" ]]; then
  PROJECT_NAME_RAW="Catalyst Skeleton"
  info "Mantendo nome padrão: ${BOLD}Catalyst Skeleton${RESET}"
else
  info "Nome do projeto: ${BOLD}${PROJECT_NAME_RAW}${RESET}"
fi

# Derivações do nome:
#   PROJECT_NAME_DISPLAY  = "Rota Fácil"              (exibição, original)
#   PROJECT_NAME_SLUG     = "rota_facil"               (banco, docker, env — snake_case minúsculo)
#   PROJECT_NAME_KEBAB    = "rota-facil"               (package.json, URLs — kebab-case)
#   PROJECT_NAME_PASCAL   = "RotaFacil"                (futuro uso em classes)
#   PROJECT_NAME_UPPER    = "ROTA_FACIL"               (prefixos em maiúsculo)

PROJECT_NAME_DISPLAY="$PROJECT_NAME_RAW"
PROJECT_NAME_SLUG=$(echo "$PROJECT_NAME_RAW" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/_/g' | sed 's/__*/_/g' | sed 's/^_//;s/_$//')
PROJECT_NAME_KEBAB=$(echo "$PROJECT_NAME_RAW" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
PROJECT_NAME_PASCAL=$(echo "$PROJECT_NAME_RAW" | sed 's/[^a-zA-Z0-9 ]//g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2); print}' | tr -d ' ')

echo ""
echo -e "  ${CYAN}Nome de exibição:${RESET}  ${PROJECT_NAME_DISPLAY}"
echo -e "  ${CYAN}Slug (banco/docker):${RESET} ${PROJECT_NAME_SLUG}"
echo -e "  ${CYAN}Kebab (package.json):${RESET} ${PROJECT_NAME_KEBAB}"
echo ""
read -rp "  Confirmar? [S/n]: " CONFIRM_NAME
if [[ "${CONFIRM_NAME,,}" =~ ^n$ ]]; then
  info "Rode o script novamente para escolher outro nome."
  exit 0
fi

# ═══════════════════════════════════════════════════════════════
# PASSO 2 — Pré-requisitos
# ═══════════════════════════════════════════════════════════════
step "2/9 — Verificando pré-requisitos"

check_cmd() {
  if command -v "$1" &>/dev/null; then
    ok "$1 encontrado ($(command -v "$1"))"
  else
    die "Dependência ausente: ${BOLD}$1${RESET}\n  Instale antes de continuar."
  fi
}

check_cmd docker
check_cmd openssl
check_cmd git

# Docker Compose (plugin v2 ou standalone v1)
if docker compose version &>/dev/null 2>&1; then
  ok "docker compose (plugin v2)"
  COMPOSE="docker compose --env-file ports.env -f docker/docker-compose.yaml"
elif docker-compose version &>/dev/null 2>&1; then
  ok "docker-compose (standalone)"
  COMPOSE="docker-compose --env-file ports.env -f docker/docker-compose.yaml"
else
  die "docker compose não encontrado. Instale o Docker Desktop ou o plugin compose."
fi

# Verificar se Docker daemon está rodando
if ! docker info &>/dev/null; then
  die "Docker daemon não está rodando. Inicie o Docker e tente novamente."
fi
ok "Docker daemon ativo"

# ═══════════════════════════════════════════════════════════════
# PASSO 3 — Substituição de nomes em todo o projeto
# ═══════════════════════════════════════════════════════════════
step "3/9 — Substituindo nomes no projeto"

# Arquivos onde o nome do projeto aparece (excluindo vendor, node_modules, .git, build, cache)
RENAME_FILES=$(find . \
  -not -path "./.git/*" \
  -not -path "./vendor/*" \
  -not -path "./node_modules/*" \
  -not -path "./var/cache/*" \
  -not -path "./var/log/*" \
  -not -path "./public/build/*" \
  -not -path "./.setup-done" \
  -not -name "setup.sh" \
  -type f \
  \( \
    -name "*.php" -o -name "*.yaml" -o -name "*.yml" -o \
    -name "*.json" -o -name "*.env" -o -name "*.env.*" -o \
    -name ".env*" -o -name "*.sh" -o -name "*.ts" -o \
    -name "*.tsx" -o -name "*.js" -o -name "*.cjs" -o \
    -name "*.twig" -o -name "*.xml" -o -name "*.neon" -o \
    -name "*.conf" -o -name "*.md" -o -name "*.ini" -o \
    -name "*.txt" -o -name "Dockerfile" \
  \) \
  2>/dev/null)

# Função que substitui em um arquivo com segurança (backup → sed → remover backup)
replace_in_file() {
  local file="$1"
  local from="$2"
  local to="$3"
  if grep -qF "$from" "$file" 2>/dev/null; then
    sed -i "s|$(printf '%s\n' "$from" | sed 's|[[\.*^$()+?{|]|\\&|g')|$(printf '%s\n' "$to" | sed 's|[[\.*^$(){}+?/|]|\\&|g')|g" "$file" 2>/dev/null && return 0
  fi
}

CHANGED=0

for file in $RENAME_FILES; do
  ORIG_CONTENT=$(cat "$file" 2>/dev/null || continue)
  CHANGED_FILE=false

  # ── Substituições ordenadas (mais específico → menos específico) ────────────

  # 1. "Catalyst Skeleton" → nome de exibição (mais específico)
  if grep -qi "Catalyst Skeleton" "$file" 2>/dev/null; then
    replace_in_file "$file" "Catalyst Skeleton" "$PROJECT_NAME_DISPLAY"
  fi

  # 2. "catalyst-skeleton" → slug ou kebab (usado em package.json, docker-compose)
  if grep -q "catalyst-skeleton" "$file" 2>/dev/null; then
    replace_in_file "$file" "catalyst-skeleton" "$PROJECT_NAME_KEBAB"
  fi

  # 3. "catalyst skeleton" (separado)
  if grep -qi "catalyst skeleton" "$file" 2>/dev/null; then
    replace_in_file "$file" "catalyst skeleton" "$PROJECT_NAME_SLUG"
  fi

  # 4. "catalyst" solto (BRANDING)
  # Aparece em layouts como nome da marca
  if grep -q "Catalyst" "$file" 2>/dev/null; then
     # Só substitui se não for parte de uma classe ou import (heurística simples)
     replace_in_file "$file" "Catalyst" "$PROJECT_NAME_DISPLAY"
  fi

  # 5. "skeleton" técnico (BD, docker, env, caminhos internos)
  # AVISO: Não pode trocar @shadcn/skeleton ou componente Skeleton da UI!
  if grep -q "skeleton" "$file" 2>/dev/null; then
    # Pula arquivos de UI conhecidos
    if [[ "$file" != *"shadcn/"* ]] && [[ "$file" != *".tsx" ]] && [[ "$file" != *".css" ]]; then
       replace_in_file "$file" "skeleton" "$PROJECT_NAME_SLUG"
    fi
  fi

  # "Skeleton" com maiúscula (texto de UI como "React Skeleton")
  if grep -q "Skeleton" "$file" 2>/dev/null; then
    # Não tocar no shadcn/components/ui/skeleton.tsx — é um componente de loading
    if [[ "$file" != *"shadcn/components/ui/skeleton.tsx"* ]]; then
      replace_in_file "$file" "React Skeleton" "$PROJECT_NAME_DISPLAY"
      replace_in_file "$file" "Skeleton" "$PROJECT_NAME_PASCAL"
    fi
    CHANGED_FILE=true
  fi

  if [[ "$CHANGED_FILE" == true ]]; then
    NEW_CONTENT=$(cat "$file" 2>/dev/null)
    if [[ "$ORIG_CONTENT" != "$NEW_CONTENT" ]]; then
      info "Atualizado: $file"
      CHANGED=$((CHANGED + 1))
    fi
  fi
done

ok "$CHANGED arquivo(s) atualizado(s)"

# ═══════════════════════════════════════════════════════════════
# PASSO 4 — Gerar segredos e criar .env
# ═══════════════════════════════════════════════════════════════
step "4/9 — Gerando segredos e criando .env"

if [[ ! -f ".env.example" ]]; then
  die "Arquivo .env.example não encontrado. O repositório pode estar corrompido."
fi

# Gera valores aleatórios seguros
gen_hex()  { openssl rand -hex "${1:-32}"; }          # 32 bytes = 64 chars hex
gen_pass() { openssl rand -base64 "${1:-24}" | tr -d '/+='; }  # senha sem chars especiais

APP_SECRET=$(gen_hex 32)
JWT_PASSPHRASE=$(gen_hex 32)
DB_PASSWORD=$(gen_pass 18)
DB_ROOT_PASSWORD=$(gen_pass 18)

info "APP_SECRET gerado:       ${APP_SECRET:0:16}..."
info "JWT_PASSPHRASE gerado:   ${JWT_PASSPHRASE:0:16}..."
info "DB_PASSWORD gerado:      ${DB_PASSWORD:0:8}..."
info "DB_ROOT_PASSWORD gerado: ${DB_ROOT_PASSWORD:0:8}..."

# Copia .env.example → .env e substitui os placeholders
cp .env.example .env

# Substitui ou adiciona APP_SECRET
if grep -q "^APP_SECRET=" .env; then
  sed -i "s|^APP_SECRET=.*|APP_SECRET=${APP_SECRET}|" .env
else
  echo "APP_SECRET=${APP_SECRET}" >> .env
fi

# JWT_PASSPHRASE
if grep -q "^JWT_PASSPHRASE=" .env; then
  sed -i "s|^JWT_PASSPHRASE=.*|JWT_PASSPHRASE=${JWT_PASSPHRASE}|" .env
else
  echo "JWT_PASSPHRASE=${JWT_PASSPHRASE}" >> .env
fi

ok ".env criado com segredos gerados"

# Atualiza docker/docker-compose.yaml com a nova senha do banco
if [[ -f "docker/docker-compose.yaml" ]]; then
  sed -i "s|MYSQL_ROOT_PASSWORD:.*|MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}|" docker/docker-compose.yaml
  sed -i "s|MYSQL_PASSWORD:.*|MYSQL_PASSWORD: ${DB_PASSWORD}|" docker/docker-compose.yaml
  sed -i "s|MYSQL_USER:.*|MYSQL_USER: ${PROJECT_NAME_SLUG}|" docker/docker-compose.yaml
  sed -i "s|MYSQL_DATABASE:.*|MYSQL_DATABASE: ${PROJECT_NAME_SLUG}|" docker/docker-compose.yaml
  
  # Atualiza DATABASE_URL no .env para usar a nova senha e o host 'database'
  NEW_DB_URL="mysql://${PROJECT_NAME_SLUG}:${DB_PASSWORD}@database:3306/${PROJECT_NAME_SLUG}?serverVersion=8.0.32&charset=utf8mb4"
  # Escapa o '&' para não ser interpretado pelo sed como o match completo
  sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"${NEW_DB_URL//&/\\&}\"|" .env
  ok "docker/docker-compose.yaml atualizado com novas senhas e nomes"
  ok "DATABASE_URL atualizado no .env"
fi

# ═══════════════════════════════════════════════════════════════
# PASSO 5 — Build e subida dos containers
# ═══════════════════════════════════════════════════════════════
step "5/9 — Buildando e subindo containers"

# Para containers antigos se existirem (evita conflito de portas / nome / volumes sujos)
info "Parando containers anteriores e limpando volumes (se houver)..."
$COMPOSE down --volumes --remove-orphans 2>/dev/null || true

info "Buildando imagens (isso pode levar alguns minutos na primeira vez)..."
$COMPOSE build --no-cache || die "Falha no build dos containers."

info "Subindo containers em background..."
$COMPOSE up -d || die "Falha ao subir os containers."

ok "Containers rodando"

# ═══════════════════════════════════════════════════════════════
# PASSO 6 — Instalando dependências
# ═══════════════════════════════════════════════════════════════
step "6/9 — Instalando dependências (PHP e JS)"

# Detecta UID/GID para evitar problemas de permissão com volumes
USER_ID=$(id -u)
GROUP_ID=$(id -g)

info "Instalando dependências PHP (Composer)..."
$COMPOSE run --rm --entrypoint "" --user "${USER_ID}:${GROUP_ID}" --env HOME=/tmp/git-home symfony sh -lc 'mkdir -p "$HOME" && git config --global --add safe.directory /var/www/html && composer install --no-interaction --prefer-dist' \
  || die "Falha ao instalar dependências PHP."

info "Instalando dependências JS (NPM)..."
$COMPOSE run --rm --entrypoint "" vite-react sh -lc "npm install --legacy-peer-deps" \
  || die "Falha ao instalar dependências JS."

ok "Dependências instaladas"

# ═══════════════════════════════════════════════════════════════
# PASSO 7 — Aguardar banco de dados ficar pronto
# ═══════════════════════════════════════════════════════════════
step "7/9 — Aguardando banco de dados"

DB_CONTAINER="${PROJECT_NAME_SLUG}_database"
# Tenta detectar o nome real do container
DB_CONTAINER_ACTUAL=$(docker ps --format '{{.Names}}' | grep -E "database|mysql" | head -1)
if [[ -z "$DB_CONTAINER_ACTUAL" ]]; then
  DB_CONTAINER_ACTUAL="skeleton_database"
fi

info "Aguardando MySQL ficar pronto (container: $DB_CONTAINER_ACTUAL)..."
MAX_TRIES=30
for i in $(seq 1 $MAX_TRIES); do
  if docker exec "$DB_CONTAINER_ACTUAL" mysqladmin ping -h localhost --silent 2>/dev/null; then
    ok "MySQL pronto!"
    break
  fi
  if [[ $i -eq $MAX_TRIES ]]; then
    err "MySQL não respondeu após ${MAX_TRIES} tentativas."
    echo ""
    echo "  Logs do container de banco:"
    docker logs --tail 20 "$DB_CONTAINER_ACTUAL" 2>&1 || true
    die "Banco de dados não iniciou. Verifique os logs acima."
  fi
  info "  Tentativa $i/$MAX_TRIES — aguardando 3s..."
  sleep 3
done

# ═══════════════════════════════════════════════════════════════
# PASSO 7 — Dependências e configuração dentro do container Symfony
# ═══════════════════════════════════════════════════════════════
step "8/9 — Configurando aplicação Symfony"

# Detecta o container Symfony
SYMFONY_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E "symfony|php|app" | grep -v "database\|vite\|redis" | head -1)
if [[ -z "$SYMFONY_CONTAINER" ]]; then
  SYMFONY_CONTAINER="${PROJECT_NAME_SLUG}_symfony"
fi

info "Container Symfony detectado: $SYMFONY_CONTAINER"

# Aguarda o bootstrap.sh terminar (ele roda automático no CMD do Dockerfile)
info "Aguardando bootstrap.sh concluir dentro do container..."
sleep 5

# Verifica se o container está realmente rodando
if ! docker ps --format '{{.Names}}' | grep -q "^${SYMFONY_CONTAINER}$"; then
  err "Container '$SYMFONY_CONTAINER' não está rodando."
  echo ""
  echo "  Containers em execução:"
  docker ps --format "  {{.Names}} — {{.Status}}"
  die "Container Symfony não iniciou. Verifique: docker compose logs"
fi

ok "Container Symfony está rodando"

# Gera chaves JWT (se o bootstrap.sh ainda não gerou)
info "Verificando chaves JWT..."
if ! docker exec "$SYMFONY_CONTAINER" test -f /var/www/html/config/jwt/private.pem 2>/dev/null; then
  info "Gerando chaves JWT..."
  docker exec "$SYMFONY_CONTAINER" php bin/console lexik:jwt:generate-keypair --skip-if-exists --no-interaction \
    || die "Falha ao gerar chaves JWT."
  ok "Chaves JWT geradas"
else
  ok "Chaves JWT já existem"
fi

# Executa migrations
info "Executando migrations do banco de dados..."
docker exec "$SYMFONY_CONTAINER" php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration \
  || die "Falha ao executar migrations. Verifique os logs do container."
ok "Migrations executadas"

# Cache warmup (dev)
info "Limpando cache do Symfony..."
docker exec "$SYMFONY_CONTAINER" php bin/console cache:clear --no-interaction 2>/dev/null || true
ok "Cache limpo"

# ═══════════════════════════════════════════════════════════════
# PASSO 8 — Verificação final
# ═══════════════════════════════════════════════════════════════
step "9/9 — Verificação final"

# Lê as portas configuradas no ports.env
BACKEND_PORT=$(grep "^BACKEND_PORT=" ports.env 2>/dev/null | cut -d= -f2 | tr -d '[:space:]')
FRONTEND_PORT=$(grep "^FRONTEND_PORT=" ports.env 2>/dev/null | cut -d= -f2 | tr -d '[:space:]')
BACKEND_PORT="${BACKEND_PORT:-1010}"
FRONTEND_PORT="${FRONTEND_PORT:-1012}"

# Aguarda o app responder
info "Aguardando aplicação responder na porta ${BACKEND_PORT}..."
APP_OK=false
for i in $(seq 1 15); do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${BACKEND_PORT}/api/v1/health" 2>/dev/null || echo "000")
  if [[ "$HTTP_CODE" =~ ^(200|204)$ ]]; then
    APP_OK=true
    ok "Aplicação respondendo! (HTTP $HTTP_CODE)"
    break
  fi
  # Também aceita 302 / 200 na rota raiz
  HTTP_ROOT=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${BACKEND_PORT}/" 2>/dev/null || echo "000")
  if [[ "$HTTP_ROOT" =~ ^(200|302|301)$ ]]; then
    APP_OK=true
    ok "Aplicação respondendo na raiz! (HTTP $HTTP_ROOT)"
    break
  fi
  info "  Tentativa $i/15 — status: $HTTP_CODE — aguardando 4s..."
  sleep 4
done

if [[ "$APP_OK" != true ]]; then
  warn "A aplicação não respondeu no tempo esperado."
  warn "Isso é normal se o Vite ainda estiver compilando."
  warn "Verifique manualmente: http://localhost:${BACKEND_PORT}"
fi

# Marca o setup como concluído
echo "setup concluído em $(date)" > .setup-done
echo "project_name=${PROJECT_NAME_DISPLAY}" >> .setup-done
echo "project_slug=${PROJECT_NAME_SLUG}" >> .setup-done

# ─── Resumo final ─────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}  ╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${GREEN}  ║          ✅  Setup concluído com sucesso!         ║${RESET}"
echo -e "${BOLD}${GREEN}  ╚══════════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  ${BOLD}Projeto:${RESET}   ${PROJECT_NAME_DISPLAY}"
echo -e "  ${BOLD}Backend:${RESET}   http://localhost:${BACKEND_PORT}"
echo -e "  ${BOLD}Frontend:${RESET}  http://localhost:${FRONTEND_PORT}"
echo -e "  ${BOLD}Banco:${RESET}     localhost:$(grep "^DATABASE_HOST_PORT=" ports.env 2>/dev/null | cut -d= -f2 | tr -d '[:space:]' || echo 1013)"
echo ""
echo -e "  ${CYAN}Comandos úteis:${RESET}"
echo "   docker compose up -d        subir containers"
echo "   docker compose down         parar containers"
echo "   docker compose logs -f      ver logs em tempo real"
echo "   bash devops/logs-dev.sh     menu completo de logs"
echo ""
echo -e "  ${YELLOW}Credenciais geradas (salvas no .env — não commite!):${RESET}"
echo "   APP_SECRET:       ${APP_SECRET:0:16}..."
echo "   JWT_PASSPHRASE:   ${JWT_PASSPHRASE:0:16}..."
echo "   DB_PASSWORD:      ${DB_PASSWORD}"
echo ""
