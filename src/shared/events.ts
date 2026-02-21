import { APPLICATION } from './constants';

const P = APPLICATION.EVENT_PREFIX;

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

export interface ITrayColorUpdate {
  notificationsCount: number;
  isOnline: boolean;
}

export type EventData =
  | string
  | number
  | boolean
  | IKeyboardShortcut
  | IAutoLaunch
  | IOpenExternal
  | ITrayColorUpdate;
