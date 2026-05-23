#!/bin/bash
# Sync /opt/dolinaznaniy with GitHub main (works even if .git is missing).
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/dolinaznaniy}"
REPO_URL="${REPO_URL:-https://github.com/Cadr0/DolinaznaniyTutor.git}"
BRANCH="${GIT_BRANCH:-main}"

mkdir -p "$APP_DIR"
cd "$APP_DIR"

if ! command -v git >/dev/null 2>&1; then
  echo "==> Installing git..."
  apt-get update -qq
  apt-get install -y -qq git
fi

if [ ! -d .git ]; then
  echo "==> Initializing git repository in ${APP_DIR} (existing files preserved)"
  git init
fi

git remote set-url origin "$REPO_URL" 2>/dev/null || git remote add origin "$REPO_URL"

echo "==> Fetching origin/${BRANCH}..."
git fetch origin "$BRANCH" --depth 1
git reset --hard "FETCH_HEAD"
git checkout -B "$BRANCH" 2>/dev/null || git branch -M "$BRANCH" 2>/dev/null || true

echo "==> Synced to $(git rev-parse --short HEAD)"
