/**
 * Environment detection utilities
 *
 * Note: This is primarily used by tests for mocking purposes.
 * The production app always runs in Tauri - browser fallbacks have been removed.
 */

// Extend Window interface for Tauri internals check
declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
  }
}

/**
 * Check if running in Tauri environment
 *
 * In production, this always returns true.
 * Tests mock this function to control HTTP client behavior.
 */
export function isTauriEnvironment(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.gitify !== undefined &&
    window.__TAURI_INTERNALS__ !== undefined
  );
}
