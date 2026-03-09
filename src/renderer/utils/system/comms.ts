import { defaultSettings } from '../../context/defaults';

import { type Link, OpenPreference } from '../../types';

import { loadState } from '../core/storage';

/**
 * Open a URL in the user's default browser.
 *
 * Only opens `https://` URLs. The `openLinks` setting controls whether
 * the link opens in the foreground or background.
 *
 * @param url - The URL to open.
 */
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

/**
 * Return the application version string from the main process.
 *
 * @returns The version string (e.g. `"5.12.0"`).
 */
export async function getAppVersion(): Promise<string> {
  return await window.gitify.app.version();
}

/**
 * Encrypt a plaintext value using Electron's safe storage.
 *
 * @param value - The plaintext string to encrypt.
 * @returns The encrypted string.
 */
export async function encryptValue(value: string): Promise<string> {
  return await window.gitify.encryptValue(value);
}

/**
 * Decrypt an encrypted value using Electron's safe storage.
 *
 * @param value - The encrypted string to decrypt.
 * @returns The plaintext string.
 */
export async function decryptValue(value: string): Promise<string> {
  return await window.gitify.decryptValue(value);
}

/**
 * Quit the Electron application.
 */
export function quitApp(): void {
  window.gitify.app.quit();
}

/**
 * Show the main application window.
 */
export function showWindow(): void {
  window.gitify.app.show();
}

/**
 * Hide the main application window.
 */
export function hideWindow(): void {
  window.gitify.app.hide();
}

/**
 * Enable or disable launching the application at system login.
 *
 * @param value - `true` to enable auto-launch, `false` to disable.
 */
export function setAutoLaunch(value: boolean): void {
  window.gitify.setAutoLaunch(value);
}

/**
 * Switch the tray icon to an alternate idle icon variant.
 *
 * @param value - `true` to use the alternate idle icon, `false` for the default.
 */
export function setUseAlternateIdleIcon(value: boolean): void {
  window.gitify.tray.useAlternateIdleIcon(value);
}

/**
 * Switch the tray icon to an "active" variant when there are unread notifications.
 *
 * @param value - `true` to use the unread-active icon, `false` for the default.
 */
export function setUseUnreadActiveIcon(value: boolean): void {
  window.gitify.tray.useUnreadActiveIcon(value);
}

/**
 * Register or unregister the global keyboard shortcut for the application.
 *
 * @param keyboardShortcut - `true` to enable the shortcut, `false` to disable.
 */
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

export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}
