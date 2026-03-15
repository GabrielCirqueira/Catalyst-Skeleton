#!/bin/bash
# devops/logs-dev.sh — Visualizador de logs do ambiente de desenvolvimento
#
# Uso:
#   bash devops/logs-dev.sh          menu interativo
#   bash devops/logs-dev.sh <opção>  vai direto para a opção (ex: bash devops/logs-dev.sh 3)

SYMFONY="skeleton_symfony"
DATABASE="skeleton_database"
VITE="skeleton_vite_react"
TAIL="${LOG_TAIL:-100}"          # linhas iniciais (sobrescreva: LOG_TAIL=500 bash devops/logs-dev.sh)
FOLLOW="-f"                      # todas as opções seguem em tempo real por padrão

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

_docker_exec_log() {
  # $1 = container  $2 = caminho do arquivo de log
  local container="$1"
  local path="$2"
  if docker exec "$container" test -f "$path" 2>/dev/null; then
    docker exec -it "$container" tail -n "$TAIL" $FOLLOW "$path"
  else
    echo "  ⚠️  Arquivo não encontrado: $path"
    echo "  Verifique se o container está rodando: docker ps"
    read -rp "  [Enter para voltar]"
  fi
}

_check_container() {
  local name="$1"
  if ! docker ps --format '{{.Names}}' | grep -q "^${name}$"; then
    echo ""
    echo "  ⚠️  Container '$name' não está rodando."
    echo "  Inicie com: docker compose up -d"
    echo ""
    read -rp "  [Enter para voltar]"
    return 1
  fi
  return 0
}

# ─── Opções de log ────────────────────────────────────────────────────────────

log_todos_containers() {
  _header "Todos os containers (symfony + database + vite)"
  docker compose logs --tail="$TAIL" $FOLLOW
}

log_symfony_container() {
  _header "Container symfony — saída completa do Docker"
  docker logs --tail="$TAIL" $FOLLOW "$SYMFONY"
}

log_database_container() {
  _header "Container database (MySQL) — saída completa do Docker"
  docker logs --tail="$TAIL" $FOLLOW "$DATABASE"
}

log_vite_container() {
  _header "Container vite-react — saída completa do Docker"
  docker logs --tail="$TAIL" $FOLLOW "$VITE"
}

log_symfony_app() {
  _check_container "$SYMFONY" || return
  _header "Symfony — var/log/dev.log (erros da aplicação)"
  _docker_exec_log "$SYMFONY" "/var/www/html/var/log/dev.log"
}

log_apache_access() {
  _check_container "$SYMFONY" || return
  _header "Apache — access.log (todas as requisições HTTP)"
  _docker_exec_log "$SYMFONY" "/var/log/apache2/access.log"
}

log_apache_error() {
  _check_container "$SYMFONY" || return
  _header "Apache — error.log (erros do servidor web)"
  _docker_exec_log "$SYMFONY" "/var/log/apache2/error.log"
}

log_supervisor() {
  _check_container "$SYMFONY" || return
  _header "Supervisord — log principal (status dos processos)"
  _docker_exec_log "$SYMFONY" "/var/log/supervisord.log"
}

log_supervisor_apache_stdout() {
  _check_container "$SYMFONY" || return
  _header "Supervisor → Apache stdout"
  _docker_exec_log "$SYMFONY" "/var/log/supervisor/apache2-stdout.log"
}

log_supervisor_apache_stderr() {
  _check_container "$SYMFONY" || return
  _header "Supervisor → Apache stderr"
  _docker_exec_log "$SYMFONY" "/var/log/supervisor/apache2-stderr.log"
}

log_supervisor_cron_stdout() {
  _check_container "$SYMFONY" || return
  _header "Supervisor → Cron stdout"
  _docker_exec_log "$SYMFONY" "/var/log/supervisor/cron-stdout.log"
}

log_supervisor_cron_stderr() {
  _check_container "$SYMFONY" || return
  _header "Supervisor → Cron stderr"
  _docker_exec_log "$SYMFONY" "/var/log/supervisor/cron-stderr.log"
}

log_cron() {
  _check_container "$SYMFONY" || return
  _header "Cron — jobs executados (/var/log/cron/)"
  if docker exec "$SYMFONY" test -d "/var/log/cron" 2>/dev/null; then
    docker exec -it "$SYMFONY" sh -c "ls -lh /var/log/cron/ && echo '' && tail -n $TAIL $FOLLOW /var/log/cron/*.log 2>/dev/null || echo '  (sem arquivos de log ainda)'"
  else
    echo "  ⚠️  Diretório /var/log/cron não encontrado."
    read -rp "  [Enter para voltar]"
  fi
}

