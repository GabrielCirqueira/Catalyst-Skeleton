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

  PASSPHRASE="${JWT_PASSPHRASE:-}"
  if [[ -z "$PASSPHRASE" ]]; then
    log "FATAL: JWT_PASSPHRASE não está definido no ambiente."
    exit 1
  fi

  # Gera chave privada RSA 4096 com passphrase via openssl CLI
  openssl genrsa -aes256 -passout "pass:${PASSPHRASE}" -out "$JWT_PRIVATE" 4096 2>&1 \
    || { log "FATAL: openssl genrsa falhou."; exit 1; }

  # Extrai chave pública
  openssl rsa -pubout -passin "pass:${PASSPHRASE}" -in "$JWT_PRIVATE" -out "$JWT_PUBLIC" 2>&1 \
    || { log "FATAL: openssl rsa pubout falhou."; exit 1; }

  chown www-data:www-data /var/www/html/config/jwt/*.pem 2>/dev/null || true
  chmod 600 "$JWT_PRIVATE"
  chmod 644 "$JWT_PUBLIC"
  log "JWT keys generated."
else
  log "JWT keys already present."
fi

# ── Stub .env para o Symfony Runtime ────────────────────────────────────────
# O Symfony Runtime (autoload_runtime.php) tenta carregar .env do disco.
# Como o container recebe variáveis via env_file do Docker Compose (sem arquivo
# físico .env), criamos um stub mínimo para o Runtime não falhar no boot.
# As variáveis reais já estão no ambiente — o stub apenas satisfaz a busca pelo arquivo.
if [[ ! -f /var/www/html/.env ]]; then
  printf 'APP_ENV=%s\nAPP_DEBUG=%s\n' "${APP_ENV:-prod}" "${APP_DEBUG:-0}" \
    > /var/www/html/.env
  log ".env stub criado para Symfony Runtime."
fi

# ── 3. Migrations ────────────────────────────────────────────────────────────
if [[ -f /var/www/html/bin/console ]]; then
  # Aguarda o banco ficar realmente acessível via Doctrine
  log "Waiting for Database to be ready for connections..."
  count=0
  until php /var/www/html/bin/console dbal:run-sql "SELECT 1" >/dev/null 2>&1 || [[ $count -gt 30 ]]; do
    sleep 1
    count=$(( count + 1 ))  # ((count++)) mata o script com set -e quando count=0
  done

  if [[ $count -gt 30 ]]; then
     log "FATAL: Database connection timeout."
     exit 1
  fi

  log "Running database migrations..."
  MIGRATION_OUT=$(php /var/www/html/bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration 2>&1) || {
    log "FATAL: Migrations failed. Output:"
    echo "$MIGRATION_OUT" | while IFS= read -r line; do log "  $line"; done
    exit 1
  }
  log "Migrations complete."
fi

# ── 4. Cache warmup (prod) ───────────────────────────────────────────────────
if [[ -f /var/www/html/bin/console ]]; then
  if [[ "${APP_ENV:-dev}" == "prod" ]]; then
    log "Warming up Symfony cache (prod)."
    WARMUP_OUT=$(su -s /bin/sh www-data -c "php /var/www/html/bin/console cache:warmup" 2>&1) || {
      log "FATAL: Cache warmup failed. Output:"
      echo "$WARMUP_OUT" | while IFS= read -r line; do log "  $line"; done
      exit 1
    }
    chown -R www-data:www-data /var/www/html/var 2>/dev/null || true
    log "Cache warmup complete."
  else
    log "Skipping cache warmup for APP_ENV=${APP_ENV:-dev}."
  fi
fi

log "Bootstrap sequence finished."

# Repassa o controle ao processo principal (CMD do Dockerfile, ex: php-fpm)
exec "$@"
