#!/bin/bash
# Запуск на сервере от root: bash setup-server.sh
set -euo pipefail

DOMAIN="${1:-}"
SITE_ROOT="/var/www/dolinaznaniy"
NGINX_SITE="/etc/nginx/sites-available/dolinaznaniy"

echo "==> Обновление пакетов..."
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -qq

echo "==> Установка nginx и ufw..."
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq nginx ufw

echo "==> Настройка firewall (SSH + HTTP/HTTPS)..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> Каталог сайта..."
mkdir -p "$SITE_ROOT"
chown -R www-data:www-data "$SITE_ROOT"

if [ ! -f "$SITE_ROOT/index.html" ]; then
  cat > "$SITE_ROOT/index.html" <<'HTML'
<!DOCTYPE html>
<html lang="ru"><head><meta charset="UTF-8"><title>Долина знаний</title></head>
<body><h1>Сайт работает</h1><p>Загрузите index.html из папки site/ проекта.</p></body></html>
HTML
fi

echo "==> Конфиг nginx..."
cat > "$NGINX_SITE" <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root $SITE_ROOT;
    index index.html;

    server_name ${DOMAIN:-_} _;

    location / {
        try_files \$uri \$uri/ =404;
    }
}
EOF

ln -sf "$NGINX_SITE" /etc/nginx/sites-enabled/dolinaznaniy
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable nginx
systemctl restart nginx

echo ""
echo "Готово. Откройте в браузере: http://$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"
echo "Файлы сайта: $SITE_ROOT"
