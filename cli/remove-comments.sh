#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

DRY_RUN=false
USE_DIFF=false

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --diff)    USE_DIFF=true ;;
    *) echo "Flag desconhecida: $arg" >&2; exit 1 ;;
  esac
done

if ! command -v perl >/dev/null 2>&1; then
  echo "perl não encontrado." >&2
  exit 1
fi

if $USE_DIFF; then
  if ! git -C "$ROOT_DIR" rev-parse --git-dir >/dev/null 2>&1; then
    echo "Não é um repositório git." >&2
    exit 1
  fi
  echo "Modo: arquivos staged (git diff --cached)"
  mapfile -t FILES < <(
    git -C "$ROOT_DIR" diff --cached --name-only \
      | while read -r f; do
          full="$ROOT_DIR/$f"
          [[ -f "$full" ]] && echo "$full"
        done \
      | sort
  )
else
  echo "Modo: pastas do projeto (src, web, migrations, tests)"
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
fi

changed=0

for FILE in "${FILES[@]}"; do
  ORIG=$(<"$FILE")
  EXT="${FILE##*.}"

  case "$EXT" in
    yaml|yml|env|conf|ini)
      NEW=$(perl -0777 -pe '
        # Preserva shebang (primeira linha #!/...)
        s/\A(#![^\n]*\n)//; my $shebang = $1 // q{};
        # Linhas inteiras de comentário #
        s/^[ \t]*#[^\n]*\n//gm;
        # Comentário inline # precedido de espaço
        s/[ \t]+#[^\n]*$//gm;
        # Colapsa linhas em branco consecutivas em no máximo uma
        s/\n{3,}/\n\n/g;
        $_ = $shebang . $_;
      ' "$FILE")
      ;;
    sh|bash)
      NEW=$(perl -0777 -pe '
        # Preserva shebang (primeira linha #!/...)
        s/\A(#![^\n]*\n)//; my $shebang = $1 // q{};
        # Linhas inteiras de comentário #
        s/^[ \t]*#[^\n]*\n//gm;
        # Comentário inline # precedido de espaço
        s/[ \t]+#[^\n]*$//gm;
        # Colapsa linhas em branco consecutivas em no máximo uma
        s/\n{3,}/\n\n/g;
        $_ = $shebang . $_;
      ' "$FILE")
      ;;
    php|ts|tsx|js|jsx)
      NEW=$(perl -0777 -pe '
        # Linhas inteiras {/* ... */} (JSX, single-line) - Pula se biome-ignore
        s/[ \t]*\{\/\*(?!\s*biome-ignore).*?\*\/\}[ \t]*\n//gm;
        # Trechos inline {/* ... */} - Pula se biome-ignore
        s/[ \t]*\{\/\*(?!\s*biome-ignore).*?\*\/\}//g;
        # Linhas inteiras de comentário // - Pula se biome-ignore
        s/^[ \t]*\/\/(?!\s*biome-ignore)[^\n]*\n//gm;
        # Comentário inline // no final (não casa :// de URLs nem /// nem biome-ignore)
        s/(?<!:)[ \t]+\/\/(?!\/)(?!\s*biome-ignore).*$//gm;
        # Colapsa linhas em branco consecutivas em no máximo uma
        s/\n{3,}/\n\n/g;
      ' "$FILE")
      ;;
    *)
      continue
      ;;
  esac

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
