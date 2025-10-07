#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v git >/dev/null 2>&1; then
  echo "git executable not found" >&2
  exit 1
fi

# Use Docker Compose symfony service to ensure correct PHP version (>=8.4)
COMPOSE_BIN=${COMPOSE:-"docker compose"}
COMPOSE_FILE=${COMPOSE_FILE:-"docker-compose.yaml"}
COMPOSE_ENV_FILE=${COMPOSE_ENV_FILE:-"ports.env"}
COMPOSE_CMD=( $COMPOSE_BIN --env-file "$COMPOSE_ENV_FILE" -f "$COMPOSE_FILE" )

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

declare -a raw_files
while IFS= read -r -d '' file; do
  raw_files+=("$file")
done < <(git diff --name-only -z --diff-filter=ACMRTUXB "${diff_args[@]}" -- '*.php')

# Include untracked PHP files so new files are auto-fixed without requiring git add.
while IFS= read -r -d '' file; do
  raw_files+=("$file")
done < <(git ls-files --others --exclude-standard -z -- '*.php')

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

set +e
echo "[phpcbf] Container debug:" >&2
${COMPOSE_CMD[@]} exec -T -w /var/www/html symfony sh -lc 'pwd; php -v; ls -l vendor/bin/phpcbf || true'
echo "[phpcbf] Verifying target paths exist in container:" >&2
for t in "${targets[@]}"; do
  ${COMPOSE_CMD[@]} exec -T -w /var/www/html symfony sh -lc "ls -l \"$t\" || ls -l \"/var/www/html/$t\" || echo 'missing: $t' >&2"
done

# Important: pass project-relative paths here.
# Absolute paths like /var/www/html/... conflict with the ruleset
# exclude-pattern "var/" (which would then match the leading "/var/")
# and cause PHPCS/PHPCBF to exclude everything under /var/.
${COMPOSE_CMD[@]} exec -T -w /var/www/html symfony sh -lc 'printf "%s\n" "$@" > /tmp/phpcbf-files.txt && echo "[phpcbf] File list:" && cat /tmp/phpcbf-files.txt && php vendor/bin/phpcbf -p -s -vv --extensions=php --standard=/var/www/html/phpcs.xml --file-list=/tmp/phpcbf-files.txt' sh "${targets[@]}"
status=$?

if [[ $status -ne 0 ]]; then
  echo "phpcbf returned status $status. Trying fallback if php-cs-fixer is available..." >&2
  ${COMPOSE_CMD[@]} exec -T -w /var/www/html symfony sh -lc '[ -x vendor/bin/php-cs-fixer ] && php vendor/bin/php-cs-fixer fix --path-mode=override "$@" || echo "php-cs-fixer not installed; skipping fallback"' sh "${targets[@]}"
  status=$?
fi
set -e

if [[ $status -ne 0 ]]; then
  echo "Failed running fixers inside container. Ensure the stack is up: 'make up-d'" >&2
  exit $status
fi
