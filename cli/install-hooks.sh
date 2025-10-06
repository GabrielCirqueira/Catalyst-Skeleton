#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOOKS_DIR="$ROOT_DIR/.git/hooks"
TARGET_HOOK="$HOOKS_DIR/pre-commit"
SCRIPT_RELATIVE_PATH="../../cli/pre-commit.sh"

if [[ ! -d "$HOOKS_DIR" ]]; then
  echo "Git hooks directory not found at $HOOKS_DIR. Is this a Git repository?" >&2
  exit 1
fi

if [[ -L "$TARGET_HOOK" ]]; then
  CURRENT_TARGET="$(readlink "$TARGET_HOOK")"
  if [[ "$CURRENT_TARGET" == "$SCRIPT_RELATIVE_PATH" ]]; then
    echo "pre-commit hook already installed."
    exit 0
  fi
fi

if [[ -e "$TARGET_HOOK" && ! -L "$TARGET_HOOK" ]]; then
  BACKUP_FILE="$TARGET_HOOK.$(date +%s).bak"
  echo "Existing pre-commit hook detected. Backing up to $BACKUP_FILE"
  mv "$TARGET_HOOK" "$BACKUP_FILE"
fi

ln -sf "$SCRIPT_RELATIVE_PATH" "$TARGET_HOOK"
chmod +x "$TARGET_HOOK"

echo "pre-commit hook installed successfully."
