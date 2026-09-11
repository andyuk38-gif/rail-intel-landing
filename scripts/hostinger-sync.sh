#!/usr/bin/env bash
# Run ON THE HOSTINGER SERVER inside the Git project directory (not on your laptop).
# Resets the server checkout to match GitHub main exactly.
set -euo pipefail

BRANCH="${1:-main}"

echo "Fetching origin/${BRANCH}..."
git fetch origin

echo "Resetting to origin/${BRANCH}..."
git reset --hard "origin/${BRANCH}"

echo "Removing untracked files..."
git clean -fd

echo "Server now matches origin/${BRANCH} at $(git rev-parse --short HEAD)"
echo "Trigger Deploy again from hPanel → Advanced → Git, or wait for auto-deploy."
