import { useCallback, useState } from 'react';

import { logError } from '../../shared/logger';
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
} from '../utils/api/client';
import { isMarkAsDoneFeatureSupported } from '../utils/features';
import {
  getAllNotifications,
  setTrayIconColor,
  triggerNativeNotifications,
} from '../utils/notifications';
import { removeNotifications } from '../utils/notifications/remove';

interface NotificationsState {
  notifications: AccountNotifications[];
  removeAccountNotifications: (account: Account) => Promise<void>;
  fetchNotifications: (state: GitifyState) => Promise<void>;
  markNotificationsAsRead: (
    state: GitifyState,
    notifications: Notification[],
  ) => Promise<void>;
  markNotificationsAsDone: (
    state: GitifyState,
    notifications: Notification[],
  ) => Promise<void>;
  unsubscribeNotification: (
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
      if (fetchNotifications.length > 0) {
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
      }

      setNotifications(fetchedNotifications);
      triggerNativeNotifications(notifications, fetchedNotifications, state);
      setStatus('success');
    },
    [notifications],
  );

  const markNotificationsAsRead = useCallback(
    async (state: GitifyState, readNotifications: Notification[]) => {
      setStatus('loading');

      try {
        await Promise.all(
          readNotifications.map((notification) =>
            markNotificationThreadAsRead(
              notification.id,
              notification.account.hostname,
              notification.account.token,
            ),
          ),
        );

        const updatedNotifications = removeNotifications(
          state.settings,
          readNotifications,
          notifications,
        );

        setNotifications(updatedNotifications);
        setTrayIconColor(updatedNotifications);
      } catch (err) {
        logError(
          'markNotificationsAsRead',
          'Error occurred while marking notifications as read',
          err,
        );
      }

      setStatus('success');
    },
    [notifications],
  );

  const markNotificationsAsDone = useCallback(
    async (state: GitifyState, doneNotifications: Notification[]) => {
      setStatus('loading');

      try {
        if (isMarkAsDoneFeatureSupported(doneNotifications[0].account)) {
          await Promise.all(
            doneNotifications.map((notification) =>
              markNotificationThreadAsDone(
                notification.id,
                notification.account.hostname,
                notification.account.token,
              ),
            ),
          );
        }

        const updatedNotifications = removeNotifications(
          state.settings,
          doneNotifications,
          notifications,
        );

        setNotifications(updatedNotifications);
        setTrayIconColor(updatedNotifications);
      } catch (err) {
        logError(
          'markNotificationsAsDone',
          'Error occurred while marking notifications as done',
          err,
        );
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
          await markNotificationsAsDone(state, [notification]);
        } else {
          await markNotificationsAsRead(state, [notification]);
        }
      } catch (err) {
        logError(
          'unsubscribeNotification',
          'Error occurred while unsubscribing from notification thread',
          err,
          notification,
        );
      }

      setStatus('success');
    },
    [markNotificationsAsRead, markNotificationsAsDone],
  );

  return {
    status,
    globalError,
    notifications,

    removeAccountNotifications,
    fetchNotifications,
    markNotificationsAsRead,
    markNotificationsAsDone,
    unsubscribeNotification,
  };
};
