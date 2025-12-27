/**
 * Environment detection utilities
 */

// Extend Window interface for Tauri internals check
declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
  }
}

/**
 * Check if running in Tauri environment (vs browser dev mode)
 * Returns true when the app is running inside Tauri with the bridge loaded
 * In tests, this returns true when window.gitify and __TAURI_INTERNALS__ are mocked
 */
export function isTauriEnvironment(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.gitify !== undefined &&
    window.__TAURI_INTERNALS__ !== undefined
  );
}
