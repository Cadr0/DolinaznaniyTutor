#!/bin/bash
# Sync repo on VDS (public HTTPS; no token required).
set -euo pipefail

REPO_URL="https://github.com/Cadr0/DolinaznaniyTutor.git"
BRANCH="${GIT_BRANCH:-main}"

git remote set-url origin "$REPO_URL"
git fetch origin "$BRANCH" --depth 1
git reset --hard "origin/$BRANCH"
