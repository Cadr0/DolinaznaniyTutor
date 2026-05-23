#!/bin/bash
set -euo pipefail
cd /opt/dolinaznaniy
DB_URL=$(grep ^DATABASE_URL= .env | cut -d= -f2- | tr -d '"')
docker run --rm --network dolinaznaniy_app \
  -e DATABASE_URL="$DB_URL" \
  -e UPLOADS_DIR=/work/uploads \
  -e IMPORT_TUTOR_EMAIL=catalog@dolinaznaniy.ru \
  -e LEGACY_SQL_PATH=/work/old-bd/dump.sql \
  -e LEGACY_UPLOADS_DIR=/work/old-bd/uploads/tasks \
  -v /opt/dolinaznaniy:/work \
  -v dolinaznaniy_uploads_data:/work/uploads \
  node:22-alpine sh -c 'cd /work && npm install && npx prisma generate && npm run ensure:platform-user && npm run import:legacy-tasks && npm run publish:legacy-topics'
