#!/bin/bash
# devops/pre-deploy.sh — Configuração pré-deploy (execute LOCALMENTE)
#
# Execute uma vez antes do primeiro deploy em produção, a partir da raiz:
#   bash devops/pre-deploy.sh
#
# O que este script faz:
#   1. Coleta informações do projeto (domínio, VPS, banco de dados)
#   2. Configura docker/nginx/prod.conf com o domínio real
#   3. Atualiza devops/.env.prod.example com as configurações (sem senhas reais)
#   4. Orienta o git commit/push
#   5. Opcionalmente conecta via SSH na VPS e executa deploy.sh automaticamente

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# ─── Cores e helpers ──────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

ok()   { echo -e "${GREEN}  ✓${RESET} $*"; }
info() { echo -e "${CYAN}  →${RESET} $*"; }
warn() { echo -e "${YELLOW}  ⚠${RESET} $*"; }
err()  { echo -e "${RED}  ✗ ERRO:${RESET} $*" >&2; }
step() { echo ""; echo -e "${BOLD}${BLUE}━━ $* ${RESET}"; }

ask() {
  # ask "Pergunta" "DEFAULT" → retorna valor digitado ou default
  local prompt="$1"
  local default="${2:-}"
  if [[ -n "$default" ]]; then
    read -rp "$(echo -e "  ${CYAN}$prompt${RESET} [${default}]: ")" val
    echo "${val:-$default}"
  else
    read -rp "$(echo -e "  ${CYAN}$prompt${RESET}: ")" val
    echo "$val"
  fi
}

ask_secret() {
  local prompt="$1"
  read -rsp "$(echo -e "  ${CYAN}$prompt${RESET}: ")" val
  echo ""
  echo "$val"
}

die() {
  err "$*"
  echo ""
  exit 1
}

sed_inplace() {
  # Compatível com macOS (BSD sed) e Linux (GNU sed)
  if sed --version 2>/dev/null | grep -q GNU; then
    sed -i "$@"
  else
    sed -i '' "$@"
  fi
}

# ─── Banner ───────────────────────────────────────────────────────────────────
clear
echo ""
echo -e "${BOLD}${BLUE}  ╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${BLUE}  ║     Catalyst Skeleton — Configuração Prod        ║${RESET}"
echo -e "${BOLD}${BLUE}  ╚══════════════════════════════════════════════════╝${RESET}"
echo ""
echo "  Este script configura o projeto para produção."
echo "  Execute-o LOCALMENTE, uma vez, antes do primeiro deploy."
echo ""

# ─── Arquivo de configuração salvo ────────────────────────────────────────────
PRE_DEPLOY_CONF="$SCRIPT_DIR/.pre-deploy.conf"

if [[ -f "$PRE_DEPLOY_CONF" ]]; then
  echo -e "${YELLOW}  ⚠  Configuração pré-deploy já existe (.pre-deploy.conf).${RESET}"
  read -rp "  Reconfigurar? [s/N]: " RERUN
  if [[ ! "${RERUN,,}" =~ ^s$ ]]; then
    info "Nenhuma alteração feita."
    exit 0
  fi
  echo ""
fi

# ═══════════════════════════════════════════════════════════════
# PASSO 1 — Domínio e URL da aplicação
# ═══════════════════════════════════════════════════════════════
step "1/5 — Domínio da aplicação"

echo "  Informe o domínio de produção (sem https://, sem barra)."
echo -e "  ${YELLOW}Exemplos: meusite.com.br   api.meusite.com${RESET}"
echo ""

DOMAIN=$(ask "Domínio")
[[ -z "$DOMAIN" ]] && die "Domínio é obrigatório."
# Remove protocolo se o usuário incluiu
DOMAIN="${DOMAIN#https://}"
DOMAIN="${DOMAIN#http://}"
DOMAIN="${DOMAIN%/}"

CERTBOT_EMAIL=$(ask "E-mail para certificado SSL (Let's Encrypt)")
[[ -z "$CERTBOT_EMAIL" ]] && die "E-mail do certbot é obrigatório."

ok "Domínio: https://$DOMAIN"

# ═══════════════════════════════════════════════════════════════
# PASSO 2 — VPS / Servidor
# ═══════════════════════════════════════════════════════════════
step "2/5 — Conexão SSH com a VPS"

echo "  Informe os dados de acesso à VPS para o deploy automático."
echo ""

VPS_HOST=$(ask "IP ou hostname da VPS" "$DOMAIN")
VPS_USER=$(ask "Usuário SSH" "root")
VPS_PORT=$(ask "Porta SSH" "22")
VPS_DIR=$(ask "Diretório do projeto na VPS" "/opt/app")

