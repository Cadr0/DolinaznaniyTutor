#!/bin/bash
# Первичная настройка VDS для Docker + автодеплоя
# Запуск на сервере: bash scripts/server-bootstrap.sh
set -euo pipefail

APP_DIR="/opt/dolinaznaniy"
REPO="https://github.com/Cadr0/DolinaznaniyTutor.git"

echo "==> Docker..."
if ! command -v docker &>/dev/null; then
  apt-get update -qq
  apt-get install -y -qq ca-certificates curl git
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
fi

echo "==> Репозиторий..."
mkdir -p "$APP_DIR"
if [ ! -d "$APP_DIR/.git" ]; then
  if [ -z "$(ls -A "$APP_DIR" 2>/dev/null)" ]; then
    git clone "$REPO" "$APP_DIR"
  else
    echo "Каталог $APP_DIR уже содержит файлы — пропуск clone"
  fi
else
  cd "$APP_DIR" && git fetch origin main && git reset --hard origin/main
fi
cd "$APP_DIR"

echo "==> .env..."
if [ ! -f "$APP_DIR/.env" ]; then
  POSTGRES_PW=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)
  AUTH_SEC=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)
  cat > "$APP_DIR/.env" <<EOF
POSTGRES_PASSWORD=${POSTGRES_PW}
AUTH_SECRET=${AUTH_SEC}
NEXT_PUBLIC_APP_URL=http://111.88.118.35
DATABASE_URL=postgresql://dolinaznaniy:${POSTGRES_PW}@db:5432/dolinaznaniy?schema=public
EOF
  echo "Создан $APP_DIR/.env — сохраните пароли!"
  cat "$APP_DIR/.env"
fi

echo "==> Nginx reverse proxy..."
cat > /etc/nginx/sites-available/dolinaznaniy <<'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX
ln -sf /etc/nginx/sites-available/dolinaznaniy /etc/nginx/sites-enabled/dolinaznaniy
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "==> Сборка и запуск..."
cd "$APP_DIR"
docker compose -f docker-compose.prod.yml build app
docker compose -f docker-compose.prod.yml up -d db
sleep 8
docker compose -f docker-compose.prod.yml run --rm migrate || true
docker compose -f docker-compose.prod.yml up -d app

echo ""
echo "============================================"
echo "  Готово: http://111.88.118.35"
echo "  Health: http://111.88.118.35/api/health"
echo "  .env:   $APP_DIR/.env"
echo "============================================"
