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
VERIFY_RETRIES="${VERIFY_RETRIES:-18}"
VERIFY_DELAY="${VERIFY_DELAY:-5}"

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

cd "$APP_DIR"

if [ ! -f .env ]; then
  echo "ERROR: .env not found in ${APP_DIR}"
  exit 1
fi

if [ -z "${GHCR_TOKEN:-}" ]; then
  echo "ERROR: GHCR_TOKEN is required for production deploy."
  exit 1
fi

bash infra/git-sync.sh

if [ -n "${IMAGE_TAG:-}" ] && [ "${#IMAGE_TAG}" -ge 7 ]; then
  export GIT_COMMIT_FULL="${IMAGE_TAG}"
  export GIT_COMMIT="${IMAGE_TAG:0:7}"
else
  export GIT_COMMIT="$(git rev-parse --short HEAD)"
  export GIT_COMMIT_FULL="$(git rev-parse HEAD)"
fi

export IMAGE_TAG="${IMAGE_TAG:-main}"

DEPLOYED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "==> Deploy target: GIT_COMMIT=${GIT_COMMIT} IMAGE_TAG=${IMAGE_TAG}"

echo "==> Nginx upload limit..."
if command -v nginx >/dev/null 2>&1 && [ -f infra/nginx-repair.sh ]; then
  bash infra/nginx-repair.sh || echo "WARN: nginx upload limit not applied."
fi

echo "==> GHCR login..."
echo "$GHCR_TOKEN" | docker login ghcr.io -u "${GHCR_USER:-cadr0}" --password-stdin

echo "==> DB backup..."
mkdir -p "$BACKUP_DIR"
$COMPOSE up -d db
sleep 3
if ! timeout "$BACKUP_TIMEOUT" $COMPOSE exec -T db pg_dump -U dolinaznaniy dolinaznaniy \
  > "$BACKUP_DIR/pre-${GIT_COMMIT}-$(date +%Y%m%d-%H%M%S).sql"; then
  echo "WARN: DB backup failed, continuing deploy."
fi

echo "==> Pull images (tag: ${IMAGE_TAG})..."
timeout "$PULL_TIMEOUT" $COMPOSE pull app migrate

echo "==> Migrate..."
timeout "$MIGRATE_TIMEOUT" $COMPOSE run --rm migrate

echo "==> Start services..."
$COMPOSE up -d --remove-orphans
sleep 12

mkdir -p .deploy
printf '{"commit":"%s","commitFull":"%s","deployedAt":"%s","branch":"main","imageTag":"%s"}\n' \
  "$GIT_COMMIT" "$GIT_COMMIT_FULL" "$DEPLOYED_AT" "$IMAGE_TAG" > .deploy/deploy-info.json

echo "==> Verify app..."
for i in $(seq 1 "$VERIFY_RETRIES"); do
  HEALTH=$(curl -s --max-time 5 http://127.0.0.1:3000/api/health || true)
  VERSION=$(curl -s --max-time 5 http://127.0.0.1:3000/api/version || true)
  if echo "$HEALTH" | grep -q '"status":"ok"' \
    && { echo "$VERSION" | grep -q "\"commitFull\":\"${GIT_COMMIT_FULL}\"" \
      || echo "$VERSION" | grep -q "\"commit\":\"${GIT_COMMIT}\""; }; then
    echo "Verify OK."
    echo "Deployed ${GIT_COMMIT} at ${DEPLOYED_AT} (image: ${IMAGE_TAG})"
    exit 0
  fi
  echo "Verify attempt ${i}/${VERIFY_RETRIES}: health=${HEALTH:-n/a} version=${VERSION:-n/a}"
  sleep "$VERIFY_DELAY"
done

echo "ERROR: deploy verification failed."
echo "Health: ${HEALTH:-n/a}"
echo "Version: ${VERSION:-n/a}"
exit 1
