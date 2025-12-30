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
import {
  areAllAccountErrorsSame,
  doesAllAccountsHaveErrors,
} from '../utils/errors';
import { isMarkAsDoneFeatureSupported } from '../utils/features';
import { rendererLogError } from '../utils/logger';
import { raiseNativeNotification } from '../utils/notifications/native';
import {
  getAllNotifications,
  getNotificationCount,
  getUnreadNotificationCount,
} from '../utils/notifications/notifications';
import { removeNotificationsForAccount } from '../utils/notifications/remove';
import { raiseSoundNotification } from '../utils/notifications/sound';
import { getNewNotifications } from '../utils/notifications/utils';

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

export const useNotifications = (): NotificationsState => {
  const [status, setStatus] = useState<Status>('success');
  const [globalError, setGlobalError] = useState<GitifyError>();

  const [notifications, setNotifications] = useState<AccountNotifications[]>(
    [],
  );

  // Use ref to track previous notifications without causing re-renders
  const notificationsRef = useRef<AccountNotifications[]>([]);

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

      const updatedNotifications = notifications.filter(
        (notification) => notification.account !== account,
      );

      setNotifications(updatedNotifications);

      setStatus('success');
    },
    [notifications],
  );

  const fetchNotifications = useCallback(async (state: GitifyState) => {
    setStatus('loading');
    setGlobalError(undefined);

    if (!state.settings) {
      setStatus('error');
      return;
    }

    const previousNotifications = notificationsRef.current;
    const fetchedNotifications = await getAllNotifications(state);

    // Update ref before setting state
    notificationsRef.current = fetchedNotifications;
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
      if (state.settings.playSound) {
        raiseSoundNotification(state.settings.notificationVolume);
      }

      if (state.settings.showNotifications) {
        raiseNativeNotification(diffNotifications);
      }
    }

    setStatus('success');
  }, []);

  const markNotificationsAsRead = useCallback(
    async (state: GitifyState, readNotifications: GitifyNotification[]) => {
      if (!readNotifications.length || !state.settings) {
        return;
      }

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

        const updatedNotifications = removeNotificationsForAccount(
          readNotifications[0].account,
          state.settings,
          readNotifications,
          notifications,
        );

        setNotifications(updatedNotifications);
        setStatus('success');
      } catch (err) {
        rendererLogError(
          'markNotificationsAsRead',
          'Error occurred while marking notifications as read',
          err as Error,
        );
        setStatus('error');
      }
    },
    [notifications],
  );

  const markNotificationsAsDone = useCallback(
    async (state: GitifyState, doneNotifications: GitifyNotification[]) => {
      if (!doneNotifications.length) {
        return;
      }

      if (!isMarkAsDoneFeatureSupported(doneNotifications[0].account)) {
        return;
      }

      if (!state.settings) {
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

        const updatedNotifications = removeNotificationsForAccount(
          doneNotifications[0].account,
          state.settings,
          doneNotifications,
          notifications,
        );

        setNotifications(updatedNotifications);
        setStatus('success');
      } catch (err) {
        rendererLogError(
          'markNotificationsAsDone',
          'Error occurred while marking notifications as done',
          err as Error,
        );
        setStatus('error');
      }
    },
    [notifications],
  );

  const unsubscribeNotification = useCallback(
    async (state: GitifyState, notification: GitifyNotification) => {
      if (!state.settings) {
        return;
      }

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
        // Note: status is set by markNotificationsAsDone/markNotificationsAsRead
      } catch (err) {
        rendererLogError(
          'unsubscribeNotification',
          'Error occurred while unsubscribing from notification thread',
          err as Error,
          notification,
        );
        setStatus('error');
      }
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
