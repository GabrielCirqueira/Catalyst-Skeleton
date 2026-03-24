#!/bin/bash
# devops/logs-dev.sh — Visualizador de logs do ambiente de desenvolvimento
#
# Arquitetura de logs em dev:
#   - skeleton_nginx      → container Nginx separado (proxy reverso HTTP)
#   - skeleton_symfony    → PHP-FPM + Supervisord (workers/cron)
#   - skeleton_database   → MySQL
#   - skeleton_vite_react → Vite dev server
#
#   Symfony/Monolog dev   → /var/www/html/var/log/dev.log (arquivo, volume montado)
#   Nginx access/error    → docker logs skeleton_nginx
#   PHP-FPM eventos       → docker logs skeleton_symfony (stderr)
#
# Uso:
#   bash devops/logs-dev.sh          menu interativo
#   bash devops/logs-dev.sh <opção>  vai direto para a opção

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE="docker compose -f $PROJECT_ROOT/docker/docker-compose.yaml"
SYMFONY="skeleton_symfony"
NGINX="skeleton_nginx"
DATABASE="skeleton_database"
VITE="skeleton_vite_react"
TAIL="${LOG_TAIL:-100}"
FOLLOW="-f"

# ─── Helpers ──────────────────────────────────────────────────────────────────

_header() {
  clear
  echo ""
  echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  📋  $1"
  echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Pressione Ctrl+C para voltar ao menu"
  echo ""
}

_check_container() {
  local name="$1"
  if ! docker ps --format '{{.Names}}' | grep -q "^${name}$"; then
    echo ""
    echo "  ⚠️  Container '$name' não está rodando."
    echo "  Inicie com: make dev  (ou: docker compose -f docker/docker-compose.yaml up -d)"
    echo ""
    read -rp "  [Enter para voltar]"
    return 1
  fi
  return 0
}

# ─── Opções de log ────────────────────────────────────────────────────────────

log_todos_containers() {
  _header "Todos os containers (symfony + nginx + database + vite)"
  $COMPOSE logs --tail="$TAIL" $FOLLOW
}

log_symfony_container() {
  _header "Container symfony — stdout + stderr (PHP-FPM + Supervisord)"
  docker logs --tail="$TAIL" $FOLLOW "$SYMFONY"
}

log_nginx_container() {
  _header "Container nginx — access + error logs"
  docker logs --tail="$TAIL" $FOLLOW "$NGINX"
}

log_database_container() {
  _header "Container database (MySQL)"
  docker logs --tail="$TAIL" $FOLLOW "$DATABASE"
}

log_vite_container() {
  _header "Container vite-react — Vite dev server"
  docker logs --tail="$TAIL" $FOLLOW "$VITE"
}

log_symfony_app() {
  # Em dev, Monolog escreve em arquivo (volume montado no host)
  _check_container "$SYMFONY" || return
  _header "Symfony — var/log/dev.log (erros da aplicação)"
  if docker exec "$SYMFONY" test -f "/var/www/html/var/log/dev.log" 2>/dev/null; then
    docker exec -it "$SYMFONY" tail -n "$TAIL" $FOLLOW "/var/www/html/var/log/dev.log"
  else
    echo "  ℹ️  var/log/dev.log ainda não existe (nenhuma requisição feita?)."
    echo "  Faça uma requisição para a API e tente novamente."
    read -rp "  [Enter para voltar]"
  fi
}

log_nginx_access() {
  _check_container "$NGINX" || return
  _header "Nginx — access log (requisições HTTP — stdout do container nginx)"
  docker logs --tail="$TAIL" $FOLLOW "$NGINX" 2>/dev/null
}

log_nginx_error() {
  _check_container "$NGINX" || return
  _header "Nginx — error log (stderr do container nginx)"
  docker logs --tail="$TAIL" $FOLLOW "$NGINX" 2>&1 1>/dev/null
}

log_php_errors() {
  _check_container "$SYMFONY" || return
  _header "PHP-FPM — erros de runtime (stderr do container symfony)"
  docker logs --tail="$TAIL" $FOLLOW "$SYMFONY" 2>&1 1>/dev/null
}

log_supervisor() {
  _check_container "$SYMFONY" || return
  _header "Supervisord — eventos (stdout do container symfony)"
  docker logs --tail="$TAIL" $FOLLOW "$SYMFONY" 2>/dev/null | grep -i "supervisor\|started\|stopped\|spawned\|exited\|process"
}

log_cron() {
  _check_container "$SYMFONY" || return
  _header "Cron / Workers — eventos (docker logs symfony)"
  if ! docker logs --tail="$TAIL" "$SYMFONY" 2>&1 | grep -qi "cron\|worker\|messenger\|consumer"; then
    echo "  ℹ️  Nenhuma entrada de cron/worker encontrada nos últimos $TAIL logs."
    read -rp "  [Enter para voltar]"
  else
    docker logs --tail="$TAIL" $FOLLOW "$SYMFONY" 2>&1 | grep -i "cron\|worker\|messenger\|consumer"
  fi
}

