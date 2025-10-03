#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

printf '\n[pre-commit] Running PHPStan...\n'
"$ROOT_DIR/cli/phpstan.sh"

printf '\n[pre-commit] Running PHP_CodeSniffer...\n'
"$ROOT_DIR/cli/phpcs.sh" src tests

printf '\n[pre-commit] Running frontend lint...\n'
"$ROOT_DIR/cli/frontend-lint.sh"

printf '\n[pre-commit] Quality checks passed.\n'
