#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

if ! command -v perl >/dev/null 2>&1; then
  echo "perl não encontrado." >&2
  exit 1
fi

mapfile -t FILES < <(
  find "$ROOT_DIR/src" "$ROOT_DIR/web" "$ROOT_DIR/migrations" "$ROOT_DIR/tests" \
    \( -name "*.php" -o -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
    -not -path "*/vendor/*" \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/var/*" \
    -not -path "*/build/*" \
    -not -path "*/dist/*" \
    | sort
)

changed=0

for FILE in "${FILES[@]}"; do
  ORIG=$(<"$FILE")

  NEW=$(perl -0777 -pe '
    # Linhas inteiras {/* ... */} (JSX, single-line)
    s/[ \t]*\{\/\*.*?\*\/\}[ \t]*\n//gm;
    # Trechos inline {/* ... */}
    s/[ \t]*\{\/\*.*?\*\/\}//g;
    # Linhas inteiras de comentário //
    s/^[ \t]*\/\/[^\n]*\n//gm;
    # Comentário inline // no final (não casa :// de URLs nem ///)
    s/(?<!:)[ \t]+\/\/(?!\/).*$//gm;
    # Colapsa linhas em branco consecutivas em no máximo uma
    s/\n{3,}/\n\n/g;
  ' "$FILE")

  if [[ "$NEW" != "$ORIG" ]]; then
    REL="${FILE#"$ROOT_DIR"/}"
    if $DRY_RUN; then
      echo "[dry-run] $REL"
    else
      printf '%s' "$NEW" > "$FILE"
      echo "  $REL"
    fi
    changed=$((changed + 1))
  fi
done

echo ""
if $DRY_RUN; then
  echo "✓ (dry-run) $changed arquivo(s) seriam alterados."
else
  echo "✓ $changed arquivo(s) alterados."
fi
