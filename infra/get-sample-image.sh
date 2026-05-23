#!/bin/bash
set -euo pipefail
cd /opt/dolinaznaniy
docker compose -f docker-compose.prod.yml exec -T db psql -U dolinaznaniy -d dolinaznaniy -t -A -c 'SELECT "imageUrl" FROM "Task" WHERE "imageUrl" IS NOT NULL LIMIT 1;'
