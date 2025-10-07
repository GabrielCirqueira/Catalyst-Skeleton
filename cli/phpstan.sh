#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

VENDOR_BIN="$ROOT_DIR/vendor/bin/phpstan"
PHAR_BIN="$ROOT_DIR/vendor/phpstan/phpstan/phpstan.phar"
DEV_UID=$(id -u)
DEV_GID=$(id -g)

if [[ ! -x "$VENDOR_BIN" && ! -f "$PHAR_BIN" ]]; then
  echo "phpstan not installed. Run 'composer install'." >&2
  exit 1
fi

MIN_VERSION=80400
if command -v php >/dev/null 2>&1; then
  PHPVID=$(php -r 'echo PHP_VERSION_ID;' 2>/dev/null || echo 0)
else
  PHPVID=0
fi

run_in_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "PHPStan requires PHP >= 8.4. Install PHP 8.4 or run inside Docker." >&2
    exit 1
  fi

  if docker compose version >/dev/null 2>&1; then
    COMPOSE=(docker compose)
  elif command -v docker-compose >/dev/null 2>&1; then
    COMPOSE=(docker-compose)
  else
    echo "docker compose not available to execute PHPStan inside a container." >&2
    exit 1
  fi

  local compose_env
  compose_env=(env DEV_UID="$DEV_UID" DEV_GID="$DEV_GID")
  local compose_run
  compose_run=("${COMPOSE[@]}" --env-file ports.env -f docker-compose.yaml run --rm)

  local phpstan_args
  phpstan_args=(analyse --memory-limit=1G --configuration=phpstan.neon)
  if [[ $# -gt 0 ]]; then
    phpstan_args+=("$@")
  fi

  local formatted_args=""
  if [[ ${#phpstan_args[@]} -gt 0 ]]; then
    printf -v formatted_args ' %q' "${phpstan_args[@]}"
    formatted_args="${formatted_args:1}"
  fi

  local command
  command='set -e; php vendor/bin/phpstan '"$formatted_args"

  exec "${compose_env[@]}" "${compose_run[@]}" --user "$DEV_UID:$DEV_GID" --env HOME=/tmp/git-home symfony bash -lc "$command"
}

if (( PHPVID == 0 || PHPVID < MIN_VERSION )); then
  run_in_docker "$@"
fi

export SKIP_COMPOSER_PLATFORM_CHECK=1
export COMPOSER_DISABLE_RUNTIME_PLATFORM_CHECK=1

ANALYSE_ARGS=(analyse --memory-limit=1G --configuration=phpstan.neon)
if [[ $# -gt 0 ]]; then
  ANALYSE_ARGS+=("$@")
fi

if [[ -f "$PHAR_BIN" ]]; then
  php "$PHAR_BIN" "${ANALYSE_ARGS[@]}"
else
  "$VENDOR_BIN" "${ANALYSE_ARGS[@]}"
fi
