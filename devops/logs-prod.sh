#!/bin/bash
# devops/logs-prod.sh — Visualizador de logs do ambiente de produção
#
# Uso:
#   bash devops/logs-prod.sh          menu interativo
#   bash devops/logs-prod.sh <opção>  vai direto para a opção (ex: bash devops/logs-prod.sh 3)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE="docker compose -f $PROJECT_ROOT/docker/docker-compose.prod.yaml"
SYMFONY="skeleton_symfony_prod"
DATABASE="skeleton_database_prod"
TAIL="${LOG_TAIL:-100}"          # linhas iniciais (sobrescreva: LOG_TAIL=500 bash devops/logs-prod.sh)
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

_docker_exec_log() {
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
    echo "  Inicie com: bash devops/deploy.sh"
    echo ""
    read -rp "  [Enter para voltar]"
    return 1
  fi
  return 0
}

# ─── Opções de log ────────────────────────────────────────────────────────────

log_todos_containers() {
  _header "Todos os containers — saída do docker compose"
  $COMPOSE logs --tail="$TAIL" $FOLLOW
}

log_symfony_container() {
  _header "Container symfony prod — saída completa do Docker"
  docker logs --tail="$TAIL" $FOLLOW "$SYMFONY"
}

log_database_container() {
  _header "Container database prod (MySQL) — saída completa do Docker"
  docker logs --tail="$TAIL" $FOLLOW "$DATABASE"
}

log_symfony_app() {
  _check_container "$SYMFONY" || return
  _header "Symfony — var/log/prod.log (erros da aplicação)"
  _docker_exec_log "$SYMFONY" "/var/www/html/var/log/prod.log"
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
  if docker exec "$SYMFONY" test -f "/var/log/php_errors.log" 2>/dev/null; then
    _docker_exec_log "$SYMFONY" "/var/log/php_errors.log"
  else
    echo "  ℹ️  /var/log/php_errors.log não encontrado."
    echo "  Em produção erros PHP vão para o Apache error.log (opção 7)."
    read -rp "  [Enter para voltar]"
  fi
}

log_bootstrap() {
  _check_container "$SYMFONY" || return
  _header "Bootstrap — logs de inicialização do container"
  echo ""
  docker logs "$SYMFONY" 2>&1 | grep "\[bootstrap\]" | tail -n "$TAIL"
  read -rp "  [Enter para voltar]"
}

log_opcache() {
  _check_container "$SYMFONY" || return
  _header "OPcache — status atual (via php -r)"
  docker exec -it "$SYMFONY" php -r "
    \$s = opcache_get_status(false);
    if (!\$s) { echo 'OPcache não ativo ou não disponível.\n'; exit; }
    echo 'Enabled:        ' . (\$s[\"opcache_enabled\"] ? 'yes' : 'no') . \"\n\";
    echo 'Memory used:    ' . round(\$s['memory_usage']['used_memory'] / 1024 / 1024, 2) . ' MB' . \"\n\";
    echo 'Memory free:    ' . round(\$s['memory_usage']['free_memory'] / 1024 / 1024, 2) . ' MB' . \"\n\";
    echo 'Hit rate:       ' . round(\$s['opcache_statistics']['opcache_hit_rate'], 2) . '%' . \"\n\";
    echo 'Cached scripts: ' . \$s['opcache_statistics']['num_cached_scripts'] . \"\n\";
    echo 'Cache misses:   ' . \$s['opcache_statistics']['misses'] . \"\n\";
  " 2>/dev/null || echo "  Erro ao consultar OPcache."
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

log_mysql_error() {
  _check_container "$DATABASE" || return
  _header "MySQL — error log"
  # MySQL 8 escreve erros no stderr, capturado pelo Docker
  docker logs --tail="$TAIL" $FOLLOW "$DATABASE"
}

log_deploys() {
  _header "Deploy — histórico de deploys (/var/log/deploys/)"
  if _check_container "$SYMFONY"; then
    if docker exec "$SYMFONY" test -d "/var/log/deploys" 2>/dev/null; then
      echo "  Arquivos de log de deploy:"
      docker exec "$SYMFONY" ls -lht /var/log/deploys/ 2>/dev/null
      echo ""
      read -rp "  Ver qual arquivo? (Enter = mais recente): " logfile
      if [[ -z "$logfile" ]]; then
        logfile=$(docker exec "$SYMFONY" ls -t /var/log/deploys/ 2>/dev/null | head -1)
      fi
      if [[ -n "$logfile" ]]; then
        _docker_exec_log "$SYMFONY" "/var/log/deploys/$logfile"
      fi
    else
      echo "  ℹ️  Nenhum log de deploy encontrado (pasta não existe ainda)."
      echo "  Os logs de deploy são salvos em /var/log/deploys/ na VPS (fora do container)."
      echo ""
      # Tenta ler da VPS diretamente
      DEPLOY_LOG_DIR="/var/log/deploys"
      if [[ -d "$DEPLOY_LOG_DIR" ]]; then
        ls -lht "$DEPLOY_LOG_DIR"
        read -rp "  Ver qual arquivo? (Enter = mais recente): " logfile
        if [[ -z "$logfile" ]]; then
          logfile=$(ls -t "$DEPLOY_LOG_DIR" | head -1)
        fi
        if [[ -n "$logfile" ]]; then
          tail -n "$TAIL" $FOLLOW "$DEPLOY_LOG_DIR/$logfile"
        fi
      else
        read -rp "  [Enter para voltar]"
      fi
    fi
  fi
}

log_healthcheck() {
  _check_container "$SYMFONY" || return
  _header "Healthcheck — status e histórico do container"
  echo ""
  echo "  Status atual:"
  docker inspect --format='  Health: {{.State.Health.Status}}' "$SYMFONY" 2>/dev/null
  echo ""
  echo "  Últimas verificações:"
  docker inspect --format='{{range .State.Health.Log}}  Saída: {{.Output}}  Código: {{.ExitCode}}  Em: {{.Start}}{{"\n"}}{{end}}' "$SYMFONY" 2>/dev/null | tail -20
  read -rp "  [Enter para voltar]"
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
      /var/www/html/var/log/prod.log; do
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
  echo "  ║    📋 Logs — Ambiente de Produção        ║"
  echo "  ╚══════════════════════════════════════════╝"
  echo ""
  echo "  ── Docker ────────────────────────────────"
  echo "   1) Todos os containers (follow)"
  echo "   2) Container symfony prod (Docker logs)"
  echo "   3) Container database prod (Docker logs)"
  echo ""
  echo "  ── Symfony / PHP ─────────────────────────"
  echo "   4) Symfony var/log/prod.log"
  echo "   5) PHP erros (php_errors.log)"
  echo "   6) Bootstrap.sh (logs de inicialização)"
  echo "   7) OPcache — status e hit rate"
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
  echo "  18) MySQL error log"
  echo ""
  echo "  ── Deploys / Infra ───────────────────────"
  echo "  19) Histórico de deploys"
  echo "  20) Healthcheck — status e histórico"
  echo ""
  echo "  ── Tudo ──────────────────────────────────"
  echo "  21) Dump de todos os arquivos de log"
  echo ""
  echo "   0) Sair"
  echo ""
}

run_option() {
  case "$1" in
    1)  log_todos_containers ;;
    2)  log_symfony_container ;;
    3)  log_database_container ;;
    4)  log_symfony_app ;;
    5)  log_php_errors ;;
    6)  log_bootstrap ;;
    7)  log_opcache ;;
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
    18) log_mysql_error ;;
    19) log_deploys ;;
    20) log_healthcheck ;;
    21) log_tudo_arquivos ;;
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
