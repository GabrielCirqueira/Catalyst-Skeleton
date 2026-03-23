#!/bin/bash
# devops/logs-prod.sh — Visualizador de logs do ambiente de produção
#
# Arquitetura de logs em prod:
#   - Nginx (interno ao container) → stdout do container (via supervisord)
#   - PHP-FPM + Symfony/Monolog   → stderr do container (php://stderr)
#   - Supervisord                 → stdout do container
#   - MySQL                       → stderr do container database
#
# Uso:
#   bash devops/logs-prod.sh          menu interativo
#   bash devops/logs-prod.sh <opção>  vai direto para a opção

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE="docker compose -f $PROJECT_ROOT/docker/docker-compose.prod.yaml"
SYMFONY="skeleton_symfony_prod"
DATABASE="skeleton_database_prod"
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
    echo "  Inicie com: bash devops/deploy.sh"
    echo ""
    read -rp "  [Enter para voltar]"
    return 1
  fi
  return 0
}

# ─── Opções de log ────────────────────────────────────────────────────────────

log_todos_containers() {
  _header "Todos os containers — docker compose logs"
  $COMPOSE logs --tail="$TAIL" $FOLLOW
}

log_symfony_container() {
  _header "Container symfony prod — stdout + stderr (tudo)"
  docker logs --tail="$TAIL" $FOLLOW "$SYMFONY"
}

log_database_container() {
  _header "Container database prod (MySQL)"
  docker logs --tail="$TAIL" $FOLLOW "$DATABASE"
}

log_symfony_app() {
  # Monolog em prod envia para php://stderr → stderr do container
  _check_container "$SYMFONY" || return
  _header "Symfony — erros da aplicação (Monolog → stderr do container)"
  docker logs --tail="$TAIL" $FOLLOW "$SYMFONY" 2>&1 1>/dev/null
}

log_nginx_access() {
  # Nginx interno escreve access log no stdout do container
  _check_container "$SYMFONY" || return
  _header "Nginx — access log (requisições HTTP — stdout do container)"
  docker logs --tail="$TAIL" $FOLLOW "$SYMFONY" 2>/dev/null
}

log_nginx_error() {
  # Erros do Nginx e do PHP-FPM vão para stderr
  _check_container "$SYMFONY" || return
  _header "Nginx + PHP-FPM — erros (stderr do container)"
  docker logs --tail="$TAIL" $FOLLOW "$SYMFONY" 2>&1 1>/dev/null
}

log_supervisor() {
  _check_container "$SYMFONY" || return
  _header "Supervisord — eventos (stdout do container)"
  docker logs --tail="$TAIL" $FOLLOW "$SYMFONY" 2>/dev/null | grep -i "supervisor\|started\|stopped\|spawned\|exited\|process"
}

log_cron() {
  _check_container "$SYMFONY" || return
  _header "Cron / Workers — eventos (stdout + stderr do container)"
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
    echo "  ℹ️  Nenhuma entrada de bootstrap encontrada (container pode ter sido reiniciado)."
    echo "  Use a opção 2 para ver os logs completos do container."
  else
    echo "$output"
  fi
  read -rp "  [Enter para voltar]"
}

log_opcache() {
  _check_container "$SYMFONY" || return
  _header "OPcache — status atual (via php -r)"
  docker exec -it "$SYMFONY" php -r "
    \$s = opcache_get_status(false);
    if (!\$s) { echo 'OPcache nao ativo ou nao disponivel.\n'; exit; }
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
  if docker exec "$DATABASE" test -f "/var/lib/mysql/slow.log" 2>/dev/null; then
    docker exec -it "$DATABASE" tail -n "$TAIL" $FOLLOW "/var/lib/mysql/slow.log"
  else
    echo "  ℹ️  Slow query log não ativado. Para ativar, execute no MySQL:"
    echo "  SET GLOBAL slow_query_log = 'ON';"
    echo "  SET GLOBAL long_query_time = 1;"
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
    echo "  ℹ️  General log não ativado (desabilitado por padrão — muito volumoso)."
    read -rp "  [Enter para voltar]"
  fi
}

log_mysql_error() {
  _check_container "$DATABASE" || return
  _header "MySQL — error log (stderr do container database)"
  docker logs --tail="$TAIL" $FOLLOW "$DATABASE"
}

log_deploys() {
  _header "Deploy — histórico de deploys (/var/log/deploys/)"
  local DEPLOY_LOG_DIR="/var/log/deploys"
  if [[ -d "$DEPLOY_LOG_DIR" ]]; then
    echo "  Arquivos de log:"
    ls -lht "$DEPLOY_LOG_DIR" 2>/dev/null
    echo ""
    read -rp "  Ver qual arquivo? (Enter = mais recente): " logfile
    if [[ -z "$logfile" ]]; then
      logfile=$(ls -t "$DEPLOY_LOG_DIR" 2>/dev/null | head -1)
    fi
    if [[ -n "$logfile" ]]; then
      tail -n "$TAIL" $FOLLOW "$DEPLOY_LOG_DIR/$logfile"
    fi
  else
    echo "  ℹ️  Nenhum log de deploy encontrado em $DEPLOY_LOG_DIR."
    read -rp "  [Enter para voltar]"
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

log_tudo() {
  _check_container "$SYMFONY" || return
  _header "Dump completo — docker logs stdout + stderr"
  echo "  ════ $SYMFONY (stdout — Nginx access log) ════"
  echo ""
  docker logs --tail="$TAIL" "$SYMFONY" 2>/dev/null
  echo ""
  echo "  ════ $SYMFONY (stderr — Symfony/PHP/FPM erros) ════"
  echo ""
  docker logs --tail="$TAIL" "$SYMFONY" 2>&1 1>/dev/null
  echo ""
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
  echo "   2) Container symfony — tudo (stdout+stderr)"
  echo "   3) Container database — MySQL"
  echo ""
  echo "  ── Symfony / PHP ─────────────────────────"
  echo "   4) Symfony — erros da aplicação (Monolog/stderr)"
  echo "   5) Bootstrap — logs de inicialização"
  echo "   6) OPcache — status e hit rate"
  echo ""
  echo "  ── Nginx (interno ao container) ──────────"
  echo "   7) Nginx — access log (requisições HTTP)"
  echo "   8) Nginx + PHP-FPM — erros"
  echo ""
  echo "  ── Supervisor / Workers ──────────────────"
  echo "   9) Supervisord — eventos"
  echo "  10) Cron / Workers — eventos"
  echo ""
  echo "  ── MySQL ─────────────────────────────────"
  echo "  11) MySQL slow query log"
  echo "  12) MySQL general query log"
  echo "  13) MySQL error log"
  echo ""
  echo "  ── Deploys / Infra ───────────────────────"
  echo "  14) Histórico de deploys (/var/log/deploys/)"
  echo "  15) Healthcheck — status e histórico"
  echo ""
  echo "  ── Tudo ──────────────────────────────────"
  echo "  16) Dump completo (stdout + stderr do container)"
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
    5)  log_bootstrap ;;
    6)  log_opcache ;;
    7)  log_nginx_access ;;
    8)  log_nginx_error ;;
    9)  log_supervisor ;;
    10) log_cron ;;
    11) log_mysql_slow ;;
    12) log_mysql_general ;;
    13) log_mysql_error ;;
    14) log_deploys ;;
    15) log_healthcheck ;;
    16) log_tudo ;;
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
