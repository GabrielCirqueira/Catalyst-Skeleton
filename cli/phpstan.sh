#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v php >/dev/null 2>&1; then
  echo "php executable not found" >&2
  exit 1
fi

VENDOR_BIN="$ROOT_DIR/vendor/bin/phpstan"
PHAR_BIN="$ROOT_DIR/vendor/phpstan/phpstan/phpstan.phar"
TMP_DIR="$ROOT_DIR/var/cache/phpstan-local"
if [[ ! -x "$VENDOR_BIN" && ! -f "$PHAR_BIN" ]]; then
  echo "phpstan not installed. Run 'composer install'." >&2
  exit 1
fi

mkdir -p "$TMP_DIR"
chmod 0777 "$TMP_DIR"

# Bypass Composer's runtime platform check if present
export SKIP_COMPOSER_PLATFORM_CHECK=1
export COMPOSER_DISABLE_RUNTIME_PLATFORM_CHECK=1

# Prefer running the PHAR directly to avoid Composer's runtime platform check
if [[ -f "$PHAR_BIN" ]]; then
  php "$PHAR_BIN" analyse --memory-limit=1G --configuration=phpstan.neon "$@"
else
  # Fallback to vendor/bin if PHAR is not present
  "$VENDOR_BIN" analyse --memory-limit=1G --configuration=phpstan.neon "$@"
fi
