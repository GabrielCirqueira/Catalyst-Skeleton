#!/usr/bin/env bash

set -euo pipefail
export LC_ALL=C

YELLOW='\033[0;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENGINE="$ROOT_DIR/scripts/gerar-paleta-brand.mjs"
OUT="$ROOT_DIR/web/config/theme/theme.ts"
WEB="$ROOT_DIR/web"
STEPS='auto 50 100 200 300 400 500 600 700 800 900 950'
DEFAULT_NAME='skeleton'

if ! command -v node >/dev/null 2>&1; then
  echo -e "${RED}Node.js não encontrado.${NC}"
  exit 1
fi

HEX="${1:-}"
ANCHOR="${2:-}"
NAME="${3:-}"

PREV_NAME=''
if [[ -f "$OUT" ]]; then
  PREV_NAME="$(sed -n "s/^export const PALETTE_NAME = '\\([^']*\\)' as const/\\1/p" "$OUT" | head -n 1 || true)"
fi

if [[ -z "$HEX" ]]; then
  echo -e "${YELLOW}Qual o hex da cor brand? (ex: #8b5cf6)${NC}"
  read -r -p '> ' HEX
fi

if [[ -z "$HEX" ]]; then
  echo -e "${RED}O hex não pode ser vazio.${NC}"
  exit 1
fi

if [[ -z "$ANCHOR" ]]; then
  echo -e "${YELLOW}Degrau âncora? [${STEPS}] (Enter = auto)${NC}"
  read -r -p '> ' ANCHOR
  ANCHOR="${ANCHOR:-auto}"
fi

if [[ -z "$NAME" ]]; then
  HINT="${PREV_NAME:-$DEFAULT_NAME}"
  echo -e "${YELLOW}Nome da paleta? (Enter = ${HINT})${NC}"
  read -r -p '> ' NAME
  NAME="${NAME:-$HINT}"
fi

echo -e "\n${GREEN}Gerando paleta \"${NAME}\" a partir de ${HEX} (âncora: ${ANCHOR})…${NC}\n"

CMD=(node "$ENGINE" --hex "$HEX" --anchor "$ANCHOR" --name "$NAME" --out "$OUT" --web "$WEB")
if [[ -n "$PREV_NAME" ]]; then
  CMD+=(--prev-name "$PREV_NAME")
fi

"${CMD[@]}"

echo -e "\n${GREEN}Gravado em ${OUT}${NC}"
