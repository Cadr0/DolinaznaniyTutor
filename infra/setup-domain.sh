#!/bin/bash
# Настройка домена diary-ai.ru на VDS (после смены A-записи в reg.ru)
# Запуск на сервере: bash infra/setup-domain.sh
set -euo pipefail

DOMAIN="diary-ai.ru"
APP_DIR="/opt/dolinaznaniy"
SERVER_IP="111.88.118.35"

echo "==> Проверка DNS..."
RESOLVED=$(dig +short "$DOMAIN" A | head -1)
if [ "$RESOLVED" != "$SERVER_IP" ]; then
  echo "ОШИБКА: $DOMAIN → $RESOLVED (ожидается $SERVER_IP)"
  echo "Сначала смените A-запись в reg.ru — см. docs/OPS.md"
  exit 1
fi
echo "DNS OK: $DOMAIN → $RESOLVED"

echo "==> Nginx..."
cp "$APP_DIR/infra/nginx/dolinaznaniy.conf" /etc/nginx/sites-available/dolinaznaniy
ln -sf /etc/nginx/sites-available/dolinaznaniy /etc/nginx/sites-enabled/dolinaznaniy
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "==> Certbot..."
if ! command -v certbot &>/dev/null; then
  apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq certbot python3-certbot-nginx
fi
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m marutin8578621@yandex.ru --redirect

echo "==> .env..."
cd "$APP_DIR"
if grep -q '^NEXT_PUBLIC_APP_URL=' .env; then
  sed -i 's|^NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=https://'"$DOMAIN"'|' .env
else
  echo "NEXT_PUBLIC_APP_URL=https://$DOMAIN" >> .env
fi

echo "==> Перезапуск app..."
export GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "domain")
export GIT_COMMIT_FULL=$(git rev-parse HEAD 2>/dev/null || echo "domain")
docker compose -f docker-compose.prod.yml up -d app

echo ""
echo "============================================"
echo "  Готово: https://$DOMAIN"
echo "  https://$DOMAIN/api/health"
echo "============================================"
