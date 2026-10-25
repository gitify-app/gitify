/**
 * Generate a cryptographically random OAuth 2.0 `state` value.
 *
 * `crypto.randomUUID()` is backed by the platform CSPRNG and yields 122 random
 * bits — ample for a per-attempt, single-use value that an attacker cannot
 * guess in order to bind the client to a different account. Using the platform
 * primitive avoids hand-rolled random-value encoding entirely.
 *
 * @returns A random UUID to send as the OAuth `state` parameter.
 */
export function generateOAuthState(): string {
  return crypto.randomUUID();
}
