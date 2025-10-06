#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

VENDOR_BIN="$ROOT_DIR/vendor/bin/phpcs"
STANDARD_FILE="$ROOT_DIR/phpcs.xml"

if [[ ! -x "$VENDOR_BIN" ]]; then
  echo "PHP_CodeSniffer not installed. Run 'composer install'." >&2
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
    echo "PHP_CodeSniffer requires PHP >= 8.4. Install PHP 8.4 or run inside Docker." >&2
    exit 1
  fi

  if docker compose version >/dev/null 2>&1; then
    COMPOSE=(docker compose)
  elif command -v docker-compose >/dev/null 2>&1; then
    COMPOSE=(docker-compose)
  else
    echo "docker compose not available to execute PHP_CodeSniffer inside a container." >&2
    exit 1
  fi

  DEV_UID=$(id -u)
  DEV_GID=$(id -g)

  exec env DEV_UID="$DEV_UID" DEV_GID="$DEV_GID" "${COMPOSE[@]}" --env-file ports.env -f docker-compose.yaml run --rm --user "$DEV_UID:$DEV_GID" --env HOME=/tmp/git-home symfony php vendor/bin/phpcs --standard=/var/www/html/phpcs.xml "$@"
}

if (( PHPVID == 0 || PHPVID < MIN_VERSION )); then
  run_in_docker "$@"
fi

"$VENDOR_BIN" --standard="$STANDARD_FILE" "$@"
