import { useCallback, useState } from 'react';
import type {
  AccountNotifications,
  GitifyError,
  GitifyState,
  Status,
} from '../types';
import type { Notification } from '../typesGitHub';
import {
  ignoreNotificationThreadSubscription,
  markNotificationThreadAsDone,
  markNotificationThreadAsRead,
  markRepositoryNotificationsAsRead,
} from '../utils/api/client';
import { getAccountUUID } from '../utils/auth/utils';
import {
  getAllNotifications,
  setTrayIconColor,
  triggerNativeNotifications,
} from '../utils/notifications';
import { removeNotification } from '../utils/remove-notification';
import { removeNotifications } from '../utils/remove-notifications';

interface NotificationsState {
  notifications: AccountNotifications[];
  fetchNotifications: (state: GitifyState) => Promise<void>;
  markNotificationRead: (
    state: GitifyState,
    notification: Notification,
  ) => Promise<void>;
  markNotificationDone: (
    state: GitifyState,
    notification: Notification,
  ) => Promise<void>;
  unsubscribeNotification: (
    state: GitifyState,
    notification: Notification,
  ) => Promise<void>;
  markRepoNotificationsRead: (
    state: GitifyState,
    notification: Notification,
  ) => Promise<void>;
  markRepoNotificationsDone: (
    state: GitifyState,
    notification: Notification,
  ) => Promise<void>;
  status: Status;
  errorDetails: GitifyError;
}

export const useNotifications = (): NotificationsState => {
  const [status, setStatus] = useState<Status>('success');
  const [globalError, setGlobalError] = useState<GitifyError>();

  const [notifications, setNotifications] = useState<AccountNotifications[]>(
    [],
  );

  const fetchNotifications = useCallback(
    async (state: GitifyState) => {
      setStatus('loading');

      const fetchedNotifications = await getAllNotifications(state);

      // Set Global Error if all accounts have the same error
      const allAccountsHaveErrors = fetchedNotifications.every((account) => {
        return account.error !== null;
      });
      let accountErrorsAreAllSame = true;
      const accountError = fetchedNotifications[0]?.error;
      for (const fetchedNotification of fetchedNotifications) {
        if (accountError !== fetchedNotification.error) {
          accountErrorsAreAllSame = false;
          break;
        }
      }

      if (allAccountsHaveErrors && accountErrorsAreAllSame) {
        setStatus('error');
        setGlobalError(accountError);
        return;
      }

      setNotifications(fetchedNotifications);
      triggerNativeNotifications(notifications, fetchedNotifications, state);
      setStatus('success');
    },
    [notifications],
  );

  const markNotificationRead = useCallback(
    async (state: GitifyState, notification: Notification) => {
      setStatus('loading');

      try {
        await markNotificationThreadAsRead(
          notification.id,
          notification.account.hostname,
          notification.account.token,
        );

        const updatedNotifications = removeNotification(
          state.settings,
          notification,
          notifications,
        );

        setNotifications(updatedNotifications);
        setTrayIconColor(updatedNotifications);
        setStatus('success');
      } catch (err) {
        setStatus('success');
      }
    },
    [notifications],
  );

  const markNotificationDone = useCallback(
    async (state: GitifyState, notification: Notification) => {
      setStatus('loading');

      try {
        await markNotificationThreadAsDone(
          notification.id,
          notification.account.hostname,
          notification.account.token,
        );

        const updatedNotifications = removeNotification(
          state.settings,
          notification,
          notifications,
        );

        setNotifications(updatedNotifications);
        setTrayIconColor(updatedNotifications);
        setStatus('success');
      } catch (err) {
        setStatus('success');
      }
    },
    [notifications],
  );

  const unsubscribeNotification = useCallback(
    async (state: GitifyState, notification: Notification) => {
      setStatus('loading');

      try {
        await ignoreNotificationThreadSubscription(
          notification.id,
          notification.account.hostname,
          notification.account.token,
        );
        await markNotificationRead(state, notification);
        setStatus('success');
      } catch (err) {
        setStatus('success');
      }
    },
    [markNotificationRead],
  );

  const markRepoNotificationsRead = useCallback(
    async (state: GitifyState, notification: Notification) => {
      setStatus('loading');

      const repoSlug = notification.repository.full_name;
      const hostname = notification.account.hostname;

      try {
        await markRepositoryNotificationsAsRead(
          repoSlug,
          hostname,
          notification.account.token,
        );

        const updatedNotifications = removeNotifications(
          state.settings,
          notification,
          notifications,
        );

        setNotifications(updatedNotifications);
        setTrayIconColor(updatedNotifications);
        setStatus('success');
      } catch (err) {
        setStatus('success');
      }
    },
    [notifications],
  );

  const markRepoNotificationsDone = useCallback(
    async (state: GitifyState, notification: Notification) => {
      setStatus('loading');

      const repoSlug = notification.repository.full_name;

      try {
        const accountIndex = notifications.findIndex(
          (accountNotifications) =>
            getAccountUUID(accountNotifications.account) ===
            getAccountUUID(notification.account),
        );

        if (accountIndex !== -1) {
          const notificationsToRemove = notifications[
            accountIndex
          ].notifications.filter(
            (notification) => notification.repository.full_name === repoSlug,
          );

          await Promise.all(
            notificationsToRemove.map((notification) =>
              markNotificationDone(state, notification),
            ),
          );
        }

        const updatedNotifications = removeNotifications(
          state.settings,
          notification,
          notifications,
        );

        setNotifications(updatedNotifications);
        setTrayIconColor(updatedNotifications);
        setStatus('success');
      } catch (err) {
        setStatus('success');
      }
    },
    [notifications, markNotificationDone],
  );

  return {
    status,
    errorDetails: globalError,
    notifications,

    fetchNotifications,
    markNotificationRead,
    markNotificationDone,
    unsubscribeNotification,
    markRepoNotificationsRead,
    markRepoNotificationsDone,
  };
};