ok "SSH: ${VPS_USER}@${VPS_HOST}:${VPS_PORT} → $VPS_DIR"

# ═══════════════════════════════════════════════════════════════
# PASSO 3 — Banco de dados
# ═══════════════════════════════════════════════════════════════
step "3/5 — Banco de dados"

echo "  Estes nomes serão salvos no .env.prod.example."
echo "  As SENHAS serão geradas automaticamente pelo deploy.sh na VPS."
echo ""

# Detecta project slug do .setup-done se existir
SETUP_SLUG=""
if [[ -f "$PROJECT_ROOT/.setup-done" ]]; then
  SETUP_SLUG=$(grep "^project_slug=" "$PROJECT_ROOT/.setup-done" 2>/dev/null | cut -d= -f2 || true)
fi
DEFAULT_DB="${SETUP_SLUG:-app}"

DB_NAME=$(ask "Nome do banco de dados" "${DEFAULT_DB}_prod")
DB_USER=$(ask "Usuário do banco" "$DEFAULT_DB")

ok "Banco: $DB_NAME  Usuário: $DB_USER"

# ═══════════════════════════════════════════════════════════════
# PASSO 4 — Configurações opcionais
# ═══════════════════════════════════════════════════════════════
step "4/5 — Configurações opcionais"

MAILER_DSN=$(ask "MAILER_DSN (SMTP)" "smtp://user:pass@smtp.exemplo.com:587")
SLACK_WEBHOOK=$(ask "Slack Webhook URL (monitor.sh — deixe em branco para pular)" "")
BACKEND_PORT=$(ask "Porta exposta pelo backend na VPS" "80")

# ═══════════════════════════════════════════════════════════════
# PASSO 5 — Aplicar configurações
# ═══════════════════════════════════════════════════════════════
step "5/5 — Aplicando configurações"

# ── 5a. docker/nginx/prod.conf ─────────────────────────────────────────────
info "Atualizando docker/nginx/prod.conf..."
NGINX_CONF="$PROJECT_ROOT/docker/nginx/prod.conf"

# Substitui o domínio hardcoded (pode estar com ou sem os comentários TODO)
sed_inplace "s|server_name catalyst-skeleton\.com;|server_name ${DOMAIN};|g" "$NGINX_CONF"
sed_inplace "s|/live/catalyst-skeleton\.com/|/live/${DOMAIN}/|g" "$NGINX_CONF"
# Remove comentários TODO do domínio agora que foi configurado
sed_inplace "/# TODO: substitua .catalyst-skeleton\.com/d" "$NGINX_CONF"
sed_inplace "/# TODO: ajuste os caminhos dos certificados/d" "$NGINX_CONF"

ok "docker/nginx/prod.conf atualizado com domínio: $DOMAIN"

# ── 5b. devops/.env.prod.example ──────────────────────────────────────────
info "Atualizando devops/.env.prod.example..."
ENV_EXAMPLE="$SCRIPT_DIR/.env.prod.example"

cat > "$ENV_EXAMPLE" << ENVEOF
# devops/.env.prod.example — Template de variáveis de produção
#
# Na VPS, este arquivo é copiado para .env na raiz do projeto pelo deploy.sh.
# As senhas (APP_SECRET, JWT_PASSPHRASE, DB_PASSWORD, DB_ROOT_PASSWORD)
# são GERADAS AUTOMATICAMENTE pelo deploy.sh — não é necessário preenchê-las.
# NUNCA commite o .env com valores reais — ele está no .gitignore.

# ── Symfony ────────────────────────────────────────────────────────────────
APP_ENV=prod
APP_DEBUG=false
APP_SECRET=__GERADO_PELO_DEPLOY__

# ── Banco de dados ─────────────────────────────────────────────────────────
DB_ROOT_PASSWORD=__GERADO_PELO_DEPLOY__
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=__GERADO_PELO_DEPLOY__
DATABASE_URL="mysql://${DB_USER}:__GERADO_PELO_DEPLOY__@database:3306/${DB_NAME}?serverVersion=8.0.32&charset=utf8mb4"

# ── JWT ────────────────────────────────────────────────────────────────────
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=__GERADO_PELO_DEPLOY__
JWT_TTL=3600

# ── Frontend ───────────────────────────────────────────────────────────────
VITE_API_BASE_URL=https://${DOMAIN}

# Porta exposta pelo backend (normalmente 80 em prod via Nginx)
BACKEND_PORT=${BACKEND_PORT}

