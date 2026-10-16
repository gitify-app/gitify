import type {
  Account,
  AccountNotifications,
  GitifyError,
  GitifyNotification,
  Status,
} from '../types';

import {
  type NotificationActions,
  useNotificationActions,
} from './notifications/useNotificationActions';
import {
  type NotificationsQueryResult,
  useNotificationsQuery,
} from './notifications/useNotificationsQuery';

export interface NotificationsState {
  status: Status;
  globalError: GitifyError | undefined;

  /** Whether a fetch (initial, background poll, or manual refetch) is currently in flight. */
  isFetching: boolean;

  notifications: AccountNotifications[];
  notificationCount: number;
  unreadNotificationCount: number;
  hasNotifications: boolean;
  hasUnreadNotifications: boolean;

  refetchNotifications: () => Promise<void>;
  removeAccountNotifications: (account: Account) => void;

  markNotificationsAsRead: (notifications: GitifyNotification[]) => Promise<boolean>;
  markNotificationsAsDone: (notifications: GitifyNotification[]) => Promise<boolean>;
  unsubscribeNotification: (notification: GitifyNotification) => Promise<boolean>;
}

/**
 * Assemble the public notification reader/actions surface from the query and
 * actions halves. Shared by the reader hook and the host hook so both expose
 * an identical API.
 */
export const buildNotificationsState = (
  query: NotificationsQueryResult,
  actions: NotificationActions,
): NotificationsState => ({
  status: query.status,
  globalError: query.globalError,

  isFetching: query.isFetching,

  notifications: query.notifications,
  notificationCount: query.notificationCount,
  unreadNotificationCount: query.unreadNotificationCount,
  hasNotifications: query.hasNotifications,
  hasUnreadNotifications: query.hasUnreadNotifications,

  refetchNotifications: actions.refetchNotifications,
  removeAccountNotifications: actions.removeAccountNotifications,

  markNotificationsAsRead: actions.markNotificationsAsRead,
  markNotificationsAsDone: actions.markNotificationsAsDone,
  unsubscribeNotification: actions.unsubscribeNotification,
});

/**
 * Hook that exposes notification state and actions for the application.
 *
 * Side-effect free: it does not poll, raise alerts, or register wake/focus
 * listeners, and shares the query cache with every other consumer. The
 * app-level host (`useNotificationsHost`) owns those side effects.
 *
 * A consumer that only needs the actions should use `useNotificationActions`
 * directly so it does not subscribe to notification data.
 *
 * @returns The current notifications state and action callbacks.
 */
export const useNotifications = (): NotificationsState => {
  const query = useNotificationsQuery({ poll: false });
  const actions = useNotificationActions();

  return buildNotificationsState(query, actions);
};
