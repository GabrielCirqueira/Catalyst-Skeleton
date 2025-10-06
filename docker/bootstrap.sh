#!/bin/bash
set -euo pipefail

echo "[bootstrap] Starting container bootstrap sequence."

if [[ -d /var/www/html/var ]]; then
  mkdir -p /var/www/html/var/cache /var/www/html/var/log
  if [[ $(id -u) -eq 0 ]]; then
    chown -R www-data:www-data /var/www/html/var
    echo "[bootstrap] Ensured cache/log directories exist with proper ownership."
  else
    echo "[bootstrap] Running unprivileged; skipped chown of var/."
  fi
fi

if [[ -f /var/www/html/bin/console ]]; then
  if [[ "${APP_ENV:-dev}" == "prod" ]]; then
    echo "[bootstrap] Warming up Symfony cache (prod)."
    php /var/www/html/bin/console cache:warmup || echo "[bootstrap] Cache warmup skipped." >&2
  else
    echo "[bootstrap] Skipping cache warmup for APP_ENV=${APP_ENV:-dev}."
  fi
fi

echo "[bootstrap] Bootstrap sequence finished."