log_bootstrap() {
  _check_container "$SYMFONY" || return
  _header "Bootstrap — logs de inicialização do container"
  echo ""
  local output
  output=$(docker logs "$SYMFONY" 2>&1 | grep "\[bootstrap\]" | tail -n "$TAIL")
  if [[ -z "$output" ]]; then
    echo "  ℹ️  Nenhuma entrada de bootstrap encontrada."
    echo "  Use a opção 2 para ver os logs completos do container."
  else
    echo "$output"
  fi
  read -rp "  [Enter para voltar]"
}

log_mysql_slow() {
  _check_container "$DATABASE" || return
  _header "MySQL — slow query log"
  if docker exec "$DATABASE" test -f "/var/lib/mysql/slow.log" 2>/dev/null; then
    docker exec -it "$DATABASE" tail -n "$TAIL" $FOLLOW "/var/lib/mysql/slow.log"
  else
    echo "  ℹ️  Slow query log não ativado."
    echo "  Para ativar: SET GLOBAL slow_query_log = 'ON';"
    read -rp "  [Enter para voltar]"
  fi
}

log_mysql_general() {
  _check_container "$DATABASE" || return
  _header "MySQL — general query log (todas as queries)"
  if docker exec "$DATABASE" test -f "/var/lib/mysql/general.log" 2>/dev/null; then
    echo "  ⚠️  O general log pode ser muito volumoso."
    docker exec -it "$DATABASE" tail -n "$TAIL" $FOLLOW "/var/lib/mysql/general.log"
  else
    echo "  ℹ️  General log não ativado (desabilitado por padrão)."
    read -rp "  [Enter para voltar]"
  fi
}

log_tudo() {
  _check_container "$SYMFONY" || return
  _header "Dump completo — todos os logs relevantes"

  echo "  ════ $SYMFONY (docker logs — PHP-FPM/Supervisor) ════"
  echo ""
  docker logs --tail="50" "$SYMFONY" 2>&1
  echo ""

  if docker ps --format '{{.Names}}' | grep -q "^${NGINX}$"; then
    echo "  ════ $NGINX (docker logs — Nginx access/error) ════"
    echo ""
    docker logs --tail="50" "$NGINX" 2>&1
    echo ""
  fi

  echo "  ════ Symfony var/log/dev.log ════"
  echo ""
  if docker exec "$SYMFONY" test -f "/var/www/html/var/log/dev.log" 2>/dev/null; then
    docker exec "$SYMFONY" tail -n 50 "/var/www/html/var/log/dev.log"
  else
    echo "  (arquivo não encontrado)"
  fi
  echo ""

  read -rp "  [Enter para voltar]"
}

# ─── Menu ─────────────────────────────────────────────────────────────────────

show_menu() {
  clear
  echo ""
  echo "  ╔══════════════════════════════════════════╗"
  echo "  ║   📋 Logs — Ambiente de Desenvolvimento  ║"
  echo "  ╚══════════════════════════════════════════╝"
  echo ""
  echo "  ── Docker ────────────────────────────────"
  echo "   1) Todos os containers (follow)"
  echo "   2) Container symfony — PHP-FPM + Supervisor"
  echo "   3) Container nginx"
  echo "   4) Container database — MySQL"
  echo "   5) Container vite-react"
  echo ""
  echo "  ── Symfony / PHP ─────────────────────────"
  echo "   6) Symfony — var/log/dev.log (arquivo)"
  echo "   7) PHP-FPM — erros de runtime"
  echo "   8) Bootstrap — logs de inicialização"
  echo ""
  echo "  ── Nginx ─────────────────────────────────"
  echo "   9) Nginx — access log (requisições HTTP)"
  echo "  10) Nginx — error log"
  echo ""
  echo "  ── Supervisor / Workers ──────────────────"
  echo "  11) Supervisord — eventos"
  echo "  12) Cron / Workers — eventos"
  echo ""
  echo "  ── MySQL ─────────────────────────────────"
  echo "  13) MySQL slow query log"
  echo "  14) MySQL general query log"
  echo ""
  echo "  ── Tudo ──────────────────────────────────"
  echo "  15) Dump completo (docker logs + dev.log)"
  echo ""
  echo "   0) Sair"
  echo ""
}

run_option() {
  case "$1" in
    1)  log_todos_containers ;;
    2)  log_symfony_container ;;
    3)  log_nginx_container ;;
    4)  log_database_container ;;
    5)  log_vite_container ;;
    6)  log_symfony_app ;;
    7)  log_php_errors ;;
    8)  log_bootstrap ;;
    9)  log_nginx_access ;;
    10) log_nginx_error ;;
    11) log_supervisor ;;
    12) log_cron ;;
    13) log_mysql_slow ;;
    14) log_mysql_general ;;
    15) log_tudo ;;
    0)  echo ""; echo "  Até logo!"; echo ""; exit 0 ;;
    *)  echo "  Opção inválida: $1"; sleep 1 ;;
  esac
}

# ── Modo direto (argumento passado na linha de comando) ───────────────────────
if [[ -n "${1:-}" ]]; then
  run_option "$1"
  exit 0
fi

# ── Modo interativo ───────────────────────────────────────────────────────────
while true; do
  show_menu
  read -rp "  Opção: " choice
  run_option "$choice"
done
