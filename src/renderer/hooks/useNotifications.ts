import { useCallback, useMemo, useRef, useState } from 'react';

import type {
  Account,
  AccountNotifications,
  GitifyError,
  GitifyNotification,
  GitifyState,
  Status,
} from '../types';

import {
  ignoreNotificationThreadSubscription,
  markNotificationThreadAsDone,
  markNotificationThreadAsRead,
} from '../utils/api/client';
import { isMarkAsDoneFeatureSupported } from '../utils/api/features';
import { getAccountUUID } from '../utils/auth/utils';
import {
  areAllAccountErrorsSame,
  doesAllAccountsHaveErrors,
} from '../utils/core/errors';
import { rendererLogError } from '../utils/core/logger';
import {
  getAllNotifications,
  getNotificationCount,
  getUnreadNotificationCount,
} from '../utils/notifications/notifications';
import { removeNotificationsForAccount } from '../utils/notifications/remove';
import { getNewNotifications } from '../utils/notifications/utils';
import { raiseSoundNotification } from '../utils/system/audio';
import { raiseNativeNotification } from '../utils/system/native';

interface NotificationsState {
  status: Status;
  globalError: GitifyError | undefined;

  notifications: AccountNotifications[];
  notificationCount: number;
  unreadNotificationCount: number;
  hasNotifications: boolean;
  hasUnreadNotifications: boolean;

  fetchNotifications: (state: GitifyState) => Promise<void>;
  removeAccountNotifications: (account: Account) => Promise<void>;

  markNotificationsAsRead: (
    state: GitifyState,
    notifications: GitifyNotification[],
  ) => Promise<void>;
  markNotificationsAsDone: (
    state: GitifyState,
    notifications: GitifyNotification[],
  ) => Promise<void>;
  unsubscribeNotification: (
    state: GitifyState,
    notification: GitifyNotification,
  ) => Promise<void>;
}

/**
 * Hook that manages all notification state and actions for the application.
 *
 * Handles fetching, filtering, sound/native notification triggering,
 * mark-as-read, mark-as-done, and unsubscribe operations across all accounts.
 *
 * @returns The current notifications state and action callbacks.
 */
export const useNotifications = (): NotificationsState => {
  const [status, setStatus] = useState<Status>('success');
  const [globalError, setGlobalError] = useState<GitifyError>();

  const [notifications, setNotifications] = useState<AccountNotifications[]>(
    [],
  );

  const notificationCount = getNotificationCount(notifications);

  const unreadNotificationCount = getUnreadNotificationCount(notifications);

  const hasNotifications = useMemo(
    () => notificationCount > 0,
    [notificationCount],
  );

  const hasUnreadNotifications = useMemo(
    () => unreadNotificationCount > 0,
    [unreadNotificationCount],
  );

  const removeAccountNotifications = useCallback(
    async (account: Account) => {
      setStatus('loading');

      const accountUUID = getAccountUUID(account);
      const updatedNotifications = notifications.filter(
        (notification) => getAccountUUID(notification.account) !== accountUUID,
      );

      setNotifications(updatedNotifications);

      setStatus('success');
    },
    [notifications],
  );

  const isFetchingRef = useRef(false);
  const fetchNotifications = useCallback(
    async (state: GitifyState) => {
      if (isFetchingRef.current) {
        // Prevent overlapping fetches
        return;
      }
      isFetchingRef.current = true;
      setStatus('loading');
      try {
        const previousNotifications = notifications;
        const fetchedNotifications = await getAllNotifications(state);
        setNotifications(fetchedNotifications);

        // Set Global Error if all accounts have the same error
        const allAccountsHaveErrors =
          doesAllAccountsHaveErrors(fetchedNotifications);
        const allAccountErrorsAreSame =
          areAllAccountErrorsSame(fetchedNotifications);

        if (allAccountsHaveErrors) {
          const accountError = fetchedNotifications[0].error;
          setStatus('error');
          setGlobalError(
            allAccountErrorsAreSame ? (accountError ?? undefined) : undefined,
          );
          return;
        }

        const diffNotifications = getNewNotifications(
          previousNotifications,
          fetchedNotifications,
        );

        if (diffNotifications.length > 0) {
          if (state.settings!.playSound) {
            raiseSoundNotification(state.settings!.notificationVolume);
          }

          if (state.settings!.showNotifications) {
            raiseNativeNotification(diffNotifications);
          }
        }

        setStatus('success');
        setGlobalError(undefined);
      } finally {
        isFetchingRef.current = false;
      }
    },
    [notifications],
  );

  const markNotificationsAsRead = useCallback(
    async (state: GitifyState, readNotifications: GitifyNotification[]) => {
      setStatus('loading');

      try {
        await Promise.all(
          readNotifications.map((notification) =>
            markNotificationThreadAsRead(notification.account, notification.id),
          ),
        );

        const updatedNotifications = removeNotificationsForAccount(
          readNotifications[0].account,
          state.settings!,
          readNotifications,
          notifications,
        );

        setNotifications(updatedNotifications);
      } catch (err) {
        rendererLogError(
          'markNotificationsAsRead',
          'Error occurred while marking notifications as read',
          err as Error,
        );
      }

      setStatus('success');
    },
    [notifications],
  );

  const markNotificationsAsDone = useCallback(
    async (state: GitifyState, doneNotifications: GitifyNotification[]) => {
      if (!isMarkAsDoneFeatureSupported(doneNotifications[0].account)) {
        return;
      }

      setStatus('loading');

      try {
        await Promise.all(
          doneNotifications.map((notification) =>
            markNotificationThreadAsDone(notification.account, notification.id),
          ),
        );

        const updatedNotifications = removeNotificationsForAccount(
          doneNotifications[0].account,
          state.settings!,
          doneNotifications,
          notifications,
        );

        setNotifications(updatedNotifications);
      } catch (err) {
        rendererLogError(
          'markNotificationsAsDone',
          'Error occurred while marking notifications as done',
          err as Error,
        );
      }

      setStatus('success');
    },
    [notifications],
  );

  const unsubscribeNotification = useCallback(
    async (state: GitifyState, notification: GitifyNotification) => {
      setStatus('loading');

      try {
        await ignoreNotificationThreadSubscription(
          notification.account,
          notification.id,
        );

        if (state.settings!.markAsDoneOnUnsubscribe) {
          await markNotificationsAsDone(state, [notification]);
        } else {
          await markNotificationsAsRead(state, [notification]);
        }
      } catch (err) {
        rendererLogError(
          'unsubscribeNotification',
          'Error occurred while unsubscribing from notification thread',
          err as Error,
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
    notificationCount,
    unreadNotificationCount,
    hasNotifications,
    hasUnreadNotifications,

    fetchNotifications,
    removeAccountNotifications,

    markNotificationsAsRead,
    markNotificationsAsDone,
    unsubscribeNotification,
  };
};
