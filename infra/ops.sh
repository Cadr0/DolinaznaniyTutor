#!/bin/bash
# На сервере: bash infra/ops.sh <command>
# status | logs [service] | health | backup | backups | rollback <commit> | db-shell | domain | help
set -euo pipefail

APP_DIR="/opt/dolinaznaniy"
BACKUP_DIR="/opt/dolinaznaniy-backups"
COMPOSE="docker compose -f docker-compose.prod.yml"

cmd="${1:-status}"
shift || true

cd "$APP_DIR"

case "$cmd" in
  status)
    echo "=== Git ==="
    git log -1 --oneline 2>/dev/null || echo "no git"
    [ -f .deploy/deploy-info.json ] && cat .deploy/deploy-info.json
    echo ""
    echo "=== Docker ==="
    $COMPOSE ps
    ;;
  logs)
    service="${1:-app}"
    $COMPOSE logs -f --tail=100 "$service"
    ;;
  health)
    curl -s http://127.0.0.1:3000/api/health | python3 -m json.tool 2>/dev/null || curl -s http://127.0.0.1:3000/api/health
    echo ""
    curl -s http://127.0.0.1:3000/api/version | python3 -m json.tool 2>/dev/null || curl -s http://127.0.0.1:3000/api/version
    ;;
  backup)
    mkdir -p "$BACKUP_DIR"
    file="$BACKUP_DIR/manual-$(date +%Y%m%d-%H%M%S).sql"
    $COMPOSE exec -T db pg_dump -U dolinaznaniy dolinaznaniy > "$file"
    echo "Backup: $file ($(wc -c < "$file") bytes)"
    ;;
  backups)
    ls -lah "$BACKUP_DIR" 2>/dev/null || echo "No backups yet"
    ;;
  rollback)
    target="${1:?Usage: ops.sh rollback <commit>}"
    git fetch origin main
    git checkout "$target"
    export GIT_COMMIT=$(git rev-parse --short HEAD)
    export GIT_COMMIT_FULL=$(git rev-parse HEAD)
    export IMAGE_TAG="$GIT_COMMIT_FULL"
    if [ -n "${GHCR_TOKEN:-}" ]; then
      echo "$GHCR_TOKEN" | docker login ghcr.io -u "${GHCR_USER:-cadr0}" --password-stdin
    fi
    $COMPOSE pull app migrate
    $COMPOSE run --rm migrate
    $COMPOSE up -d --wait --remove-orphans
    mkdir -p .deploy
    printf '{"commit":"%s","commitFull":"%s","deployedAt":"%s","branch":"rollback-local"}\n' \
      "$GIT_COMMIT" "$GIT_COMMIT_FULL" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > .deploy/deploy-info.json
    echo "Rolled back to $GIT_COMMIT"
    ;;
  db-shell)
    $COMPOSE exec db psql -U dolinaznaniy -d dolinaznaniy
    ;;
  domain|setup-domain)
    bash infra/setup-domain.sh
    ;;
  help|-h|--help)
    echo "Usage: infra/ops.sh {status|logs|health|backup|backups|rollback|db-shell|domain}"
    echo ""
    echo "Examples:"
    echo "  bash infra/ops.sh status"
    echo "  bash infra/ops.sh logs app"
    echo "  bash infra/ops.sh rollback <commit>"
    echo "  bash infra/ops.sh domain"
    ;;
  *)
    echo "Usage: infra/ops.sh {status|logs|health|backup|backups|rollback|db-shell|domain}"
    exit 1
    ;;
esac
