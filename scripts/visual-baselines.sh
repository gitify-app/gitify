#!/usr/bin/env bash
#
# Regenerates the committed visual regression baselines.
#
# Screenshots are only comparable against an identical browser build and font
# stack, so they are always generated inside the pinned Playwright image rather
# than on the host, whatever the host happens to be. The CI job in
# .github/workflows/test.yml runs the same image on arm64 runners.
#
# arm64 rather than amd64 because Chromium segfaults under amd64 emulation on
# Apple Silicon, which makes local regeneration impossible on the machines the
# maintainers actually use. The tradeoff is that regenerating baselines needs an
# arm64 host; verifying them (the common case) needs nothing but CI.
#
# Usage:
#   scripts/visual-baselines.sh            # update every baseline
#   scripts/visual-baselines.sh settings   # update baselines matching a name

set -euo pipefail

# Keep in step with the `playwright` devDependency; the image ships the matching
# browser build, and a mismatched pair renders differently.
PLAYWRIGHT_VERSION="1.62.1"
IMAGE="mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

PACKAGE_VERSION="$(node -p "require('${REPO_ROOT}/package.json').devDependencies.playwright")"
if [ "${PACKAGE_VERSION}" != "${PLAYWRIGHT_VERSION}" ]; then
  echo "playwright is pinned to ${PACKAGE_VERSION} in package.json but this script uses ${PLAYWRIGHT_VERSION}." >&2
  echo "Update PLAYWRIGHT_VERSION in $0 so the image matches the browser build." >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running. Baselines can only be generated inside the pinned Linux image." >&2
  exit 1
fi

HOST_ARCH="$(uname -m)"
if [ "${HOST_ARCH}" != "arm64" ] && [ "${HOST_ARCH}" != "aarch64" ]; then
  echo "Baselines must be generated on an arm64 host to match CI; this machine is ${HOST_ARCH}." >&2
  echo "Push the branch and let the Visual Regression CI job report the diff instead." >&2
  exit 1
fi

# HUSKY=0 skips the `prepare` hook, which cannot find .git when the repo is a
# worktree (its .git file points outside the mount).
#
# Only allocate a TTY when there is one, so the script also works from a
# non-interactive shell.
TTY_FLAGS=()
if [ -t 0 ] && [ -t 1 ]; then
  TTY_FLAGS=(--interactive --tty)
fi

# The host's node_modules holds darwin binaries (esbuild, @tailwindcss/oxide),
# so the container gets its own install in a named volume. It persists between
# runs, making everything after the first invocation fast.
docker run --rm "${TTY_FLAGS[@]}" \
  --platform linux/arm64 \
  --volume "${REPO_ROOT}":/gitify \
  --volume gitify-visual-node-modules:/gitify/node_modules \
  --volume gitify-visual-pnpm-store:/root/.local/share/pnpm/store \
  --workdir /gitify \
  --env HUSKY=0 \
  "${IMAGE}" \
  bash -c "
    set -euo pipefail
    corepack enable
    corepack pnpm install --frozen-lockfile
    corepack pnpm exec vitest --project 'browser [visual]' --run --update ${1:+-t '$1'}
  "

echo
echo "Baselines updated. Review the diff before committing:"
echo "  git status --short src/renderer"
