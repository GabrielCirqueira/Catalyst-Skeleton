#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v php >/dev/null 2>&1; then
  echo "php executable not found" >&2
  exit 1
fi

VENDOR_BIN="$ROOT_DIR/vendor/bin/phpstan"
TMP_DIR="$ROOT_DIR/var/cache/phpstan-local"
if [[ ! -x "$VENDOR_BIN" ]]; then
  echo "phpstan not installed. Run 'composer install'." >&2
  exit 1
fi

mkdir -p "$TMP_DIR"
chmod 0777 "$TMP_DIR"

"$VENDOR_BIN" analyse --memory-limit=1G --configuration=phpstan.neon "$@"
