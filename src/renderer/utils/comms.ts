import { defaultSettings } from '../context/App';
import type { Link } from '../types';
import { loadState } from './storage';

export function openExternalLink(url: Link): void {
  // Load the state from local storage to avoid having to pass settings as a parameter
  const { settings } = loadState();
  const openPreference = settings
    ? settings.openLinks
    : defaultSettings.openLinks;

  if (url.toLowerCase().startsWith('https://')) {
    console.log('COMMS OPEN EXTERNAL LINK');
    window.gitify.openExternalLink(url, openPreference);
  }
}

export function getAppVersion(): string {
  return window.gitify.getAppVersion();
}

export async function encryptValue(value: string): Promise<string> {
  return await window.gitify.encryptValue(value);
}

export async function decryptValue(value: string): Promise<string> {
  return await window.gitify.decryptValue(value);
}

export function quitApp(): void {
  window.gitify.quitApp();
}

export function showWindow(): void {
  window.gitify.showWindow();
}

export function hideWindow(): void {
  window.gitify.hideWindow();
}

export function setAutoLaunch(value: boolean): void {
  window.gitify.setAutoLaunch(value);
}

export function setAlternateIdleIcon(value: boolean): void {
  window.gitify.setAlternateIdleIcon(value);
}

export function setKeyboardShortcut(keyboardShortcut: boolean): void {
  window.gitify.setKeyboardShortcut(keyboardShortcut);
}

export function updateTrayIcon(notificationsLength = 0): void {
  window.gitify.updateTrayIcon(notificationsLength);
}

export function updateTrayTitle(title = ''): void {
  window.gitify.updateTrayTitle(title);
}
