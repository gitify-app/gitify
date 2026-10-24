#!/usr/bin/env bash
#
# Sign the development Electron binary so macOS accepts native notifications.
#
# Electron's main-process Notification API uses UNUserNotificationCenter, which
# rejects ad-hoc/linker-signed binaries with UNErrorDomain error 1. A proper
# Developer ID or Apple Development signature is required even for local
# development.
#
# This signs the Electron.app inside the installed `electron` package. Run it
# after `pnpm install` and after changing the Electron version.
#
# Usage:
#   pnpm sign:dev
#   GITIFY_DEV_SIGN_IDENTITY="Apple Development: ..." pnpm sign:dev

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "Skipping dev Electron signing: not macOS."
  exit 0
fi

IDENTITY="${GITIFY_DEV_SIGN_IDENTITY:-}"

if [[ -z "$IDENTITY" ]]; then
  IDENTITY="$(
    security find-identity -v -p codesigning 2>/dev/null |
      sed -n 's/.*"\(Developer ID Application:.*\)"/\1/p' |
      head -1
  )"
fi

if [[ -z "$IDENTITY" ]]; then
  IDENTITY="$(
    security find-identity -v -p codesigning 2>/dev/null |
      sed -n 's/.*"\(Apple Development:.*\)"/\1/p' |
      head -1
  )"
fi

if [[ -z "$IDENTITY" ]]; then
  echo "No macOS code-signing identity found." >&2
  echo "Install a Developer ID or Apple Development certificate, or set" >&2
  echo "GITIFY_DEV_SIGN_IDENTITY to one from 'security find-identity -v -p codesigning'." >&2
  exit 1
fi

ELECTRON_BIN="$(node -p "require('electron')")"
ELECTRON_APP="${ELECTRON_BIN%/Contents/MacOS/Electron}"

if [[ ! -d "$ELECTRON_APP" ]]; then
  echo "Could not locate the installed Electron.app at: $ELECTRON_APP" >&2
  exit 1
fi

PLIST="$ELECTRON_APP/Contents/Info.plist"

# Electron's notification action support requires the alert notification style.
# The stock development Electron bundle does not declare it.
if /usr/libexec/PlistBuddy -c 'Print :NSUserNotificationAlertStyle' "$PLIST" >/dev/null 2>&1; then
  /usr/libexec/PlistBuddy -c 'Set :NSUserNotificationAlertStyle alert' "$PLIST"
else
  /usr/libexec/PlistBuddy -c 'Add :NSUserNotificationAlertStyle string alert' "$PLIST"
fi

echo "Signing $ELECTRON_APP"
echo "Identity: $IDENTITY"

codesign \
  --force \
  --deep \
  --options runtime \
  --entitlements "$REPO_ROOT/assets/entitlements.mac.plist" \
  --sign "$IDENTITY" \
  "$ELECTRON_APP"

codesign --verify --deep --strict "$ELECTRON_APP"

echo "Signed development Electron binary. Restart pnpm dev to pick up the new signature."
codesign -dv --verbose=2 "$ELECTRON_APP" 2>&1 | grep -E 'Identifier=|Authority=|TeamIdentifier='
