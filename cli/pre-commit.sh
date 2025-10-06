#!/usr/bin/env bash
set -euo pipefail

# Resolve repository root even when invoked via a symlink from .git/hooks
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

export SKIP_COMPOSER_PLATFORM_CHECK=1
export COMPOSER_DISABLE_RUNTIME_PLATFORM_CHECK=1

if command -v php >/dev/null 2>&1; then
  PHPVID=$(php -r 'echo PHP_VERSION_ID;') || PHPVID=0
  if [[ "$PHPVID" -lt 80400 ]]; then
    printf '\n[pre-commit] Note: PHP %s detected (< 8.4). Using PHPStan PHAR.\n' "$(php -r 'echo PHP_VERSION;')"
    printf '[pre-commit] For full compatibility, run QA inside Docker: '\n
    printf '  docker compose run --rm symfony bash -lc "./cli/pre-commit.sh"\n'
  fi
fi

printf '\n[pre-commit] Running PHPStan...\n'
"$ROOT_DIR/cli/phpstan.sh"

printf '\n[pre-commit] Running PHP_CodeSniffer...\n'
"$ROOT_DIR/cli/phpcs.sh" src tests

printf '\n[pre-commit] Running frontend lint...\n'
"$ROOT_DIR/cli/frontend-lint.sh"

printf '\n[pre-commit] Quality checks passed.\n'
