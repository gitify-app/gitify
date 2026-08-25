#!/usr/bin/env bash
#
# Runs the visual regression suite, or regenerates its baselines with --update.
#
# Screenshots are only comparable against an identical browser build and font
# stack, so the suite always runs inside the pinned Playwright image rather than
# on the host. This script puts it there; when it is already inside that image
# (CI, or the nested call below) it runs vitest directly.
#
# arm64 rather than amd64 because Chromium segfaults under amd64 emulation on
# Apple Silicon, which makes local runs impossible on the machines the
# maintainers actually use. The tradeoff is that running this locally needs an
# arm64 host; CI covers everyone else.
#
# Usage:
#   scripts/visual.sh                     # verify against committed baselines
#   scripts/visual.sh --update            # regenerate every baseline
#   scripts/visual.sh --update settings   # regenerate baselines matching a name

set -euo pipefail

UPDATE=""
if [ "${1:-}" = "--update" ]; then
  UPDATE="--update"
  shift
fi
FILTER="${1:-}"

# Already inside the pinned image (set by the CI job and by the docker run
# below), so run the suite rather than nesting another container.
if [ -n "${GITIFY_VISUAL_IN_CONTAINER:-}" ]; then
  # shellcheck disable=SC2086 -- word splitting is intended for the optional flags
  exec corepack pnpm exec vp test --project 'browser [visual]' --run ${UPDATE} ${FILTER:+-t "${FILTER}"}
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Derived from the `playwright` devDependency rather than pinned here: the image
# ships the browser build that exact release expects, and a mismatched pair
# fails to launch. Renovate bumping the dependency moves the image with it.
PLAYWRIGHT_VERSION="$(node -p "require('${REPO_ROOT}/package.json').devDependencies.playwright")"
IMAGE="mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble"

if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running. Visual regression tests only run inside the pinned Linux image." >&2
  echo "Push the branch and let the Visual Regression CI job report the diff instead." >&2
  exit 1
fi

HOST_ARCH="$(uname -m)"
if [ "${HOST_ARCH}" != "arm64" ] && [ "${HOST_ARCH}" != "aarch64" ]; then
  echo "Visual regression tests need an arm64 host to match CI; this machine is ${HOST_ARCH}." >&2
  echo "Push the branch and let the Visual Regression CI job report the diff instead." >&2
  exit 1
fi

# HUSKY=0 skips the `prepare` hook, which cannot find .git when the repo is a
# worktree (its .git file points outside the mount).
#
# Only allocate a TTY when there is one, so the script also works from a
# non-interactive shell. The `${arr[@]+"${arr[@]}"}` expansion keeps an empty
# array from tripping `set -u` on macOS's bash 3.2.
TTY_FLAGS=()
if [ -t 0 ] && [ -t 1 ]; then
  TTY_FLAGS=(--interactive --tty)
fi

# The host's node_modules holds darwin binaries (esbuild, @tailwindcss/oxide),
# so the container gets its own install in a named volume. It persists between
# runs, making everything after the first invocation fast.
docker run --rm "${TTY_FLAGS[@]+"${TTY_FLAGS[@]}"}" \
  --platform linux/arm64 \
  --volume "${REPO_ROOT}":/gitify \
  --volume gitify-visual-node-modules:/gitify/node_modules \
  --volume gitify-visual-pnpm-store:/root/.local/share/pnpm/store \
  --workdir /gitify \
  --env HUSKY=0 \
  --env GITIFY_VISUAL_IN_CONTAINER=1 \
  "${IMAGE}" \
  bash -c "
    set -euo pipefail
    corepack enable
    corepack pnpm install --frozen-lockfile
    scripts/visual.sh ${UPDATE} ${FILTER}
  "

if [ -n "${UPDATE}" ]; then
  echo
  echo "Baselines updated. Review the diff before committing:"
  echo "  git status --short src/renderer"
fi
