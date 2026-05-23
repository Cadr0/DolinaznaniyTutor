#!/bin/bash
# Repair nginx upload limit without breaking certbot site configs.
set -uo pipefail

if ! command -v nginx >/dev/null 2>&1; then
  exit 0
fi

NGINX_SITE="/etc/nginx/sites-available/dolinaznaniy"

if [ -f "$NGINX_SITE" ]; then
  sed -i '/client_max_body_size/d' "$NGINX_SITE"
fi

mkdir -p /etc/nginx/conf.d
printf '%s\n' 'client_max_body_size 10M;' > /etc/nginx/conf.d/upload-limit.conf

if nginx -t; then
  systemctl reload nginx
  echo "Nginx upload limit applied (10M via conf.d)."
else
  echo "WARN: nginx -t failed after upload limit repair."
  exit 1
fi
