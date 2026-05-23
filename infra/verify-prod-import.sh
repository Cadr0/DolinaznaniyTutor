#!/bin/bash
set -euo pipefail
cd /opt/dolinaznaniy
docker compose -f docker-compose.prod.yml exec -T db psql -U dolinaznaniy -d dolinaznaniy <<'SQL'
SELECT COUNT(*) AS published_topics FROM "TaskTopic" WHERE "isPublished" = true;
SELECT COUNT(*) AS total_tasks FROM "Task";
SELECT title, array_length(tags, 1) AS tag_count FROM "TaskTopic" WHERE "isPublished" = true LIMIT 3;
SQL
echo "Uploads in volume:"
ls /var/lib/docker/volumes/dolinaznaniy_uploads_data/_data/tasks 2>/dev/null | wc -l
