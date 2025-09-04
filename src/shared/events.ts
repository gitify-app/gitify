import { APPLICATION } from './constants';

const P = APPLICATION.EVENT_PREFIX;

export const EVENTS = {
  AUTH_CALLBACK: `${P}auth-callback`,
  ICON_IDLE: `${P}icon-idle`,
  ICON_ACTIVE: `${P}icon-active`,
  ICON_ERROR: `${P}icon-error`,
  QUIT: `${P}quit`,
  WINDOW_SHOW: `${P}window-show`,
  WINDOW_HIDE: `${P}window-hide`,
  VERSION: `${P}version`,
  UPDATE_TITLE: `${P}update-title`,
  USE_ALTERNATE_IDLE_ICON: `${P}use-alternate-idle-icon`,
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

export type EventType = (typeof EVENTS)[keyof typeof EVENTS];

export interface IAutoLaunch {
  openAtLogin: boolean;
  openAsHidden: boolean;
}

export interface IKeyboardShortcut {
  enabled: boolean;
  keyboardShortcut: string;
}

export interface IOpenExternal {
  url: string;
  activate: boolean;
}

export type EventData =
  | string
  | boolean
  | IKeyboardShortcut
  | IAutoLaunch
  | IOpenExternal;
