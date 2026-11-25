#!/usr/bin/env bash
# Verify that the Apple credentials used by the release pipeline can reach the
# notary service and that all required Apple agreements are in effect.
#
# Apple exposes no API for pending agreement status, so `notarytool history` is
# the only reliable signal: it authenticates without submitting an artifact and
# returns the same 403 that a real notarization submission would. Retrying here
# would only hide propagation lag; a failed check is easier to understand and
# re-run once the agreement is actually in effect.
set -euo pipefail

: "${APPLE_ID_USERNAME:?APPLE_ID_USERNAME is required}"
: "${APPLE_ID_PASSWORD:?APPLE_ID_PASSWORD is required}"
: "${APPLE_ID_TEAM_ID:?APPLE_ID_TEAM_ID is required}"

if output=$(xcrun notarytool history \
  --apple-id "${APPLE_ID_USERNAME}" \
  --password "${APPLE_ID_PASSWORD}" \
  --team-id "${APPLE_ID_TEAM_ID}" 2>&1); then
  # The response contains team-wide submission history, not just Gitify's.
  echo "Apple notarization access verified."
  exit 0
fi

printf '%s\n' "${output}"

if grep -q "required agreement is missing or has expired" <<<"${output}"; then
  echo "::error title=Apple agreement missing or expired::Notarization is blocked because a required Apple agreement is missing or expired. The Account Holder (not an Admin) must accept the pending agreement at https://developer.apple.com/account and any pending agreement at https://appstoreconnect.apple.com/business/agreements. If the agreement was just accepted, Apple can take a few minutes to propagate; re-run this check." >&2
  exit 1
fi

echo "::error title=Apple notarization check failed::notarytool could not authenticate. Check that APPLE_ID_PASSWORD is an app-specific password and APPLE_ID_TEAM_ID matches the Developer ID team." >&2
exit 1
