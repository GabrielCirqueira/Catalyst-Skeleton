#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

VENDOR_BIN="$ROOT_DIR/vendor/bin/phpstan"
PHAR_BIN="$ROOT_DIR/vendor/phpstan/phpstan/phpstan.phar"
TMP_DIR="$ROOT_DIR/var/cache/phpstan-local"

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

  DEV_UID=$(id -u)
  DEV_GID=$(id -g)

  local compose_env
  compose_env=(env DEV_UID="$DEV_UID" DEV_GID="$DEV_GID")
  local compose_run
  compose_run=("${COMPOSE[@]}" --env-file ports.env -f docker-compose.yaml run --rm)

  if [[ -d "$TMP_DIR" ]]; then
    "${compose_env[@]}" "${compose_run[@]}" --user root:root symfony sh -lc 'rm -rf var/cache/phpstan-local'
  fi

  local escaped_args
  escaped_args=""
  if [[ $# -gt 0 ]]; then
    local segment
    for segment in "$@"; do
      printf -v segment '%q' "$segment"
      if [[ -z "$escaped_args" ]]; then
        escaped_args="$segment"
      else
        escaped_args+=" $segment"
      fi
    done
  fi

  local command
  command='set -e; mkdir -p var/cache/phpstan-local; chmod -R 0777 var/cache/phpstan-local 2>/dev/null || true; php vendor/bin/phpstan analyse --memory-limit=1G --configuration=phpstan.neon'
  if [[ -n "$escaped_args" ]]; then
    command+=" $escaped_args"
  fi

  exec "${compose_env[@]}" "${compose_run[@]}" --user "$DEV_UID:$DEV_GID" --env HOME=/tmp/git-home symfony bash -lc "$command"
}

if (( PHPVID == 0 || PHPVID < MIN_VERSION )); then
  run_in_docker "$@"
fi

mkdir -p "$TMP_DIR"
if [[ -O "$TMP_DIR" ]]; then
  chmod -R 0777 "$TMP_DIR" 2>/dev/null || true
else
  chmod -R 0777 "$TMP_DIR" 2>/dev/null || echo "[phpstan] Unable to adjust permissions for $TMP_DIR (continuing)" >&2
fi

export SKIP_COMPOSER_PLATFORM_CHECK=1
export COMPOSER_DISABLE_RUNTIME_PLATFORM_CHECK=1

if [[ -f "$PHAR_BIN" ]]; then
  php "$PHAR_BIN" analyse --memory-limit=1G --configuration=phpstan.neon "$@"
else
  "$VENDOR_BIN" analyse --memory-limit=1G --configuration=phpstan.neon "$@"
fi
