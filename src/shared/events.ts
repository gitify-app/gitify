import { APPLICATION } from './constants';

const P = APPLICATION.EVENT_PREFIX;

/**
 * IPC event name constants for all Electron main ↔ renderer communication channels.
 * Each value is prefixed with `APPLICATION.EVENT_PREFIX` to prevent collisions.
 */
export const EVENTS = {
  AUTH_CALLBACK: `${P}auth-callback`,
  QUIT: `${P}quit`,
  WINDOW_SHOW: `${P}window-show`,
  WINDOW_HIDE: `${P}window-hide`,
  VERSION: `${P}version`,
  UPDATE_ICON_COLOR: `${P}update-icon-color`,
  UPDATE_ICON_TITLE: `${P}update-icon-title`,
  USE_ALTERNATE_IDLE_ICON: `${P}use-alternate-idle-icon`,
  USE_UNREAD_ACTIVE_ICON: `${P}use-unread-active-icon`,
  UPDATE_KEYBOARD_SHORTCUT: `${P}update-keyboard-shortcut`,
  UPDATE_AUTO_LAUNCH: `${P}update-auto-launch`,
  SAFE_STORAGE_ENCRYPT: `${P}safe-storage-encrypt`,
  SAFE_STORAGE_DECRYPT: `${P}safe-storage-decrypt`,
  NOTIFICATION_SOUND_PATH: `${P}notification-sound-path`,
  OPEN_EXTERNAL: `${P}open-external`,
  RESET_APP: `${P}reset-app`,
  UPDATE_THEME: `${P}update-theme`,
  TWEMOJI_DIRECTORY: `${P}twemoji-directory`,
} as const;

/** Union type of all valid IPC event name strings. */
export type EventType = (typeof EVENTS)[keyof typeof EVENTS];

/** Payload for the `UPDATE_AUTO_LAUNCH` event. */
export interface IAutoLaunch {
  openAtLogin: boolean;
  openAsHidden: boolean;
}

/** Payload for the `UPDATE_KEYBOARD_SHORTCUT` event. */
export interface IKeyboardShortcut {
  enabled: boolean;
  keyboardShortcut: string;
}


/** Result of applying the global open/close Gitify shortcut in the main process. */
export interface IKeyboardShortcutResult {
  success: boolean;
}

/** Payload for the `OPEN_EXTERNAL` event. */
export interface IOpenExternal {
  url: string;
  activate: boolean;
}

/** Union of all possible IPC event payload types. */
export type EventData =
  | string
  | number
  | boolean
  | IKeyboardShortcut
  | IAutoLaunch
  | IOpenExternal;
