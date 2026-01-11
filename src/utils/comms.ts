import { defaultSettings } from '../context/defaults';
import { type Link, OpenPreference } from '../types';
import { loadState } from './storage';

export function openExternalLink(url: Link): void {
  // Load the state from local storage to avoid having to pass settings as a parameter
  const { settings } = loadState();
  const openPreference = settings
    ? settings.openLinks
    : defaultSettings.openLinks;

  if (url.toLowerCase().startsWith('https://')) {
    window.gitify.openExternalLink(
      url,
      openPreference === OpenPreference.FOREGROUND,
    );
  }
}

export async function getAppVersion(): Promise<string> {
  return await window.gitify.app.version();
}

export async function encryptValue(value: string): Promise<string> {
  return await window.gitify.encryptValue(value);
}

export async function decryptValue(value: string): Promise<string> {
  return await window.gitify.decryptValue(value);
}

/**
 * Exchange OAuth authorization code for access token using user-provided credentials.
 * This is performed server-side to keep the client secret secure.
 */
export async function exchangeOAuthCode(
  hostname: string,
  clientId: string,
  clientSecret: string,
  code: string,
): Promise<string> {
  return await window.gitify.exchangeOAuthCode(
    hostname,
    clientId,
    clientSecret,
    code,
  );
}

/**
 * Exchange OAuth authorization code for access token using default GitHub App credentials.
 * The credentials are embedded in the Rust backend at build time.
 */
export async function exchangeGitHubAppCode(code: string): Promise<string> {
  return await window.gitify.exchangeGitHubAppCode(code);
}

/**
 * Get the GitHub App client ID for constructing the authorization URL.
 * Only the client ID (which is public) is exposed.
 */
export async function getGitHubAppClientId(): Promise<string> {
  return await window.gitify.getGitHubAppClientId();
}

export function quitApp(): void {
  window.gitify.app.quit();
}

export function showWindow(): void {
  window.gitify.app.show();
}

export function hideWindow(): void {
  window.gitify.app.hide();
}

export function setAutoLaunch(value: boolean): void {
  window.gitify.setAutoLaunch(value);
}

export function setUseAlternateIdleIcon(value: boolean): void {
  window.gitify.tray.useAlternateIdleIcon(value);
}

export function setUseUnreadActiveIcon(value: boolean): void {
  window.gitify.tray.useUnreadActiveIcon(value);
}

export function setKeyboardShortcut(keyboardShortcut: boolean): void {
  window.gitify.setKeyboardShortcut(keyboardShortcut);
}

/**
 * Updates the tray icon color based on the number of unread notifications.
 *
 * Passing a negative number will set the error state color.
 *
 * @param notificationsLength The number of unread notifications
 */
export function updateTrayColor(notificationsLength: number): void {
  window.gitify.tray.updateColor(notificationsLength);
}

/**
 * Updates the tray icon title.
 *
 * @param title The title to set on the tray icon
 */
export function updateTrayTitle(title: string): void {
  window.gitify.tray.updateTitle(title);
}
