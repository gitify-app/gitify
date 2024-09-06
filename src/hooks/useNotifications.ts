import log from 'electron-log';
import { useCallback, useState } from 'react';
import type {
  Account,
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
import { isMarkAsDoneFeatureSupported } from '../utils/helpers';
import {
  getAllNotifications,
  setTrayIconColor,
  triggerNativeNotifications,
} from '../utils/notifications';
import { removeNotification } from '../utils/remove-notification';
import { removeNotifications } from '../utils/remove-notifications';

interface NotificationsState {
  notifications: AccountNotifications[];
  removeAccountNotifications: (account: Account) => Promise<void>;
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
  globalError: GitifyError;
}

export const useNotifications = (): NotificationsState => {
  const [status, setStatus] = useState<Status>('success');
  const [globalError, setGlobalError] = useState<GitifyError>();

  const [notifications, setNotifications] = useState<AccountNotifications[]>(
    [],
  );

  const removeAccountNotifications = useCallback(
    async (account: Account) => {
      setStatus('loading');

      const updatedNotifications = notifications.filter(
        (notification) => notification.account !== account,
      );

      setNotifications(updatedNotifications);
      setTrayIconColor(updatedNotifications);
      setStatus('success');
    },
    [notifications],
  );

  const fetchNotifications = useCallback(
    async (state: GitifyState) => {
      setStatus('loading');
      setGlobalError(null);

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

      if (allAccountsHaveErrors) {
        setStatus('error');
        setGlobalError(accountErrorsAreAllSame ? accountError : null);
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
      } catch (err) {
        log.error('Error occurred while marking notification as read', err);
      }

      setStatus('success');
    },
    [notifications],
  );

  const markNotificationDone = useCallback(
    async (state: GitifyState, notification: Notification) => {
      setStatus('loading');

      try {
        if (isMarkAsDoneFeatureSupported(notification.account)) {
          await markNotificationThreadAsDone(
            notification.id,
            notification.account.hostname,
            notification.account.token,
          );
        }

        const updatedNotifications = removeNotification(
          state.settings,
          notification,
          notifications,
        );

        setNotifications(updatedNotifications);
        setTrayIconColor(updatedNotifications);
      } catch (err) {
        log.error('Error occurred while marking notification as done', err);
      }

      setStatus('success');
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

        if (state.settings.markAsDoneOnUnsubscribe) {
          await markNotificationDone(state, notification);
        } else {
          await markNotificationRead(state, notification);
        }
      } catch (err) {
        log.error(
          'Error occurred while unsubscribing from notification thread',
          err,
        );
      }

      setStatus('success');
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
      } catch (err) {
        log.error(
          'Error occurred while marking repository notifications as read',
          err,
        );
      }

      setStatus('success');
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
      } catch (err) {
        log.error(
          'Error occurred while marking repository notifications as done',
          err,
        );
      }

      setStatus('success');
    },
    [notifications, markNotificationDone],
  );

  return {
    status,
    globalError,
    notifications,

    removeAccountNotifications,
    fetchNotifications,
    markNotificationRead,
    markNotificationDone,
    unsubscribeNotification,
    markRepoNotificationsRead,
    markRepoNotificationsDone,
  };
};
