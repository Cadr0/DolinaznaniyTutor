#!/bin/bash
# Repair nginx upload limit without breaking certbot site configs.
set -uo pipefail

if ! command -v nginx >/dev/null 2>&1; then
  exit 0
fi

NGINX_SITE="/etc/nginx/sites-available/dolinaznaniy"

strip_cr() {
  local file="$1"
  if [ -f "$file" ]; then
    sed -i 's/\r$//' "$file"
  fi
}

if [ -f "$NGINX_SITE" ]; then
  cp "$NGINX_SITE" "${NGINX_SITE}.bak.$(date +%s)"
  sed -i '/client_max_body_size/d' "$NGINX_SITE"
  strip_cr "$NGINX_SITE"
fi

mkdir -p /etc/nginx/conf.d /var/lib/nginx/body
strip_cr /etc/nginx/conf.d/upload-limit.conf 2>/dev/null || true
printf '%s\n' 'client_max_body_size 10M;' > /etc/nginx/conf.d/upload-limit.conf

if id www-data >/dev/null 2>&1; then
  chown -R www-data:www-data /var/lib/nginx || true
fi

if nginx -t; then
  systemctl reload nginx
  echo "Nginx upload limit applied (10M via conf.d)."
  exit 0
fi

echo "WARN: nginx -t failed after upload limit repair."
exit 1
