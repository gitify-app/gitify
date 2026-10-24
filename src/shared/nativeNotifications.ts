/**
 * Encode a stable operating-system notification identity from an account and
 * notification ID. The main process treats this value as opaque; the renderer
 * decodes it when routing an action or click back to the cached notification.
 */
export function encodeNativeNotificationIdentity(
  accountUUID: string,
  notificationId: string,
): string {
  return encodeKey(accountUUID, notificationId);
}

/** Encode a group identity from an account and repository/thread key. */
export function encodeNativeNotificationGroupIdentity(
  accountUUID: string,
  groupKey: string,
): string {
  return encodeKey(accountUUID, groupKey);
}

/**
 * Decode an identity produced by {@link encodeNativeNotificationIdentity}.
 * Returns `null` for malformed input rather than throwing.
 */
export function decodeNativeNotificationIdentity(
  id: string,
): { accountUUID: string; notificationId: string } | null {
  const separator = id.indexOf(':');

  if (separator <= 0 || separator === id.length - 1) {
    return null;
  }

  try {
    return {
      accountUUID: decodeURIComponent(id.slice(0, separator)),
      notificationId: decodeURIComponent(id.slice(separator + 1)),
    };
  } catch {
    return null;
  }
}

function encodeKey(first: string, second: string): string {
  return `${encodeURIComponent(first)}:${encodeURIComponent(second)}`;
}
