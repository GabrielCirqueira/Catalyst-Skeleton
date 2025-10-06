#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm executable not found" >&2
  exit 1
fi

ESLINT_CMD=(npx eslint)
ESLINT_CMD+=(--ext .ts,.tsx,.js,.jsx)
ESLINT_CMD+=(--fix)

if [[ $# -gt 0 ]]; then
ESLINT_CMD+=("$@")
else
  ESLINT_CMD+=(web)
fi

"${ESLINT_CMD[@]}"
