#!/usr/bin/env bash
set -euo pipefail

# Resolve repository root even when invoked via a symlink
resolve_script() {
  local SOURCE="${BASH_SOURCE[0]}"
  while [ -L "$SOURCE" ]; do
    local DIR
    DIR="$(cd -P "$(dirname "$SOURCE")" && pwd)"
    SOURCE="$(readlink "$SOURCE")"
    [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
  done
  echo "$SOURCE"
}

SCRIPT_PATH="$(resolve_script)"
ROOT_DIR="$(cd "$(dirname "$SCRIPT_PATH")/.." && pwd)"
cd "$ROOT_DIR"

"$ROOT_DIR/cli/phpstan.sh"
"$ROOT_DIR/cli/phpcs.sh" src tests
"$ROOT_DIR/cli/frontend-lint.sh"
