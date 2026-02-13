#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# ── Parse flags ────────────────────────────────────────────
BUILD_USER=false
BUILD_ADMIN=false

for arg in "$@"; do
  case "$arg" in
    --user)  BUILD_USER=true ;;
    --admin) BUILD_ADMIN=true ;;
    --help|-h)
      echo "Usage: $0 [--user] [--admin]"
      echo ""
      echo "Clean caches and rebuild Docker containers with fresh npm builds."
      echo "If no flags are given, both --user and --admin are rebuilt."
      exit 0
      ;;
    *)
      echo "Unknown option: $arg"
      echo "Usage: $0 [--user] [--admin]"
      exit 1
      ;;
  esac
done

# Default: rebuild both if neither flag is specified
if ! $BUILD_USER && ! $BUILD_ADMIN; then
  BUILD_USER=true
  BUILD_ADMIN=true
fi

# ── Collect targets ────────────────────────────────────────
SERVICES=()
VOLUMES_TO_REMOVE=()

if $BUILD_USER; then
  SERVICES+=(user-app)
  VOLUMES_TO_REMOVE+=(user-plugin-data user_node_modules)
fi

if $BUILD_ADMIN; then
  SERVICES+=(admin-app)
  VOLUMES_TO_REMOVE+=(admin_node_modules)
fi

echo "==> Targets: ${SERVICES[*]}"

# ── Stop running containers ────────────────────────────────
echo "==> Stopping containers..."
docker compose stop "${SERVICES[@]}" 2>/dev/null || true

# ── Remove containers so volumes can be deleted ────────────
echo "==> Removing containers..."
docker compose rm -f "${SERVICES[@]}" 2>/dev/null || true

# ── Remove Docker volumes (stale node_modules, plugins) ───
echo "==> Removing volumes..."
COMPOSE_PROJECT=$(docker compose config --format json 2>/dev/null | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
for vol in "${VOLUMES_TO_REMOVE[@]}"; do
  FULL_VOL="${COMPOSE_PROJECT:+${COMPOSE_PROJECT}_}${vol}"
  if docker volume ls -q | grep -q "^${FULL_VOL}$"; then
    echo "    Removing volume: $FULL_VOL"
    docker volume rm "$FULL_VOL" 2>/dev/null || true
  fi
done

# ── Clean local caches ────────────────────────────────────
echo "==> Cleaning local caches..."
if $BUILD_USER; then
  rm -rf user/vue/dist user/vue/.vite 2>/dev/null || true
  echo "    Cleaned user/vue/dist"
fi
if $BUILD_ADMIN; then
  rm -rf admin/vue/dist admin/vue/.vite 2>/dev/null || true
  echo "    Cleaned admin/vue/dist"
fi

# Always clean core dist so it rebuilds fresh inside Docker
rm -rf core/dist core/.vite 2>/dev/null || true
echo "    Cleaned core/dist"

# ── Rebuild and start ─────────────────────────────────────
echo "==> Building containers (no cache)..."
docker compose build --no-cache "${SERVICES[@]}"

echo "==> Starting containers..."
docker compose up -d "${SERVICES[@]}"

echo "==> Pruning dangling images..."
docker image prune -f 2>/dev/null || true

echo "==> Done. Waiting for containers to be healthy..."
sleep 2
docker compose ps "${SERVICES[@]}"
