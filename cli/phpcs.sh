#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

VENDOR_BIN="$ROOT_DIR/vendor/bin/phpcs"
if [[ ! -x "$VENDOR_BIN" ]]; then
  echo "PHP_CodeSniffer not installed. Run 'composer install'." >&2
  exit 1
fi

STANDARD_FILE="$ROOT_DIR/phpcs.xml"

"$VENDOR_BIN" --standard="$STANDARD_FILE" "$@"
