#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Use Docker Compose symfony service to ensure correct PHP version (>=8.4)
COMPOSE_BIN=${COMPOSE:-"docker compose"}
COMPOSE_FILE=${COMPOSE_FILE:-"docker-compose.yaml"}
COMPOSE_ENV_FILE=${COMPOSE_ENV_FILE:-"ports.env"}
COMPOSE_CMD=( $COMPOSE_BIN --env-file "$COMPOSE_ENV_FILE" -f "$COMPOSE_FILE" )

STANDARD_FILE_HOST="$ROOT_DIR/phpcs.xml"
STANDARD_FILE_CONT="/var/www/html/phpcs.xml"

declare -a TARGETS
if [[ $# -gt 0 ]]; then
  TARGETS=("$@")
else
  TARGETS=("src" "tests")
fi

if ! ${COMPOSE_CMD[@]} ps symfony >/dev/null 2>&1; then
  echo "Docker Compose not ready or service 'symfony' undefined. Trying to run anyway..." >&2
fi

set +e
echo "[phpcbf] Container debug:" >&2
${COMPOSE_CMD[@]} exec -T -w /var/www/html symfony sh -lc 'pwd; php -v; ls -l vendor/bin/phpcbf || true'
echo "[phpcbf] Verifying target paths exist in container:" >&2
for t in "${TARGETS[@]}"; do
  ${COMPOSE_CMD[@]} exec -T -w /var/www/html symfony sh -lc "ls -l \"$t\" || ls -l \"/var/www/html/$t\" || echo 'missing: $t' >&2"
done

# Important: use project-relative paths in the file list.
# Absolute paths like /var/www/html/... conflict with ruleset exclude-patterns
# (e.g., "var/") because they match the leading "/var/".
${COMPOSE_CMD[@]} exec -T -w /var/www/html symfony sh -lc 'printf "%s\n" "$@" > /tmp/phpcbf-files.txt && echo "[phpcbf] File list:" && cat /tmp/phpcbf-files.txt && php vendor/bin/phpcbf -p -s -vv --extensions=php --standard=/var/www/html/phpcs.xml --file-list=/tmp/phpcbf-files.txt' sh "${TARGETS[@]}"
status=$?

if [[ $status -ne 0 ]]; then
  echo "phpcbf returned status $status. Trying fallback if php-cs-fixer is available..." >&2
  ${COMPOSE_CMD[@]} exec -T -w /var/www/html symfony sh -lc '[ -x vendor/bin/php-cs-fixer ] && php vendor/bin/php-cs-fixer fix --path-mode=override "$@" || echo "php-cs-fixer not installed; skipping fallback"' sh "${TARGETS[@]}"
  status=$?
fi
set -e

if [[ $status -ne 0 ]]; then
  echo "Failed running fixers inside container. Ensure the stack is up: 'make up-d'" >&2
  exit $status
fi
