#!/bin/sh
set -e

UPLOADS="${UPLOADS_DIR:-/app/uploads}"
mkdir -p "$UPLOADS/tasks"
chown -R nextjs:nodejs "$UPLOADS"

exec su-exec nextjs "$@"
