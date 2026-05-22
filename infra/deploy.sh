#!/bin/bash
# На сервере: bash infra/deploy.sh
# Быстрый деплой: pull готовых образов из GHCR (сборка — в GitHub Actions).
set -euo pipefail

APP_DIR="/opt/dolinaznaniy"
BACKUP_DIR="/opt/dolinaznaniy-backups"
COMPOSE="docker compose -f docker-compose.prod.yml"

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

cd "$APP_DIR"

if [ ! -f .env ]; then
  echo "ERROR: .env not found"
  exit 1
fi

echo "==> Git pull..."
git fetch origin main
git reset --hard origin/main

COMMIT=$(git rev-parse --short HEAD)
COMMIT_FULL=$(git rev-parse HEAD)
export GIT_COMMIT="$COMMIT"
export GIT_COMMIT_FULL="$COMMIT_FULL"
export IMAGE_TAG="${IMAGE_TAG:-main}"

DEPLOYED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

if [ -n "${GHCR_TOKEN:-}" ]; then
  echo "==> GHCR login..."
  echo "$GHCR_TOKEN" | docker login ghcr.io -u "${GHCR_USER:-cadr0}" --password-stdin
fi

echo "==> DB backup..."
mkdir -p "$BACKUP_DIR"
$COMPOSE up -d db
sleep 2
$COMPOSE exec -T db pg_dump -U dolinaznaniy dolinaznaniy \
  > "$BACKUP_DIR/pre-${COMMIT}-$(date +%Y%m%d-%H%M%S).sql" 2>/dev/null || true

echo "==> Pull images (tag: ${IMAGE_TAG})..."
if ! $COMPOSE pull app migrate; then
  echo "==> Pull failed — fallback local build (slow)..."
  $COMPOSE build app migrate
fi

echo "==> Migrate..."
$COMPOSE run --rm migrate

echo "==> Start services..."
$COMPOSE up -d --remove-orphans

mkdir -p .deploy
printf '{"commit":"%s","commitFull":"%s","deployedAt":"%s","branch":"main","imageTag":"%s"}\n' \
  "$COMMIT" "$COMMIT_FULL" "$DEPLOYED_AT" "$IMAGE_TAG" > .deploy/deploy-info.json

docker image prune -f
echo "Deployed ${COMMIT} at ${DEPLOYED_AT} (image: ${IMAGE_TAG})"
