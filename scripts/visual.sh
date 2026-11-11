#!/usr/bin/env bash
#
# Runs the visual regression suite, or regenerates its baselines with --update.
#
# Screenshots are only comparable against an identical browser build and font
# stack, so the suite always runs inside the pinned Playwright image rather than
# on the host. This script puts it there; when it is already inside that image
# (CI, or the nested call below) it runs vitest directly.
#
# The image runs in the host's own architecture, never under emulation:
# Chromium segfaults under amd64 emulation on Apple Silicon. CI renders on
# arm64. amd64 renders differ from it only in antialiasing, which the
# comparison's per-pixel threshold absorbs, so baselines from either
# architecture pass on the other.
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
  # Node.js 26, which the image now ships, no longer bundles corepack.
  # shellcheck disable=SC2086 -- word splitting is intended for the optional flags
  exec ./node_modules/.bin/vp test --project 'browser [visual]' --run ${UPDATE} ${FILTER:+-t "${FILTER}"}
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
case "${HOST_ARCH}" in
  arm64 | aarch64) ARCH="arm64" ;;
  x86_64 | amd64) ARCH="amd64" ;;
  *)
    echo "Visual regression tests need an arm64 or amd64 host; this machine is ${HOST_ARCH}." >&2
    echo "Push the branch and let the Visual Regression CI job report the diff instead." >&2
    exit 1
    ;;
esac

# The image's Node.js no longer bundles corepack, so install the pnpm release
# the project pins in `devEngines`.
PNPM_VERSION="$(node -p "require('${REPO_ROOT}/package.json').devEngines.packageManager.version")"

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

# The host's node_modules holds host binaries (esbuild, @tailwindcss/oxide),
# so the container gets its own install in a named volume per architecture. It
# persists between runs, making everything after the first invocation fast.
#
# Under rootful Docker on Linux the container writes to the bind mount as root.
# Creating the mount point here, and on exit giving root-owned files to the
# mount's owner as the container sees it, keeps the checkout writable for later
# host commands. Rootless Docker and Podman map container root to the caller,
# so the mount appears root-owned there and the cleanup does nothing.
mkdir -p "${REPO_ROOT}/node_modules"
docker run --rm "${TTY_FLAGS[@]+"${TTY_FLAGS[@]}"}" \
  --platform "linux/${ARCH}" \
  --volume "${REPO_ROOT}":/gitify \
  --volume "gitify-visual-node-modules-${ARCH}":/gitify/node_modules \
  --volume "gitify-visual-pnpm-store-${ARCH}":/root/.local/share/pnpm/store \
  --workdir /gitify \
  --env HUSKY=0 \
  --env GITIFY_VISUAL_IN_CONTAINER=1 \
  "${IMAGE}" \
  bash -c "
    set -euo pipefail
    owner=\"\$(stat -c %u:%g /gitify)\"
    if [ \"\${owner}\" != 0:0 ]; then
      trap 'find /gitify/src /gitify/.vitest-attachments -user 0 -exec chown \"\${owner}\" {} + 2>/dev/null || true' EXIT
    fi
    npm install --global --silent pnpm@${PNPM_VERSION}
    pnpm install --frozen-lockfile
    scripts/visual.sh ${UPDATE} ${FILTER}
  "

if [ -n "${UPDATE}" ]; then
  echo
  echo "Baselines updated. Review the diff before committing:"
  echo "  git status --short src/renderer"
fi
