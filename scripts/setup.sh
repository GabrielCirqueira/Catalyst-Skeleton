#!/bin/bash
# setup.sh — Configuração inicial do projeto Catalyst Skeleton
#
# Execute UMA VEZ após clonar o repositório:
#   bash scripts/setup.sh
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

# Navegar para a raiz do projeto
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# ─── Configuração de Estado (Persistence) ─────────────────────────────────────
STATE_FILE="$ROOT_DIR/.tooling/.setup-progress"
SETUP_DONE_FILE="$ROOT_DIR/.tooling/.setup-done"

# Carrega estado anterior se existir
if [[ -f "$STATE_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$STATE_FILE"
fi

# Salva variável no arquivo de estado
save_state() {
  local key="$1"; local value="$2"
  mkdir -p "$(dirname "$STATE_FILE")"
  # Remove se já existir para evitar duplicatas
  if [[ -f "$STATE_FILE" ]]; then
    sed -i "/^export ${key}=/d" "$STATE_FILE" 2>/dev/null || true
  fi
  echo "export ${key}=\"${value}\"" >> "$STATE_FILE"
  export "${key}=${value}"
}

# Marca passo como concluído
mark_step() {
  save_state "STEP_${1}_DONE" "1"
}

# Verifica se passo está concluído (ex: is_step_done "1")
is_step_done() {
  local var="STEP_${1}_DONE"
  [[ "${!var:-0}" == "1" ]]
}

# Reset total em caso de erro crítico
critical_reset() {
  warn "Erro crítico detectado ou solicitado. Realizando limpeza total..."
  rm -f .env "$STATE_FILE" "$SETUP_DONE_FILE" devops/ports.env
  rm -rf vendor node_modules
  # Remove chaves JWT (vital pois se o .env mudar, as chaves antigas ficam inválidas)
  rm -rf config/jwt/*.pem 2>/dev/null || true
  # Para os containers se possível
  if command -v docker &>/dev/null && [[ -f "devops/docker-compose.yaml" ]]; then
    docker compose -f devops/docker-compose.yaml down --volumes --remove-orphans 2>/dev/null || true
  fi
  info "Limpeza concluída. Reiniciando setup..."
  exec bash "$0"
}

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
  warn "Deseja realizar um reset total e tentar do zero? (Isso limpará .env, vendor e node_modules)"
  read -rp "  Reset total? [y/N]: " DO_RESET
  if [[ "${DO_RESET,,}" =~ ^y$ ]]; then
    critical_reset
  fi
  echo ""
  echo -e "${RED}  Setup interrompido. Corrija o erro acima e rode novamente.${RESET}"
  echo ""
  exit 1
}

# Tenta executar um comando múltiplas vezes
retry_cmd() {
  local n=1
  local max=3
  local delay=5
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

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Helper: Aguarda container estar em estado RUNNING (não restarting)
wait_for_container() {
  local cid="$1"
  local name="${2:-container}"
  local max_tries=15
  for i in $(seq 1 $max_tries); do
    local status
    status=$(docker inspect -f '{{.State.Status}}' "$cid" 2>/dev/null || echo "not_found")
    if [[ "$status" == "running" ]]; then
       return 0
    fi
    if [[ $i -eq 1 ]]; then info "Aguardando $name estabilizar (Status: $status)..."; fi
    sleep 2
  done
  return 1
}

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
if [[ -f "$SETUP_DONE_FILE" ]]; then
  echo -e "${YELLOW}  ⚠  Este projeto já foi configurado (arquivo .tooling/.setup-done encontrado).${RESET}"
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

# ─── Sanity Check (Validar estado vs arquivos) ───────────────────────────────
if [[ -f "$STATE_FILE" ]]; then
  if is_step_done "3" && [[ "${PROJECT_NAME_KEBAB:-}" != "catalyst-skeleton" ]]; then
    if ! grep -q "\"name\": \"$PROJECT_NAME_KEBAB\"" package.json 2>/dev/null; then
       warn "Inconsistência detectada: Arquivos originais não foram alterados."
       critical_reset
    fi
  fi
  if is_step_done "4" && [[ ! -f ".env" ]]; then
     warn "Inconsistência detectada: Passo 4 concluído mas .env sumiu."
     critical_reset
  fi
fi

# ═══════════════════════════════════════════════════════════════
# PASSO 1 — Nome do projeto
# ═══════════════════════════════════════════════════════════════
if is_step_done "1" && [[ -n "${PROJECT_NAME_SLUG:-}" ]]; then
  step "1/9 — Nome do projeto (Restaurado)"
  ok "Projeto: ${BOLD}${PROJECT_NAME_DISPLAY}${RESET} (Slug: ${PROJECT_NAME_SLUG})"
else
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

  # Derivações do nome
  if [[ "$PROJECT_NAME_RAW" == "Catalyst Skeleton" ]]; then
    PROJECT_NAME_DISPLAY="Catalyst Skeleton"
    PROJECT_NAME_SLUG="skeleton"
    PROJECT_NAME_KEBAB="catalyst-skeleton"
    PROJECT_NAME_PASCAL="CatalystSkeleton"
  else
    PROJECT_NAME_DISPLAY="$PROJECT_NAME_RAW"
    PROJECT_NAME_SLUG=$(echo "$PROJECT_NAME_RAW" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/_/g' | sed 's/__*/_/g' | sed 's/^_//;s/_$//')
    PROJECT_NAME_KEBAB=$(echo "$PROJECT_NAME_RAW" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
    PROJECT_NAME_PASCAL=$(echo "$PROJECT_NAME_RAW" | sed 's/[^a-zA-Z0-9 ]//g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2); print}' | tr -d ' ')
  fi

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

  save_state "PROJECT_NAME_DISPLAY" "$PROJECT_NAME_DISPLAY"
  save_state "PROJECT_NAME_SLUG" "$PROJECT_NAME_SLUG"
  save_state "PROJECT_NAME_KEBAB" "$PROJECT_NAME_KEBAB"
  save_state "PROJECT_NAME_PASCAL" "$PROJECT_NAME_PASCAL"
  save_state "PROJECT_NAME_RAW" "$PROJECT_NAME_RAW"
  mark_step "1"
fi

# ═══════════════════════════════════════════════════════════════
# PASSO 1.5 — Portas do projeto
# ═══════════════════════════════════════════════════════════════
step "1.5/9 — Configuração de portas"

# Lê valores atuais do ports.env para usar como default
GET_PORT() {
  grep "^$1=" devops/ports.env 2>/dev/null | cut -d= -f2 | tr -d '[:space:]' || true
}

_BACKEND_DEF=$(GET_PORT "BACKEND_PORT")
_FRONTEND_DEF=$(GET_PORT "FRONTEND_PORT")
_DB_DEF=$(GET_PORT "DATABASE_HOST_PORT")
_SUPERVISOR_DEF=$(GET_PORT "SUPERVISOR_PORT")

# Se falhar a leitura, usa os padrões históricos do Skeleton
_BACKEND_DEF=${_BACKEND_DEF:-1010}
_FRONTEND_DEF=${_FRONTEND_DEF:-1012}
_DB_DEF=${_DB_DEF:-1013}
_SUPERVISOR_DEF=${_SUPERVISOR_DEF:-1011}

echo "  Quais portas você deseja expor para o ambiente local?"
echo ""

read -rp "  Porta do Backend (Symfony) [$_BACKEND_DEF]: " BACKEND_PORT
BACKEND_PORT=${BACKEND_PORT:-$_BACKEND_DEF}

read -rp "  Porta do Frontend (Vite) [$_FRONTEND_DEF]: " FRONTEND_PORT
FRONTEND_PORT=${FRONTEND_PORT:-$_FRONTEND_DEF}

read -rp "  Porta do Banco de Dados [$_DB_DEF]: " DB_PORT
DB_PORT=${DB_PORT:-$_DB_DEF}

read -rp "  Porta do Supervisor [$_SUPERVISOR_DEF]: " SUPERVISOR_PORT
SUPERVISOR_PORT=${SUPERVISOR_PORT:-$_SUPERVISOR_DEF}

# Valida que todas as portas são únicas entre si
declare -A _seen_ports=()
declare -A _port_labels=(
  ["$BACKEND_PORT"]="Backend"
  ["$FRONTEND_PORT"]="Frontend"
  ["$DB_PORT"]="Banco de Dados"
  ["$SUPERVISOR_PORT"]="Supervisor"
)
_port_conflict=false
for _port in "$BACKEND_PORT" "$FRONTEND_PORT" "$DB_PORT" "$SUPERVISOR_PORT"; do
  if [[ -n "${_seen_ports[$_port]+x}" ]]; then
    warn "Conflito: a porta $_port foi atribuída a mais de um serviço."
    _port_conflict=true
  fi
  _seen_ports[$_port]=1
done
if [[ "$_port_conflict" == "true" ]]; then
  die "Portas duplicadas detectadas. Execute o setup novamente e escolha portas distintas para cada serviço."
fi
unset _seen_ports _port_labels _port _port_conflict

# Atualiza ou cria o arquivo devops/ports.env
if [[ -f "devops/ports.env" ]]; then
  sed -i "s/^BACKEND_PORT=.*/BACKEND_PORT=$BACKEND_PORT/" devops/ports.env
  sed -i "s/^FRONTEND_PORT=.*/FRONTEND_PORT=$FRONTEND_PORT/" devops/ports.env
  sed -i "s/^DATABASE_HOST_PORT=.*/DATABASE_HOST_PORT=$DB_PORT/" devops/ports.env
  sed -i "s/^SUPERVISOR_PORT=.*/SUPERVISOR_PORT=$SUPERVISOR_PORT/" devops/ports.env
  ok "Arquivo devops/ports.env atualizado com as novas portas."
else
  printf 'BACKEND_PORT=%s\nFRONTEND_PORT=%s\nDATABASE_HOST_PORT=%s\nSUPERVISOR_PORT=%s\n' \
    "$BACKEND_PORT" "$FRONTEND_PORT" "$DB_PORT" "$SUPERVISOR_PORT" \
    > devops/ports.env
  ok "Arquivo devops/ports.env criado com as portas configuradas."
fi

save_state "BACKEND_PORT" "$BACKEND_PORT"
save_state "FRONTEND_PORT" "$FRONTEND_PORT"
save_state "DB_PORT" "$DB_PORT"
save_state "SUPERVISOR_PORT" "$SUPERVISOR_PORT"
mark_step "1_5"
# ───────────────────────────────────────────────────────────────
# PASSO 1.6 – Seleção de Módulos Opcionais
# ───────────────────────────────────────────────────────────────
step "1.6/9 – Módulos opcionais"
echo ""
echo "  O Catalyst Skeleton v5 possui um núcleo enxuto."
echo "  Selecione os módulos extras que deseja ativar (Enter = não ativar):"
echo ""

# Módulo: async (Messenger + Scheduler)
if [[ "${MODULE_ASYNC:-}" == "1" ]]; then
  step "1.6/9 – Módulos (Restaurado)"
  ok "async=${MODULE_ASYNC} | observability=${MODULE_OBSERVABILITY:-0}"
else
  read -rp "  [async]         Messenger + Scheduler (filas, workers, tarefas agendadas)?  [s/N]: " _MOD_ASYNC
  _MOD_ASYNC="${_MOD_ASYNC,,}"
  if [[ "$_MOD_ASYNC" =~ ^s$ ]]; then
    save_state "MODULE_ASYNC" "1"
    ok "Módulo async ativado."
  else
    save_state "MODULE_ASYNC" "0"
    info "Módulo async ignorado."
  fi

  read -rp "  [observability]  Sentry (rastreamento de erros em produção)?                [s/N]: " _MOD_OBS
  _MOD_OBS="${_MOD_OBS,,}"
  if [[ "$_MOD_OBS" =~ ^s$ ]]; then
    save_state "MODULE_OBSERVABILITY" "1"
    ok "Módulo observability ativado."
  else
    save_state "MODULE_OBSERVABILITY" "0"
    info "Módulo observability ignorado."
  fi

  read -rp "  [ui-extra]       Framer Motion + Recharts (animações e gráficos)?            [s/N]: " _MOD_UI
  _MOD_UI="${_MOD_UI,,}"
  if [[ "$_MOD_UI" =~ ^s$ ]]; then
    save_state "MODULE_UI_EXTRA" "1"
    ok "Módulo ui-extra ativado."
  else
    save_state "MODULE_UI_EXTRA" "0"
    info "Módulo ui-extra ignorado."
  fi

  echo ""
  info "Módulos: async=${MODULE_ASYNC:-0} | observability=${MODULE_OBSERVABILITY:-0} | ui-extra=${MODULE_UI_EXTRA:-0}"
fi
mark_step "1_6"



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

# Docker Compose (plugin v2 ou standalone v1) com isolamento por projeto (-p)
if docker compose version &>/dev/null 2>&1; then
  ok "docker compose (plugin v2)"
  COMPOSE="docker compose -p ${PROJECT_NAME_SLUG:-skeleton} --env-file devops/ports.env -f devops/docker-compose.yaml"
elif docker-compose version &>/dev/null 2>&1; then
  ok "docker-compose (standalone)"
  COMPOSE="docker-compose -p ${PROJECT_NAME_SLUG:-skeleton} --env-file devops/ports.env -f devops/docker-compose.yaml"
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
if is_step_done "3"; then
  step "3/9 — Substituições (Restaurado)"
  ok "Nomes já substituídos no projeto."
else
  step "3/9 — Substituindo nomes no projeto"

  if [[ "$PROJECT_NAME_RAW" == "Catalyst Skeleton" ]]; then
    info "Mantendo Catalyst Skeleton: Substituições de texto ignoradas."
  else
    # Arquivos onde o nome do projeto aparece (excluindo vendor, node_modules, .git, build, cache)
    RENAME_FILES=$(find . \
      -not -path "./.git/*" \
      -not -path "./vendor/*" \
      -not -path "./node_modules/*" \
      -not -path "./var/cache/*" \
      -not -path "./var/log/*" \
      -not -path "./public/build/*" \
      -not -path "./.tooling/.setup-done" \
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

    replace_in_file() {
      local file="$1"; local from="$2"; local to="$3"
      if grep -qF "$from" "$file" 2>/dev/null; then
        local escaped_from=$(printf '%s\n' "$from" | sed 's|[[\.*^$()+?{|]|\\&|g')
        local escaped_to=$(printf '%s\n' "$to" | sed 's|[[\.*^$(){}+?/|]|\\&|g')
        sed -i "s@${escaped_from}@${escaped_to}@g" "$file" 2>/dev/null && return 0
      fi
    }

    CHANGED=0
    for file in $RENAME_FILES; do
      MODIFIED=false
      if grep -qi "Catalyst Skeleton" "$file" 2>/dev/null; then
        replace_in_file "$file" "Catalyst Skeleton" "$PROJECT_NAME_DISPLAY" && MODIFIED=true
      fi
      if grep -q "catalyst-skeleton" "$file" 2>/dev/null; then
        replace_in_file "$file" "catalyst-skeleton" "$PROJECT_NAME_KEBAB" && MODIFIED=true
      fi
      if grep -qi "catalyst skeleton" "$file" 2>/dev/null; then
        replace_in_file "$file" "catalyst skeleton" "$PROJECT_NAME_SLUG" && MODIFIED=true
      fi
      if grep -q "Catalyst" "$file" 2>/dev/null; then
        replace_in_file "$file" "Catalyst" "$PROJECT_NAME_DISPLAY" && MODIFIED=true
      fi
      
      if grep -q "skeleton" "$file" 2>/dev/null; then
        if [[ "$file" != *".tsx" ]] && [[ "$file" != *".css" ]]; then
           replace_in_file "$file" "skeleton" "$PROJECT_NAME_SLUG" && MODIFIED=true
        fi
      fi
      
      if grep -q "Skeleton" "$file" 2>/dev/null; then
        # Protege o termo 'Skeleton' em componentes de UI (placeholders) e arquivos TSX/CSS
        if [[ "$file" != *".tsx" ]] && [[ "$file" != *".css" ]]; then
          replace_in_file "$file" "React Skeleton" "$PROJECT_NAME_DISPLAY"
          replace_in_file "$file" "Skeleton" "$PROJECT_NAME_PASCAL"
          MODIFIED=true
        fi
      fi
      
      if [[ "$MODIFIED" == true ]]; then
        info "Atualizado: $file"
        CHANGED=$((CHANGED + 1))
      fi
    done
    ok "$CHANGED arquivo(s) atualizado(s)"
  fi
  mark_step "3"
fi

# ═══════════════════════════════════════════════════════════════
# PASSO 4 — Verificação de Portas e Segredos
# ═══════════════════════════════════════════════════════════════
if is_step_done "4" && [[ -f ".env" ]]; then
  step "4/9 — Portas e Segredos (Restaurado)"
  ok ".env já configurado."
else
  step "4/9 — Verificando portas e gerando segredos"

  # Lê as portas configuradas no ports.env
  check_port() {
    (timeout 1s bash -c "echo > /dev/tcp/localhost/$1") >/dev/null 2>&1
  }

  # Carrega portas (ou usa padrões) das variáveis locais (já atualizadas acima)
  BACKEND_PORT=${BACKEND_PORT:-1010}
  FRONTEND_PORT=${FRONTEND_PORT:-1012}
  DB_PORT=${DB_PORT:-1013}

  # Verifica se portas estão livres
  info "Verificando se as portas necessárias estão livres..."
  for port in "$BACKEND_PORT" "$FRONTEND_PORT" "$DB_PORT"; do
    if check_port "$port"; then
      err "A porta ${port} já está em uso por outro processo!"
      warn "A execução pode falhar por conflito. Verifique antes de continuar."
      echo ""
      read -rp "  Deseja continuar mesmo assim? [y/N]: " PORT_CONT
      if [[ ! "${PORT_CONT,,}" =~ ^y$ ]]; then
        exit 1
      fi
    fi
  done
  ok "Portas verificadas"

  if [[ ! -f ".tooling/env/.env.example" ]]; then
    die "Arquivo .tooling/env/.env.example não encontrado. O repositório pode estar corrompido."
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

  # Copia .tooling/env/.env.example → .env e substitui os placeholders
  # Remove o .env anterior caso exista (pode estar sem permissão de escrita)
  rm -f .env
  cp .tooling/env/.env.example .env

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

  # Remove portas duplicadas se existirem no .env (evita confusão, pois devem estar apenas em ports.env)
  sed -i "/^BACKEND_PORT=/d" .env 2>/dev/null || true
  sed -i "/^FRONTEND_PORT=/d" .env 2>/dev/null || true
  sed -i "/^DATABASE_HOST_PORT=/d" .env 2>/dev/null || true
  sed -i "/^SUPERVISOR_PORT=/d" .env 2>/dev/null || true

  # Atualiza VITE_API_URL para usar a porta do backend escolhida
  if grep -q "^VITE_API_URL=" .env; then
    sed -i "s|^VITE_API_URL=.*|VITE_API_URL=http://localhost:${BACKEND_PORT}|" .env
  fi

  # Atualiza devops/docker-compose.yaml com a nova senha do banco
  if [[ -f "devops/docker-compose.yaml" ]]; then
    sed -i "s|MYSQL_ROOT_PASSWORD:.*|MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}|" devops/docker-compose.yaml
    sed -i "s|MYSQL_PASSWORD:.*|MYSQL_PASSWORD: ${DB_PASSWORD}|" devops/docker-compose.yaml
    sed -i "s|MYSQL_USER:.*|MYSQL_USER: ${PROJECT_NAME_SLUG}|" devops/docker-compose.yaml
    sed -i "s|MYSQL_DATABASE:.*|MYSQL_DATABASE: ${PROJECT_NAME_SLUG}|" devops/docker-compose.yaml
    
    # Atualiza DATABASE_URL no .env para usar a nova senha e o host 'database'
    NEW_DB_URL="mysql://${PROJECT_NAME_SLUG}:${DB_PASSWORD}@database:3306/${PROJECT_NAME_SLUG}?serverVersion=8.0.32&charset=utf8mb4"
    # Escapa o '&' para não ser interpretado pelo sed como o match completo
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"${NEW_DB_URL//&/\\&}\"|" .env
    ok "devops/docker-compose.yaml atualizado e DATABASE_URL configurado."
  fi
  mark_step "4"
fi

# ═══════════════════════════════════════════════════════════════
# PASSO 5 — Build e subida dos containers
# ═══════════════════════════════════════════════════════════════
# Verifica se já existem containers rodando para este projeto específico
if is_step_done "5" && [[ $(docker ps --filter "label=com.docker.compose.project=${PROJECT_NAME_SLUG:-skeleton}" -q | wc -l) -gt 2 ]]; then
  step "5/9 — Build e subida (Restaurado)"
  ok "Containers já estão rodando."
else
  step "5/9 — Buildando e subindo containers"

  # Para containers antigos se existirem (evita conflito de portas / nome / volumes sujos)
  info "Parando containers anteriores (cleanup)..."
  $COMPOSE down --volumes --remove-orphans 2>/dev/null || true

  # Limpa dependências locais para evitar erros de permissão cruzada (ex: arquivos criados por root)
  if [[ -d "vendor" ]] || [[ -d "node_modules" ]]; then
    info "Limpando dependências locais para evitar conflitos de permissão..."
    rm -rf vendor node_modules 2>/dev/null || true
  fi

  # Pre-pull de imagens base para evitar timeouts de rede durante o build concorrente
  info "Garantindo imagens base (pre-pull)..."
  BASE_IMAGES=("php:8.4-fpm-alpine" "composer:latest" "node:20" "nginx:alpine" "mysql:8.3")
  for img in "${BASE_IMAGES[@]}"; do
    info "  Baixando $img..."
    retry_cmd docker pull "$img" >/dev/null
  done

  info "Buildando imagens (pode demorar)..."
  retry_cmd $COMPOSE build

  info "Subindo containers em background..."
  retry_cmd $COMPOSE up -d

  ok "Containers rodando"
  mark_step "5"
fi

# ═══════════════════════════════════════════════════════════════
# PASSO 6 — Instalando dependências
# ═══════════════════════════════════════════════════════════════
if is_step_done "6" && [[ -d "vendor" ]] && [[ -f "vendor/autoload.php" ]]; then
  step "6/9 — Instalando dependências (Restaurado)"
  ok "Dependências PHP já instaladas."
else
  step "6/9 — Instalando dependências (PHP e JS)"

  # Detecta UID/GID para evitar problemas de permissão com volumes
  USER_ID=$(id -u)
  GROUP_ID=$(id -g)

  info "Instalando dependências PHP (Composer)..."
  $COMPOSE run --rm --entrypoint "" --user "${USER_ID}:${GROUP_ID}" --env HOME=/tmp/git-home symfony sh -lc 'mkdir -p "$HOME" && git config --global --add safe.directory /var/www/html && composer install --no-interaction --prefer-dist' \
    || die "Falha ao instalar dependências PHP."

  info "Aguardando containers estabilizarem dependências..."
  sleep 5
  ok "Setup de dependências concluído"
  mark_step "6"
fi

# ═══════════════════════════════════════════════════════════════
# PASSO 6.5 — Ativar módulos opcionais selecionados
# ═══════════════════════════════════════════════════════════════
step "6.5/9 — Ativando módulos opcionais"

# Módulo: ui-extra (framer-motion)
if [[ "${MODULE_UI_EXTRA:-0}" == "1" ]]; then
  info "Instalando módulo ui-extra (Framer Motion)..."
  VITE_CONTAINER=$($COMPOSE ps -q vite-react 2>/dev/null || echo "")
  if [[ -n "$VITE_CONTAINER" ]]; then
    docker exec "$VITE_CONTAINER" sh -c "npm install framer-motion --save" 2>/dev/null ||       warn "Falha ao instalar ui-extra. Execute manualmente: npm install framer-motion"
  else
    warn "Container vite-react não encontrado. Execute: npm install framer-motion"
  fi
  ok "Módulo ui-extra ativado."
else
  info "Módulo ui-extra: ignorado."
fi

# Módulo: async (Messenger + Scheduler)
if [[ "${MODULE_ASYNC:-0}" == "1" ]]; then
  info "Instalando módulo async (Messenger + Scheduler)..."
  $COMPOSE exec symfony composer require symfony/doctrine-messenger symfony/scheduler --no-interaction || \
    warn "Falha ao instalar módulo async. Instale manualmente: composer require symfony/doctrine-messenger symfony/scheduler"

  # config/packages/messenger.yaml
  if [[ ! -f "config/packages/messenger.yaml" ]]; then
    cp .skeleton-modules/async/messenger.yaml config/packages/messenger.yaml
    ok "config/packages/messenger.yaml criado."
  fi

  # Pastas de código: Message, MessageHandler, Schedule
  for dir in Message MessageHandler Schedule; do
    if [[ -d ".skeleton-modules/async/src/$dir" && ! -d "src/$dir" ]]; then
      cp -r ".skeleton-modules/async/src/$dir" "src/$dir"
      ok "src/$dir copiado."
    fi
  done

  # Adiciona workers Messenger ao supervisord de produção
  if [[ -f "devops/php/supervisord-prod.conf" ]] && ! grep -q "messenger" devops/php/supervisord-prod.conf; then
    cat .skeleton-modules/async/supervisord-messenger.conf >> devops/php/supervisord-prod.conf
    ok "Workers Messenger adicionados ao supervisord-prod.conf."
  fi

  ok "Módulo async ativado."
else
  info "Módulo async: ignorado."
fi

# Módulo: observability (Sentry)
if [[ "${MODULE_OBSERVABILITY:-0}" == "1" ]]; then
  info "Instalando módulo observability (Sentry)..."
  $COMPOSE exec symfony composer require sentry/sentry-symfony --no-interaction ||     warn "Falha ao instalar módulo observability. Instale manualmente: composer require sentry/sentry-symfony"
  if [[ ! -f "config/packages/sentry.yaml" ]]; then
    cp .skeleton-modules/observability/sentry.yaml config/packages/sentry.yaml
    ok "config/packages/sentry.yaml criado."
  fi
  if ! grep -q "SentryBundle" config/bundles.php; then
    sed -i "s|];|    Sentry\\\\SentryBundle\\\\SentryBundle::class => ['prod' => true],\n];|" config/bundles.php
    ok "SentryBundle registrado em bundles.php."
  fi
  ok "Módulo observability ativado."
else
  info "Módulo observability: ignorado."
fi

# ═══════════════════════════════════════════════════════════════
# PASSO 7 — Aguardar banco de dados ficar pronto
# ═══════════════════════════════════════════════════════════════
step "7/9 — Aguardando banco de dados"
# Tenta detectar o ID do container
DB_CONTAINER_ID=$($COMPOSE ps -q database 2>/dev/null || echo "")
[[ -z "$DB_CONTAINER_ID" ]] && DB_CONTAINER_ID=$(docker ps --format '{{.Names}}' | grep -E "${PROJECT_NAME_SLUG}_database" | head -1)

if [[ -z "$DB_CONTAINER_ID" ]]; then
  die "Banco de dados não encontrado. Rode o setup novamente desde o passo 5."
fi

info "Aguardando MySQL (container: $DB_CONTAINER_ID)..."
MAX_TRIES=30
for i in $(seq 1 $MAX_TRIES); do
  if docker exec "$DB_CONTAINER_ID" mysqladmin ping -h localhost --silent 2>/dev/null; then
    ok "MySQL pronto!"
    break
  fi
  [[ $i -eq $MAX_TRIES ]] && die "MySQL não respondeu. Verifique docker logs."
  sleep 3
done

# ═══════════════════════════════════════════════════════════════
# PASSO 8 — Configurando aplicação Symfony
# ═══════════════════════════════════════════════════════════════
step "8/9 — Configurando aplicação"
SYMFONY_CONTAINER_ID=$($COMPOSE ps -q symfony 2>/dev/null || echo "")
[[ -z "$SYMFONY_CONTAINER_ID" ]] && SYMFONY_CONTAINER_ID=$(docker ps --format '{{.Names}}' | grep -E "${PROJECT_NAME_SLUG}_symfony" | head -1)

info "Container Symfony: $SYMFONY_CONTAINER_ID"
# Garante que o container esteja rodando antes de dar exec
if ! wait_for_container "$SYMFONY_CONTAINER_ID" "Symfony"; then
  die "O container Symfony '$SYMFONY_CONTAINER_ID' não estabilizou. Verifique 'docker logs' ou 'docker ps'."
fi

  # Chaves JWT
  info "Garantindo chaves JWT..."
  docker exec "$SYMFONY_CONTAINER_ID" php bin/console lexik:jwt:generate-keypair --skip-if-exists --no-interaction
  ok "JWT OK"

  # As migrations já são executadas pelo bootstrap.sh do container no boot.
  # Aqui apenas aguardamos o container estar realmente pronto para receber requisições.
  info "Sincronizando banco de dados..."
  count=0
  until docker exec "$SYMFONY_CONTAINER_ID" php bin/console doctrine:migrations:status >/dev/null 2>&1 || [ $count -gt 30 ]; do
    echo -n "."
    sleep 2
    ((count++))
  done
  echo ""
  ok "Banco de dados sincronizado."

# ═══════════════════════════════════════════════════════════════
# PASSO 9 — Verificação final
# ═══════════════════════════════════════════════════════════════
step "9/9 — Verificação final"
APP_OK=false
for i in $(seq 1 10); do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${BACKEND_PORT}/api/v1/health" 2>/dev/null || echo "000")
  if [[ "$HTTP_CODE" =~ ^(200|204|302)$ ]]; then
    APP_OK=true; break
  fi
  sleep 3
done

[[ "$APP_OK" == true ]] && ok "Aplicação respondendo!" || warn "Aplicação demorando a responder."

# Marca concluído
mark_step "DONE"
echo "setup concluído em $(date)" > "$SETUP_DONE_FILE"
echo "project_name=${PROJECT_NAME_DISPLAY}" >> "$SETUP_DONE_FILE"
echo "project_slug=${PROJECT_NAME_SLUG}" >> "$SETUP_DONE_FILE"
echo "backend_url=http://127.0.0.1:${BACKEND_PORT}" >> "$SETUP_DONE_FILE"
echo "frontend_url=http://127.0.0.1:${FRONTEND_PORT}" >> "$SETUP_DONE_FILE"

# ─── Resumo final ─────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}  ╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${GREEN}  ║          ✅  Setup concluído com sucesso!         ║${RESET}"
echo -e "${BOLD}${GREEN}  ╚══════════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  ${BOLD}Projeto:${RESET}   ${PROJECT_NAME_DISPLAY}"
echo -e "  ${BOLD}Backend:${RESET}   http://127.0.0.1:${BACKEND_PORT}"
echo -e "  ${BOLD}Frontend:${RESET}  http://127.0.0.1:${FRONTEND_PORT}"
echo -e "  ${BOLD}Banco:${RESET}     127.0.0.1:$(grep "^DATABASE_HOST_PORT=" devops/ports.env 2>/dev/null | cut -d= -f2 | tr -d '[:space:]' || echo 1013)"
echo ""
echo -e "  ${CYAN}Comandos úteis (Makefile):${RESET}"
echo "   make up-d                   subir containers (background)"
echo "   make down                   parar containers"
echo "   make help                   ver todos os comandos disponíveis"
echo "   bash scripts/logs-dev.sh     menu interativo de logs"
echo ""
# Garante que exibição funcione mesmo em restauração (pegando do .env se necessário)
S_SECRET=${APP_SECRET:-$(grep "^APP_SECRET=" .env 2>/dev/null | cut -d= -f2 || echo "n/a")}
S_JWT=${JWT_PASSPHRASE:-$(grep "^JWT_PASSPHRASE=" .env 2>/dev/null | cut -d= -f2 || echo "n/a")}
S_DB_PASS=${DB_PASSWORD:-$(grep "MYSQL_PASSWORD:" devops/docker-compose.yaml 2>/dev/null | awk '{print $NF}' || echo "n/a")}

echo -e "  ${YELLOW}Credenciais geradas (salvas no .env — não commite!):${RESET}"
echo "   APP_SECRET:       ${S_SECRET:0:16}..."
echo "   JWT_PASSPHRASE:   ${S_JWT:0:16}..."
echo "   DB_PASSWORD:      ${S_DB_PASS}"
echo ""
