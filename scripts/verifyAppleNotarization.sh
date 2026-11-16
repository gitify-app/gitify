#!/usr/bin/env bash
# Verify that the Apple credentials used by the release pipeline can reach the
# notary service and that all required Apple agreements are in effect.
#
# Apple exposes no API for pending agreement status, so `notarytool history` is
# the only reliable signal: it authenticates without submitting an artifact and
# returns the same 403 that a real notarization submission would.
set -euo pipefail

: "${APPLE_ID_USERNAME:?APPLE_ID_USERNAME is required}"
: "${APPLE_ID_PASSWORD:?APPLE_ID_PASSWORD is required}"
: "${APPLE_ID_TEAM_ID:?APPLE_ID_TEAM_ID is required}"

attempts="${NOTARIZATION_CHECK_ATTEMPTS:-4}"
delay_seconds="${NOTARIZATION_CHECK_DELAY_SECONDS:-60}"

for ((attempt = 1; attempt <= attempts; attempt++)); do
  if output=$(xcrun notarytool history \
    --apple-id "${APPLE_ID_USERNAME}" \
    --password "${APPLE_ID_PASSWORD}" \
    --team-id "${APPLE_ID_TEAM_ID}" 2>&1); then
    printf '%s\n' "${output}"
    echo "Apple notarization access verified."
    exit 0
  fi

  printf '%s\n' "${output}"

  if ! grep -q "required agreement is missing or has expired" <<<"${output}"; then
    echo "::error title=Apple notarization check failed::notarytool could not authenticate. Check that APPLE_ID_PASSWORD is an app-specific password and APPLE_ID_TEAM_ID matches the Developer ID team." >&2
    exit 1
  fi

  if ((attempt < attempts)); then
    echo "Apple agreement is not in effect yet; Apple can take a few minutes to propagate an accepted agreement. Retrying in ${delay_seconds}s..."
    sleep "${delay_seconds}"
  fi
done

echo "::error title=Apple agreement missing or expired::Notarization is blocked because a required Apple agreement is missing or expired. The Account Holder (not an Admin) must accept the pending agreement at https://developer.apple.com/account and any pending agreement at https://appstoreconnect.apple.com/business/agreements." >&2
exit 1
