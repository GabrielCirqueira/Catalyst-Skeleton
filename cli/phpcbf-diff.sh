#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v git >/dev/null 2>&1; then
  echo "git executable not found" >&2
  exit 1
fi

VENDOR_BIN="$ROOT_DIR/vendor/bin/phpcbf"
if [[ ! -x "$VENDOR_BIN" ]]; then
  echo "PHP Code Beautifier and Fixer not installed. Run 'composer install'." >&2
  exit 1
fi

declare -a diff_args
if [[ $# -gt 0 ]]; then
  diff_args=("$@")
else
  diff_args=("HEAD")
fi

if [[ ${diff_args[0]} == "--all" ]]; then
  echo "Flag --all detected. Running full fixer (src + tests)."
  "$ROOT_DIR/cli/phpcbf.sh"
  exit 0
fi

readarray -d '' -t raw_files < <(git diff --name-only -z --diff-filter=ACMRTUXB "${diff_args[@]}" -- '*.php')

if [[ ${#raw_files[@]} -eq 0 ]]; then
  echo "No PHP files with changes detected (scope: git diff ${diff_args[*]})."
  exit 0
fi

declare -A seen
declare -a targets
for file in "${raw_files[@]}"; do
  if [[ -n ${seen["$file"]+x} ]]; then
    continue
  fi
  seen["$file"]=1
  targets+=("$file")
done

if [[ ${#targets[@]} -eq 0 ]]; then
  echo "No PHP files to format after deduplication."
  exit 0
fi

echo "Running PHPCBF on ${#targets[@]} file(s):"
for file in "${targets[@]}"; do
  echo "  - $file"
done

"$ROOT_DIR/cli/phpcbf.sh" "${targets[@]}"