log_php_errors() {
  _check_container "$SYMFONY" || return
  _header "PHP — erros (php_errors.log)"
  # PHP em modo CLI/Apache normalmente redireciona para o Apache error.log ou stderr
  if docker exec "$SYMFONY" test -f "/var/log/php_errors.log" 2>/dev/null; then
    _docker_exec_log "$SYMFONY" "/var/log/php_errors.log"
  else
    echo "  ℹ️  /var/log/php_errors.log não encontrado."
    echo "  Erros PHP costumam ir para o Apache error.log (opção 7) em dev."
    read -rp "  [Enter para voltar]"
  fi
}

log_bootstrap() {
  _check_container "$SYMFONY" || return
  _header "Bootstrap — últimas execuções (logs do bootstrap.sh)"
  echo "  ℹ️  O bootstrap.sh roda no início do container e aparece nos logs do Docker."
  echo ""
  docker logs "$SYMFONY" 2>&1 | grep "\[bootstrap\]" | tail -n "$TAIL"
  read -rp "  [Enter para voltar]"
}

log_mysql_slow() {
  _check_container "$DATABASE" || return
  _header "MySQL — slow query log"
  _docker_exec_log "$DATABASE" "/var/lib/mysql/slow.log"
}

log_mysql_general() {
  _check_container "$DATABASE" || return
  _header "MySQL — general query log (todas as queries)"
  echo "  ⚠️  O general log pode ser muito volumoso. Ativado só se configurado."
  _docker_exec_log "$DATABASE" "/var/lib/mysql/general.log"
}

log_tudo_arquivos() {
  _check_container "$SYMFONY" || return
  _header "Dump completo — todos os arquivos de log do container symfony"
  echo ""
  docker exec "$SYMFONY" sh -c "
    for f in \
      /var/log/apache2/access.log \
      /var/log/apache2/error.log \
      /var/log/supervisord.log \
      /var/log/supervisor/apache2-stdout.log \
      /var/log/supervisor/apache2-stderr.log \
      /var/log/supervisor/cron-stdout.log \
      /var/log/supervisor/cron-stderr.log \
      /var/www/html/var/log/dev.log; do
      if [ -f \"\$f\" ]; then
        echo ''; echo '════ '\$f' ════'; echo ''
        tail -n 50 \"\$f\"
      fi
    done
  "
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
  echo "   2) Container symfony (Docker logs)"
  echo "   3) Container database / MySQL (Docker logs)"
  echo "   4) Container vite-react (Docker logs)"
  echo ""
  echo "  ── Symfony / PHP ─────────────────────────"
  echo "   5) Symfony var/log/dev.log"
  echo "   6) PHP erros (php_errors.log)"
  echo "   7) Bootstrap.sh (logs de inicialização)"
  echo ""
  echo "  ── Apache ────────────────────────────────"
  echo "   8) Apache access.log"
  echo "   9) Apache error.log"
  echo ""
  echo "  ── Supervisor ────────────────────────────"
  echo "  10) Supervisord log principal"
  echo "  11) Supervisor → Apache stdout"
  echo "  12) Supervisor → Apache stderr"
  echo "  13) Supervisor → Cron stdout"
  echo "  14) Supervisor → Cron stderr"
  echo ""
  echo "  ── Cron ──────────────────────────────────"
  echo "  15) Cron jobs (/var/log/cron/)"
  echo ""
  echo "  ── MySQL ─────────────────────────────────"
  echo "  16) MySQL slow query log"
  echo "  17) MySQL general query log"
  echo ""
  echo "  ── Tudo ──────────────────────────────────"
  echo "  18) Dump de todos os arquivos de log"
  echo ""
  echo "   0) Sair"
  echo ""
}

run_option() {
  case "$1" in
    1)  log_todos_containers ;;
    2)  log_symfony_container ;;
    3)  log_database_container ;;
    4)  log_vite_container ;;
    5)  log_symfony_app ;;
    6)  log_php_errors ;;
    7)  log_bootstrap ;;
    8)  log_apache_access ;;
    9)  log_apache_error ;;
    10) log_supervisor ;;
    11) log_supervisor_apache_stdout ;;
    12) log_supervisor_apache_stderr ;;
    13) log_supervisor_cron_stdout ;;
    14) log_supervisor_cron_stderr ;;
    15) log_cron ;;
    16) log_mysql_slow ;;
    17) log_mysql_general ;;
    18) log_tudo_arquivos ;;
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
