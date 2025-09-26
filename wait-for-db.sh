#!/bin/bash
set -euo pipefail

host="${1:-database}"
require_ready="${2:-false}"
port="${DATABASE_CONTAINER_PORT:-3306}"
retries="${WAIT_FOR_DB_RETRIES:-60}"
sleep_seconds="${WAIT_FOR_DB_SLEEP:-2}"

echo "[wait-for-db] Waiting for ${host}:${port} (max ${retries} attempts)..."

for (( attempt=1; attempt<=retries; attempt++ )); do
  if (echo >"/dev/tcp/${host}/${port}" >/dev/null 2>&1); then
    echo "[wait-for-db] Database reachable on attempt ${attempt}."
    exit 0
  fi

  echo "[wait-for-db] Attempt ${attempt}/${retries} failed; retrying in ${sleep_seconds}s..."
  sleep "${sleep_seconds}"
done

if [[ "${require_ready}" == "true" ]]; then
  echo "[wait-for-db] Exhausted retries waiting for ${host}:${port}." >&2
  exit 1
fi

echo "[wait-for-db] Database still unavailable but continuing as require_ready!=true."
exit 0
