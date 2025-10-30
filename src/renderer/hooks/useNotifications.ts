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
} from '../utils/api/client';
import { updateTrayColor } from '../utils/comms';
import { isMarkAsDoneFeatureSupported } from '../utils/features';
import { rendererLogError } from '../utils/logger';
import { triggerNativeNotifications } from '../utils/notifications/native';
import {
  getAllNotifications,
  setTrayIconColorAndTitle,
} from '../utils/notifications/notifications';
import { removeNotifications } from '../utils/notifications/remove';

/**
 * Apply optimistic local updates for read state.  This helps with some
 * rendering edge cases between fetch notification intervals.
 */
function markNotificationsAsReadLocally(targetNotifications: Notification[]) {
  for (const n of targetNotifications) {
    n.unread = false;
  }
}

interface NotificationsState {
  status: Status;
  globalError: GitifyError;

  notifications: AccountNotifications[];
  fetchNotifications: (state: GitifyState) => Promise<void>;
  removeAccountNotifications: (account: Account) => Promise<void>;

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
      const allAccountsHaveErrors =
        fetchedNotifications.length > 0 &&
        fetchedNotifications.every((account) => {
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
        updateTrayColor(-1);
        return;
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

        markNotificationsAsReadLocally(readNotifications);

        setNotifications(updatedNotifications);
        setTrayIconColorAndTitle(updatedNotifications, state.settings);
      } catch (err) {
        rendererLogError(
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
      if (!isMarkAsDoneFeatureSupported(doneNotifications[0].account)) {
        return;
      }

      setStatus('loading');

      try {
        await Promise.all(
          doneNotifications.map((notification) =>
            markNotificationThreadAsDone(
              notification.id,
              notification.account.hostname,
              notification.account.token,
            ),
          ),
        );

        const updatedNotifications = removeNotifications(
          state.settings,
          doneNotifications,
          notifications,
        );

        markNotificationsAsReadLocally(doneNotifications);

        setNotifications(updatedNotifications);
        setTrayIconColorAndTitle(updatedNotifications, state.settings);
      } catch (err) {
        rendererLogError(
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
        rendererLogError(
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
