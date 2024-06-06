import { useCallback, useState } from 'react';
import type {
  AccountNotifications,
  GitifyError,
  GitifyState,
  SettingsState,
  Status,
} from '../types';
import {
  ignoreNotificationThreadSubscription,
  markNotificationThreadAsDone,
  markNotificationThreadAsRead,
  markRepositoryNotificationsAsRead,
} from '../utils/api/client';
import { determineFailureType } from '../utils/api/errors';
import { getAccountForHost } from '../utils/helpers';
import {
  getAllNotifications,
  setTrayIconColor,
  triggerNativeNotifications,
} from '../utils/notifications';
import { removeNotification } from '../utils/remove-notification';
import { removeNotifications } from '../utils/remove-notifications';

interface NotificationsState {
  notifications: AccountNotifications[];
  removeNotificationFromState: (
    settings: SettingsState,
    id: string,
    hostname: string,
  ) => void;
  fetchNotifications: (state: GitifyState) => Promise<void>;
  markNotificationRead: (
    state: GitifyState,
    id: string,
    hostname: string,
  ) => Promise<void>;
  markNotificationDone: (
    state: GitifyState,
    id: string,
    hostname: string,
  ) => Promise<void>;
  unsubscribeNotification: (
    state: GitifyState,
    id: string,
    hostname: string,
  ) => Promise<void>;
  markRepoNotifications: (
    state: GitifyState,
    repoSlug: string,
    hostname: string,
  ) => Promise<void>;
  markRepoNotificationsDone: (
    state: GitifyState,
    repoSlug: string,
    hostname: string,
  ) => Promise<void>;
  status: Status;
  errorDetails: GitifyError;
}

export const useNotifications = (): NotificationsState => {
  const [status, setStatus] = useState<Status>('success');
  const [errorDetails, setErrorDetails] = useState<GitifyError>();

  const [notifications, setNotifications] = useState<AccountNotifications[]>(
    [],
  );

  const fetchNotifications = useCallback(
    async (state: GitifyState) => {
      setStatus('loading');

      try {
        const fetchedNotifications = await getAllNotifications(state);

        setNotifications(fetchedNotifications);
        triggerNativeNotifications(notifications, fetchedNotifications, state);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setErrorDetails(determineFailureType(err));
      }
    },
    [notifications],
  );

  const markNotificationRead = useCallback(
    async (state: GitifyState, id: string, hostname: string) => {
      setStatus('loading');

      const account = getAccountForHost(hostname, state.auth);

      try {
        await markNotificationThreadAsRead(id, hostname, account.token);

        const updatedNotifications = removeNotification(
          state.settings,
          id,
          notifications,
          hostname,
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
    async (state: GitifyState, id: string, hostname: string) => {
      setStatus('loading');

      const account = getAccountForHost(hostname, state.auth);

      try {
        await markNotificationThreadAsDone(id, hostname, account.token);

        const updatedNotifications = removeNotification(
          state.settings,
          id,
          notifications,
          hostname,
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
    async (state: GitifyState, id: string, hostname: string) => {
      setStatus('loading');

      const account = getAccountForHost(hostname, state.auth);

      try {
        await ignoreNotificationThreadSubscription(id, hostname, account.token);
        await markNotificationRead(state, id, hostname);
        setStatus('success');
      } catch (err) {
        setStatus('success');
      }
    },
    [notifications],
  );

  const markRepoNotifications = useCallback(
    async (state: GitifyState, repoSlug: string, hostname: string) => {
      setStatus('loading');

      const account = getAccountForHost(hostname, state.auth);

      try {
        await markRepositoryNotificationsAsRead(
          repoSlug,
          hostname,
          account.token,
        );
        const updatedNotifications = removeNotifications(
          repoSlug,
          notifications,
          hostname,
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
    async (state: GitifyState, repoSlug: string, hostname: string) => {
      setStatus('loading');

      try {
        const accountIndex = notifications.findIndex(
          (accountNotifications) =>
            accountNotifications.account.hostname === hostname,
        );

        if (accountIndex !== -1) {
          const notificationsToRemove = notifications[
            accountIndex
          ].notifications.filter(
            (notification) => notification.repository.full_name === repoSlug,
          );

          await Promise.all(
            notificationsToRemove.map((notification) =>
              markNotificationDone(
                state,
                notification.id,
                notifications[accountIndex].account.hostname,
              ),
            ),
          );
        }

        const updatedNotifications = removeNotifications(
          repoSlug,
          notifications,
          hostname,
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

  const removeNotificationFromState = useCallback(
    (settings: SettingsState, id: string, hostname: string) => {
      const updatedNotifications = removeNotification(
        settings,
        id,
        notifications,
        hostname,
      );

      setNotifications(updatedNotifications);
      setTrayIconColor(updatedNotifications);
    },
    [notifications],
  );

  return {
    status,
    errorDetails,
    notifications,

    removeNotificationFromState,
    fetchNotifications,
    markNotificationRead,
    markNotificationDone,
    unsubscribeNotification,
    markRepoNotifications,
    markRepoNotificationsDone,
  };
};