# ── Mensageria ─────────────────────────────────────────────────────────────
MESSENGER_TRANSPORT_DSN=doctrine://default?auto_setup=0

# ── Mailer ─────────────────────────────────────────────────────────────────
MAILER_DSN=${MAILER_DSN}

# ── Monitoramento ──────────────────────────────────────────────────────────
SLACK_WEBHOOK_URL=${SLACK_WEBHOOK}

# ── Certbot ────────────────────────────────────────────────────────────────
CERTBOT_EMAIL=${CERTBOT_EMAIL}
CERTBOT_DOMAIN=${DOMAIN}
ENVEOF

ok "devops/.env.prod.example atualizado"

# Aviso para repositórios públicos
if git remote get-url origin 2>/dev/null | grep -qiE "github\.com|gitlab\.com|bitbucket\.org"; then
  REPO_VISIBILITY=$(gh repo view --json isPrivate -q '.isPrivate' 2>/dev/null || echo "unknown")
  if [[ "$REPO_VISIBILITY" == "false" ]]; then
    echo ""
    warn "Repositório público detectado."
    warn "devops/.env.prod.example será commitado com: domínio ($DOMAIN), e-mail certbot ($CERTBOT_EMAIL), nome do banco ($DB_NAME), usuário ($DB_USER)."
    warn "Senhas NÃO são incluídas — o arquivo é seguro para repositórios públicos."
    warn "Se preferir manter esses dados privados, adicione 'devops/.env.prod.example' ao .gitignore."
    echo ""
  fi
fi

# ── 5c. Salvar configuração local ─────────────────────────────────────────
cat > "$PRE_DEPLOY_CONF" << CONFEOF
# Gerado por pre-deploy.sh em $(date)
VPS_HOST=${VPS_HOST}
VPS_USER=${VPS_USER}
VPS_PORT=${VPS_PORT}
VPS_DIR=${VPS_DIR}
DOMAIN=${DOMAIN}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
CERTBOT_EMAIL=${CERTBOT_EMAIL}
CONFEOF

ok ".pre-deploy.conf salvo (não será commitado)"

# Garante que .pre-deploy.conf está no .gitignore
if ! grep -q "\.pre-deploy\.conf" "$PROJECT_ROOT/.gitignore" 2>/dev/null; then
  echo "devops/.pre-deploy.conf" >> "$PROJECT_ROOT/.gitignore"
fi

# ─── Resumo ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}  Configuração aplicada:${RESET}"
echo "   Domínio:       https://$DOMAIN"
echo "   VPS:           ${VPS_USER}@${VPS_HOST}:${VPS_PORT} → $VPS_DIR"
echo "   Banco:         $DB_NAME / $DB_USER"
echo "   Certbot:       $CERTBOT_EMAIL"
echo ""
echo -e "${BOLD}  Próximos passos:${RESET}"
echo ""
echo -e "  ${CYAN}1. Faça commit e push das alterações:${RESET}"
echo "     git add docker/nginx/prod.conf devops/.env.prod.example"
echo "     git commit -m 'chore: configure production environment'"
echo "     git push"
echo ""
echo -e "  ${CYAN}2. Na VPS, clone o repositório (primeira vez):${RESET}"
echo "     ssh ${VPS_USER}@${VPS_HOST} -p ${VPS_PORT}"
echo "     git clone <url-do-repo> ${VPS_DIR} && cd ${VPS_DIR}"
echo ""
echo -e "  ${CYAN}3. Execute o deploy na VPS:${RESET}"
echo "     bash devops/deploy.sh"
echo ""

# ─── Deploy automático via SSH (opcional) ────────────────────────────────────
echo ""
read -rp "  Executar deploy.sh na VPS agora via SSH? [s/N]: " DO_SSH
if [[ "${DO_SSH,,}" =~ ^s$ ]]; then
  echo ""
  warn "Certifique-se de que o repositório já está clonado em ${VPS_DIR} na VPS."
  read -rp "  Confirmar e conectar? [s/N]: " CONFIRM_SSH
  if [[ "${CONFIRM_SSH,,}" =~ ^s$ ]]; then
    info "Conectando em ${VPS_USER}@${VPS_HOST}..."
    ssh -p "${VPS_PORT}" "${VPS_USER}@${VPS_HOST}" \
      "cd '${VPS_DIR}' && git pull origin main && bash devops/deploy.sh"
  fi
fi

echo ""
echo -e "${BOLD}${GREEN}  ✅ Pré-deploy configurado com sucesso!${RESET}"
echo ""
