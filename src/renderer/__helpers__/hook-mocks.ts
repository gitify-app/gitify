import type { useNotificationActions } from '../hooks/notifications/useNotificationActions';
import type { useLogins } from '../hooks/useLogins';
import type { useNotifications } from '../hooks/useNotifications';

/**
 * Configurable return values for the globally mocked app hooks.
 *
 * `vitest.setup.ts` replaces `useNotifications`, `useLogins`, and
 * `useOnlineStatus` with implementations backed by this module, so component
 * tests can inject state and action mocks through `renderWithProviders`
 * options without each test file declaring its own `vi.mock`.
 *
 * Hook test files that exercise the real implementations opt out with
 * `vi.unmock(...)`.
 */

export type NotificationsState = ReturnType<typeof useNotifications>;
export type LoginsState = ReturnType<typeof useLogins>;
export type NotificationActionsState = ReturnType<typeof useNotificationActions>;

let notificationsDefaults: NotificationsState | null = null;
let notificationsOverrides: Partial<NotificationsState> = {};

let loginsDefaults: LoginsState | null = null;
let loginsOverrides: Partial<LoginsState> = {};

let isOnline = true;

function buildNotificationsDefaults(): NotificationsState {
  return {
    status: 'success',
    globalError: undefined,

    isFetching: false,

    notifications: [],
    notificationCount: 0,
    unreadNotificationCount: 0,
    hasNotifications: false,
    hasUnreadNotifications: false,

    refetchNotifications: vi.fn(),
    removeAccountNotifications: vi.fn(),

    markNotificationsAsRead: vi.fn().mockResolvedValue(true),
    markNotificationsAsDone: vi.fn().mockResolvedValue(true),
    unsubscribeNotification: vi.fn().mockResolvedValue(true),
  };
}

function buildLoginsDefaults(): LoginsState {
  return {
    loginWithDeviceFlowStart: vi.fn(),
    loginWithDeviceFlowPoll: vi.fn(),
    loginWithDeviceFlowComplete: vi.fn(),
    loginWithCli: vi.fn(),
    loginWithPersonalAccessToken: vi.fn(),
    logoutFromAccount: vi.fn(),
  };
}

/** Current mocked `useNotifications` return value. */
export function getMockedNotificationsState(): NotificationsState {
  notificationsDefaults ??= buildNotificationsDefaults();
  return { ...notificationsDefaults, ...notificationsOverrides };
}

/**
 * Current mocked `useNotificationActions` return value: the action subset of
 * the merged notifications state, so overrides passed through
 * `renderWithProviders` reach action-only consumers too.
 */
export function getMockedNotificationActionsState(): NotificationActionsState {
  const state = getMockedNotificationsState();

  return {
    refetchNotifications: state.refetchNotifications,
    removeAccountNotifications: state.removeAccountNotifications,
    markNotificationsAsRead: state.markNotificationsAsRead,
    markNotificationsAsDone: state.markNotificationsAsDone,
    unsubscribeNotification: state.unsubscribeNotification,
  };
}

/** Current mocked `useLogins` return value. */
export function getMockedLoginsState(): LoginsState {
  loginsDefaults ??= buildLoginsDefaults();
  return { ...loginsDefaults, ...loginsOverrides };
}

/** Current mocked `useOnlineStatus` return value. */
export function getMockedIsOnline(): boolean {
  return isOnline;
}

/** Override parts of the mocked `useNotifications` return value. */
export function setNotificationsOverrides(overrides: Partial<NotificationsState>): void {
  notificationsOverrides = { ...notificationsOverrides, ...overrides };
}

/** Override parts of the mocked `useLogins` return value. */
export function setLoginsOverrides(overrides: Partial<LoginsState>): void {
  loginsOverrides = { ...loginsOverrides, ...overrides };
}

/** Override the mocked `useOnlineStatus` return value. */
export function setIsOnlineOverride(online: boolean): void {
  isOnline = online;
}

/** Reset all hook mocks to fresh defaults. Called from the global beforeEach. */
export function resetHookMocks(): void {
  notificationsDefaults = null;
  notificationsOverrides = {};
  loginsDefaults = null;
  loginsOverrides = {};
  isOnline = true;
}
