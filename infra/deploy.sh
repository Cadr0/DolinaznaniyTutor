#!/bin/bash
# На сервере: bash infra/deploy.sh
# Быстрый деплой: pull готовых образов из GHCR (сборка — в GitHub Actions).
set -euo pipefail

APP_DIR="/opt/dolinaznaniy"
BACKUP_DIR="/opt/dolinaznaniy-backups"
COMPOSE="docker compose -f docker-compose.prod.yml"
PULL_TIMEOUT="${PULL_TIMEOUT:-600}"
MIGRATE_TIMEOUT="${MIGRATE_TIMEOUT:-300}"
BACKUP_TIMEOUT="${BACKUP_TIMEOUT:-120}"
VERIFY_RETRIES="${VERIFY_RETRIES:-12}"
VERIFY_DELAY="${VERIFY_DELAY:-5}"

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

cd "$APP_DIR"

if [ ! -f .env ]; then
  echo "ERROR: .env not found"
  exit 1
fi

if [ -z "${GHCR_TOKEN:-}" ]; then
  echo "ERROR: GHCR_TOKEN is required for production deploy."
  echo "Set GHCR_PAT in GitHub secrets and pass it as GHCR_TOKEN."
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

echo "==> GHCR login..."
echo "$GHCR_TOKEN" | docker login ghcr.io -u "${GHCR_USER:-cadr0}" --password-stdin

echo "==> DB backup..."
mkdir -p "$BACKUP_DIR"
$COMPOSE up -d db
sleep 2
timeout "$BACKUP_TIMEOUT" $COMPOSE exec -T db pg_dump -U dolinaznaniy dolinaznaniy \
  > "$BACKUP_DIR/pre-${COMMIT}-$(date +%Y%m%d-%H%M%S).sql"

echo "==> Pull images (tag: ${IMAGE_TAG})..."
timeout "$PULL_TIMEOUT" $COMPOSE pull app migrate

echo "==> Migrate..."
timeout "$MIGRATE_TIMEOUT" $COMPOSE run --rm migrate

echo "==> Start services..."
$COMPOSE up -d --wait --remove-orphans

mkdir -p .deploy
printf '{"commit":"%s","commitFull":"%s","deployedAt":"%s","branch":"main","imageTag":"%s"}\n' \
  "$COMMIT" "$COMMIT_FULL" "$DEPLOYED_AT" "$IMAGE_TAG" > .deploy/deploy-info.json

echo "==> Verify app..."
for i in $(seq 1 "$VERIFY_RETRIES"); do
  HEALTH=$(curl -s --max-time 5 http://127.0.0.1:3000/api/health || true)
  VERSION=$(curl -s --max-time 5 http://127.0.0.1:3000/api/version || true)
  if echo "$HEALTH" | grep -q '"status":"ok"' && echo "$VERSION" | grep -q "\"commitFull\":\"$COMMIT_FULL\""; then
    echo "Verify OK."
    echo "Deployed ${COMMIT} at ${DEPLOYED_AT} (image: ${IMAGE_TAG})"
    exit 0
  fi
  sleep "$VERIFY_DELAY"
done

echo "ERROR: deploy verification failed."
echo "Health: $HEALTH"
echo "Version: $VERSION"
exit 1
