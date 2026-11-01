/**
 * Identity of the summary notification published for a batch.
 */
export const NATIVE_NOTIFICATION_SUMMARY_ID = 'summary';

/**
 * Build the operating-system notification identity for a notification.
 *
 * Windows caps a toast tag at 64 characters, and account UUIDs plus thread IDs
 * easily exceed that. The identity is therefore a short deterministic hash:
 * the main process treats it as opaque, and the renderer resolves an
 * interaction by hashing its cached notifications and matching.
 *
 * @param accountUUID - The account that owns the notification.
 * @param notificationId - The notification's thread ID.
 * @returns A stable identity of at most 12 characters.
 */
export function getNativeNotificationId(accountUUID: string, notificationId: string): string {
  const key = `${accountUUID}\u0000${notificationId}`;

  return `n${hash(key)}`;
}

/**
 * 53-bit string hash (cyrb53), rendered in base 36. Not cryptographic: it only
 * needs to be stable and collision-resistant across one user's notifications.
 *
 * @param value - The string to hash.
 * @returns The hash as a base-36 string of at most 11 characters.
 */
function hash(value: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;

  for (let i = 0; i < value.length; i++) {
    const code = value.codePointAt(i) ?? 0;
    h1 = Math.imul(h1 ^ code, 2654435761);
    h2 = Math.imul(h2 ^ code, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}
