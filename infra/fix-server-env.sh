#!/bin/bash
# Создать /opt/dolinaznaniy/.env (один раз на сервере)
set -euo pipefail
cd /opt/dolinaznaniy
POSTGRES_PW=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)
AUTH_SEC=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)
cat > .env <<EOF
POSTGRES_PASSWORD=${POSTGRES_PW}
AUTH_SECRET=${AUTH_SEC}
NEXT_PUBLIC_APP_URL=http://111.88.118.35
DATABASE_URL=postgresql://dolinaznaniy:${POSTGRES_PW}@db:5432/dolinaznaniy?schema=public
EOF
echo "Created .env — save passwords:"
cat .env
