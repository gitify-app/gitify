const P = 'gitify:' as const;

/**
 * IPC event name constants for all Electron main ↔ renderer communication channels.
 * Each value is prefixed with `gitify:` to prevent collisions.
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

/** Shape of a single event contract: a request payload and a response payload. */
type Contract = { request: unknown; response: unknown };

/**
 * Type-level guard that forces every event in `EVENTS` to have a contract entry.
 * If a key is missing, this constraint fails at compile time.
 */
type AssertEventCoverage<T extends Record<EventType, Contract>> = T;

/**
 * Compile-time contract for every IPC event: request payload type and response type.
 *
 * - For `handle`/`invoke` pairs, `response` is the return type the renderer awaits.
 * - For fire-and-forget events (`send`/`on`), `response` is `undefined`.
 * - For events with no payload, `request` is `undefined`.
 */
export type EventContracts = AssertEventCoverage<{
  [EVENTS.AUTH_CALLBACK]: { request: string; response: undefined };
  [EVENTS.QUIT]: { request: undefined; response: undefined };
  [EVENTS.WINDOW_SHOW]: { request: undefined; response: undefined };
  [EVENTS.WINDOW_HIDE]: { request: undefined; response: undefined };
  [EVENTS.VERSION]: { request: undefined; response: string };
  [EVENTS.UPDATE_ICON_COLOR]: { request: number; response: undefined };
  [EVENTS.UPDATE_ICON_TITLE]: { request: string; response: undefined };
  [EVENTS.USE_ALTERNATE_IDLE_ICON]: { request: boolean; response: undefined };
  [EVENTS.USE_UNREAD_ACTIVE_ICON]: { request: boolean; response: undefined };
  [EVENTS.UPDATE_KEYBOARD_SHORTCUT]: {
    request: IKeyboardShortcut;
    response: IKeyboardShortcutResult;
  };
  [EVENTS.UPDATE_AUTO_LAUNCH]: { request: IAutoLaunch; response: undefined };
  [EVENTS.SAFE_STORAGE_ENCRYPT]: { request: string; response: string };
  [EVENTS.SAFE_STORAGE_DECRYPT]: { request: string; response: string };
  [EVENTS.NOTIFICATION_SOUND_PATH]: { request: undefined; response: string };
  [EVENTS.OPEN_EXTERNAL]: { request: IOpenExternal; response: undefined };
  [EVENTS.RESET_APP]: { request: undefined; response: undefined };
  [EVENTS.TWEMOJI_DIRECTORY]: { request: undefined; response: string };
}>;

/** Request payload type for a given event. */
export type EventRequest<E extends EventType> = EventContracts[E]['request'];

/** Response payload type for a given event. */
export type EventResponse<E extends EventType> = EventContracts[E]['response'];

/**
 * Variadic args helper: yields `[]` when the event has no request payload,
 * otherwise `[request]`. Lets callers write `send(EVENTS.QUIT)` instead of
 * `send(EVENTS.QUIT, undefined)`.
 */
export type EventArgs<E extends EventType> = [EventRequest<E>] extends [
  undefined,
]
  ? []
  : [EventRequest<E>];
