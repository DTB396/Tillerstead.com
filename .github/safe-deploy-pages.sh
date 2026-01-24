#!/bin/bash
# Safe deploy script for GitHub Pages (Jekyll)
# Only pushes to production if build succeeds
set -euo pipefail

BUILD_DIR="_site"
BRANCH="gh-pages"

# Build the site
bundle install
JEKYLL_ENV=production bundle exec jekyll build

# Check build output
if [ ! -d "$BUILD_DIR" ] || [ -z "$(ls -A $BUILD_DIR)" ]; then
  echo "Build failed: $BUILD_DIR is missing or empty. Aborting deploy."
  exit 1
fi

echo "Build succeeded. Deploying to $BRANCH..."
git checkout $BRANCH
rsync -av --delete $BUILD_DIR/ .
git add .
git commit -m "Deploy: safe deploy script $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit."
git push origin $BRANCH

git checkout -
echo "Deploy complete."
