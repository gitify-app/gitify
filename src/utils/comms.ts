import { defaultSettings } from '../context/defaults';
import { type Link, OpenPreference } from '../types';
import { isTauriEnvironment } from './environment';
import { loadState } from './storage';

export function openExternalLink(url: Link): void {
  // Load the state from local storage to avoid having to pass settings as a parameter
  const { settings } = loadState();
  const openPreference = settings
    ? settings.openLinks
    : defaultSettings.openLinks;

  if (url.toLowerCase().startsWith('https://')) {
    if (isTauriEnvironment()) {
      window.gitify.openExternalLink(
        url,
        openPreference === OpenPreference.FOREGROUND,
      );
    } else {
      // Browser fallback - open in new tab
      window.open(url, '_blank');
    }
  }
}

export async function getAppVersion(): Promise<string> {
  if (isTauriEnvironment()) {
    return await window.gitify.app.version();
  }
  return 'dev';
}

export async function encryptValue(value: string): Promise<string> {
  if (isTauriEnvironment()) {
    return await window.gitify.encryptValue(value);
  }
  // Browser fallback - no encryption (dev mode only)
  return value;
}

export async function decryptValue(value: string): Promise<string> {
  if (isTauriEnvironment()) {
    return await window.gitify.decryptValue(value);
  }
  // Browser fallback - no decryption (dev mode only)
  return value;
}

/**
 * Exchange OAuth authorization code for access token using user-provided credentials.
 * In Tauri mode, this is performed server-side to keep the client secret secure.
 * In browser mode, falls back with an error.
 */
export async function exchangeOAuthCode(
  hostname: string,
  clientId: string,
  clientSecret: string,
  code: string,
): Promise<string> {
  if (isTauriEnvironment()) {
    return await window.gitify.exchangeOAuthCode(
      hostname,
      clientId,
      clientSecret,
      code,
    );
  }
  throw new Error(
    'OAuth token exchange is not available in browser mode. Please run the app with Tauri.',
  );
}

/**
 * Exchange OAuth authorization code for access token using default GitHub App credentials.
 * The credentials are embedded in the Rust backend at build time.
 */
export async function exchangeGitHubAppCode(code: string): Promise<string> {
  if (isTauriEnvironment()) {
    return await window.gitify.exchangeGitHubAppCode(code);
  }
  throw new Error(
    'GitHub App token exchange is not available in browser mode. Please run the app with Tauri.',
  );
}

/**
 * Get the GitHub App client ID for constructing the authorization URL.
 * Only the client ID (which is public) is exposed.
 */
export async function getGitHubAppClientId(): Promise<string> {
  if (isTauriEnvironment()) {
    return await window.gitify.getGitHubAppClientId();
  }
  throw new Error(
    'GitHub App client ID is not available in browser mode. Please run the app with Tauri.',
  );
}

export function quitApp(): void {
  if (isTauriEnvironment()) {
    window.gitify.app.quit();
  }
}

export function showWindow(): void {
  if (isTauriEnvironment()) {
    window.gitify.app.show();
  }
}

export function hideWindow(): void {
  if (isTauriEnvironment()) {
    window.gitify.app.hide();
  }
}

export function setAutoLaunch(value: boolean): void {
  if (isTauriEnvironment()) {
    window.gitify.setAutoLaunch(value);
  }
}

export function setUseAlternateIdleIcon(value: boolean): void {
  if (isTauriEnvironment()) {
    // biome-ignore lint/correctness/useHookAtTopLevel: This is a Tauri tray method, not a React hook
    window.gitify.tray.useAlternateIdleIcon(value);
  }
}

export function setUseUnreadActiveIcon(value: boolean): void {
  if (isTauriEnvironment()) {
    // biome-ignore lint/correctness/useHookAtTopLevel: This is a Tauri tray method, not a React hook
    window.gitify.tray.useUnreadActiveIcon(value);
  }
}

export function setKeyboardShortcut(keyboardShortcut: boolean): void {
  if (isTauriEnvironment()) {
    window.gitify.setKeyboardShortcut(keyboardShortcut);
  }
}

/**
 * Updates the tray icon color based on the number of unread notifications.
 *
 * Passing a negative number will set the error state color.
 *
 * @param notificationsLength The number of unread notifications
 */
export function updateTrayColor(notificationsLength: number): void {
  if (isTauriEnvironment()) {
    window.gitify.tray.updateColor(notificationsLength);
  }
}

/**
 * Updates the tray icon title.
 *
 * @param title The title to set on the tray icon
 */
export function updateTrayTitle(title: string): void {
  if (isTauriEnvironment()) {
    window.gitify.tray.updateTitle(title);
  }
}
