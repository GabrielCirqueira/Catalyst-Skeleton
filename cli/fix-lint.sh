#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "🛠️  Running all auto-fixers..."

echo "🐘 Fixing PHP code style (phpcbf)..."
./cli/phpcbf.sh || echo "⚠️  Some PHP issues could not be fixed automatically."

echo "⚛️  Fixing TypeScript/React issues (biome)..."
make fix-tsx

echo "✅ Lint fixing complete!"
