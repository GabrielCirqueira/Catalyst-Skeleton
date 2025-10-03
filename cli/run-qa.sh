#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

"$ROOT_DIR/cli/phpstan.sh"
"$ROOT_DIR/cli/phpcs.sh" src tests
"$ROOT_DIR/cli/frontend-lint.sh"
