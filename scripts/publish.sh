#!/bin/sh
# Publish this package to npm (ai-testing-tool-js style).
#
#   npm run release
#   DRY_RUN=true npm run release
set -eu
cd "$(dirname "$0")/.."

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

DRY_RUN="${DRY_RUN:-false}"
name="$(node -p "require('./package.json').name")"
version="$(node -p "require('./package.json').version")"

if npm view "$name@$version" version >/dev/null 2>&1; then
  echo "skip: $name@$version is already published"
  exit 0
fi

if [ "$DRY_RUN" = "true" ]; then
  echo "dry-run: would publish $name@$version"
  npm publish --access public --dry-run
  exit 0
fi

if [ -z "${NPM_TOKEN:-}" ]; then
  echo "ERROR: NPM_TOKEN is not set (add it to .env or the environment)" >&2
  exit 1
fi

npm config set "//registry.npmjs.org/:_authToken=${NPM_TOKEN}"
echo "publish: $name@$version"
npm publish --access public
echo "Done."
