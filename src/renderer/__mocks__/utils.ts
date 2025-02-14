/**
 * Ensure stable snapshots for our randomized emoji use-cases
 */
export function ensureStableEmojis() {
  global.Math.random = vi.fn(() => 0.1);
}
