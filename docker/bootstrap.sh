#!/bin/bash
set -euo pipefail

log() { echo "[bootstrap] $(date '+%H:%M:%S') $*"; }

log "Starting container bootstrap sequence."

# ── Validação de variáveis críticas em prod ───────────────────────────────────
if [[ "${APP_ENV:-dev}" == "prod" ]]; then
  if [[ "${APP_SECRET:-}" == "change_me_in_production_use_32_char_random_string" ]] || [[ -z "${APP_SECRET:-}" ]]; then
    log "FATAL: APP_SECRET não foi configurado. Edite o .env antes de subir em produção."
    exit 1
  fi
fi

# ── 1. Permissões de var/ ────────────────────────────────────────────────────
if [[ -d /var/www/html/var ]]; then
  mkdir -p /var/www/html/var/cache /var/www/html/var/log
  if [[ $(id -u) -eq 0 ]]; then
    chown -R www-data:www-data /var/www/html/var
    log "Ensured cache/log directories exist with proper ownership."
  else
    log "Running unprivileged; skipped chown of var/."
  fi
fi

# ── 2. Chaves JWT ────────────────────────────────────────────────────────────
JWT_PRIVATE=/var/www/html/config/jwt/private.pem
JWT_PUBLIC=/var/www/html/config/jwt/public.pem

if [[ ! -f "$JWT_PRIVATE" ]] || [[ ! -f "$JWT_PUBLIC" ]]; then
  log "JWT keys not found — generating..."
  mkdir -p /var/www/html/config/jwt
  php /var/www/html/bin/console lexik:jwt:generate-keypair --skip-if-exists --no-interaction \
    || { log "FATAL: JWT keypair generation failed."; exit 1; }
  log "JWT keys generated."
else
  log "JWT keys already present."
fi

# ── 3. Migrations ────────────────────────────────────────────────────────────
# NOTA: doctrine:migrations:diff NÃO é executado aqui propositalmente.
# Gerar migrations automaticamente em runtime é arriscado — pode apagar colunas
# ou tabelas se houver divergência no mapeamento de entidades.
# O diff deve ser feito manualmente em desenvolvimento: php bin/console doctrine:migrations:diff
if [[ -f /var/www/html/bin/console ]]; then
  log "Running database migrations..."
  php /var/www/html/bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration \
    || { log "FATAL: Migrations failed."; exit 1; }
  log "Migrations complete."
fi

# ── 4. Cache warmup (prod) ───────────────────────────────────────────────────
if [[ -f /var/www/html/bin/console ]]; then
  if [[ "${APP_ENV:-dev}" == "prod" ]]; then
    log "Warming up Symfony cache (prod)."
    php /var/www/html/bin/console cache:warmup \
      || { log "FATAL: Cache warmup failed."; exit 1; }
    log "Cache warmup complete."
  else
    log "Skipping cache warmup for APP_ENV=${APP_ENV:-dev}."
  fi
fi

log "Bootstrap sequence finished."
