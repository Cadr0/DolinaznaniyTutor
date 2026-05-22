#!/bin/bash
# Вставьте целиком в SSH-сессию на сервере (root@dolinaznaniy)
set -euo pipefail

SITE_ROOT="/var/www/dolinaznaniy"
NGINX_SITE="/etc/nginx/sites-available/dolinaznaniy"

echo "==> Обновление и установка nginx..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq nginx ufw curl

echo "==> Firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> Сайт..."
mkdir -p "$SITE_ROOT"
cat > "$SITE_ROOT/index.html" <<'HTML'
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Долина знаний</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #1e3a5f 0%, #2d6a4f 100%);
      color: #fff;
      padding: 1.5rem;
    }
    main { text-align: center; max-width: 32rem; }
    h1 { font-size: 2rem; margin-bottom: 0.75rem; }
    p { opacity: 0.9; line-height: 1.6; }
    .badge {
      display: inline-block;
      margin-top: 1.5rem;
      padding: 0.35rem 0.85rem;
      border-radius: 999px;
      background: rgba(255,255,255,0.15);
      font-size: 0.85rem;
    }
  </style>
</head>
<body>
  <main>
    <h1>Долина знаний</h1>
    <p>Первый сайт на вашем VDS. Если вы видите эту страницу — nginx работает.</p>
    <span class="badge">Ubuntu 24 · Selectel</span>
  </main>
</body>
</html>
HTML
chown -R www-data:www-data "$SITE_ROOT"

echo "==> Nginx..."
cat > "$NGINX_SITE" <<'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    root /var/www/dolinaznaniy;
    index index.html;
    server_name _;
    location / {
        try_files $uri $uri/ =404;
    }
}
EOF
ln -sf "$NGINX_SITE" /etc/nginx/sites-enabled/dolinaznaniy
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl restart nginx

IP=$(curl -s --max-time 3 ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
echo ""
echo "============================================"
echo "  Готово! Откройте: http://${IP:-111.88.118.35}"
echo "  Файлы сайта: $SITE_ROOT"
echo "============================================"
