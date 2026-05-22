#!/bin/bash
# Первичная настройка VDS: bash infra/server-bootstrap.sh
set -euo pipefail

APP_DIR="/opt/dolinaznaniy"
REPO="https://github.com/Cadr0/DolinaznaniyTutor.git"

echo "==> Docker..."
if ! command -v docker &>/dev/null; then
  apt-get update -qq
  apt-get install -y -qq ca-certificates curl git
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker && systemctl start docker
fi

echo "==> Репозиторий..."
mkdir -p "$APP_DIR"
if [ ! -d "$APP_DIR/.git" ]; then
  [ -z "$(ls -A "$APP_DIR" 2>/dev/null)" ] && git clone "$REPO" "$APP_DIR" || echo "skip clone"
else
  cd "$APP_DIR" && git fetch origin main && git reset --hard origin/main
fi
cd "$APP_DIR"

if [ ! -f .env ]; then
  bash infra/fix-server-env.sh
fi

echo "==> Nginx..."
cp infra/nginx/dolinaznaniy.conf /etc/nginx/sites-available/dolinaznaniy
ln -sf /etc/nginx/sites-available/dolinaznaniy /etc/nginx/sites-enabled/dolinaznaniy
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

export GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "bootstrap")
export GIT_COMMIT_FULL=$(git rev-parse HEAD 2>/dev/null || echo "bootstrap")
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml run --rm migrate || true

echo "Готово: http://111.88.118.35"
