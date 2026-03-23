/**
 * Returns a cryptographically random element from the given array.
 * Uses crypto.getRandomValues instead of Math.random to satisfy
 * secure-coding requirements.
 */
export function randomElement<T>(array: T[]): T {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return array[buf[0] % array.length];
}
