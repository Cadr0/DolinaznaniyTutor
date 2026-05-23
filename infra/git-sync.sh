#!/bin/bash
# Sync /opt/dolinaznaniy with origin/main. Uses GHCR_TOKEN when set (private repo / rate limits).
set -euo pipefail

REPO_URL="https://github.com/Cadr0/DolinaznaniyTutor.git"
BRANCH="${GIT_BRANCH:-main}"

if [ -n "${GHCR_TOKEN:-}" ]; then
  REPO_URL="https://x-access-token:${GHCR_TOKEN}@github.com/Cadr0/DolinaznaniyTutor.git"
fi

if [ ! -d .git ]; then
  git clone --branch "$BRANCH" --depth 1 "$REPO_URL" .
else
  git remote set-url origin "$REPO_URL"
  git fetch origin "$BRANCH" --depth 1
  git reset --hard "origin/$BRANCH"
fi
