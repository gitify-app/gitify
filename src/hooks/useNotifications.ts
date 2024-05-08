import { useCallback, useState } from 'react';

import type {
  AccountNotifications,
  AuthState,
  GitifyError,
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
import { getTokenForHost } from '../utils/helpers';
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
  fetchNotifications: (
    accounts: AuthState,
    settings: SettingsState,
  ) => Promise<void>;
  markNotificationRead: (
    accounts: AuthState,
    settings: SettingsState,
    id: string,
    hostname: string,
  ) => Promise<void>;
  markNotificationDone: (
    accounts: AuthState,
    settings: SettingsState,
    id: string,
    hostname: string,
  ) => Promise<void>;
  unsubscribeNotification: (
    accounts: AuthState,
    settings: SettingsState,
    id: string,
    hostname: string,
  ) => Promise<void>;
  markRepoNotifications: (
    accounts: AuthState,
    settings: SettingsState,
    repoSlug: string,
    hostname: string,
  ) => Promise<void>;
  markRepoNotificationsDone: (
    accounts: AuthState,
    settings: SettingsState,
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
    async (accounts: AuthState, settings: SettingsState) => {
      setStatus('loading');

      try {
        const fetchedNotifications = await getAllNotifications(
          accounts,
          settings,
        );

        setNotifications(fetchedNotifications);
        triggerNativeNotifications(
          notifications,
          fetchedNotifications,
          settings,
          accounts,
        );
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setErrorDetails(determineFailureType(err));
      }
    },
    [notifications],
  );

  const markNotificationRead = useCallback(
    async (
      accounts: AuthState,
      settings: SettingsState,
      id: string,
      hostname: string,
    ) => {
      setStatus('loading');

      const token = getTokenForHost(hostname, accounts);

      try {
        await markNotificationThreadAsRead(id, hostname, token);

        const updatedNotifications = removeNotification(
          settings,
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
    async (
      accounts: AuthState,
      settings: SettingsState,
      id: string,
      hostname: string,
    ) => {
      setStatus('loading');

      const token = getTokenForHost(hostname, accounts);

      try {
        await markNotificationThreadAsDone(id, hostname, token);

        const updatedNotifications = removeNotification(
          settings,
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
    async (
      accounts: AuthState,
      settings: SettingsState,
      id: string,
      hostname: string,
    ) => {
      setStatus('loading');

      const token = getTokenForHost(hostname, accounts);

      try {
        await ignoreNotificationThreadSubscription(id, hostname, token);
        await markNotificationRead(accounts, settings, id, hostname);
        setStatus('success');
      } catch (err) {
        setStatus('success');
      }
    },
    [notifications],
  );

  const markRepoNotifications = useCallback(
    async (
      accounts: AuthState,
      settings: SettingsState,
      repoSlug: string,
      hostname: string,
    ) => {
      setStatus('loading');

      const token = getTokenForHost(hostname, accounts);

      try {
        await markRepositoryNotificationsAsRead(repoSlug, hostname, token);
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
    async (
      accounts: AuthState,
      settings: SettingsState,
      repoSlug: string,
      hostname: string,
    ) => {
      setStatus('loading');

      try {
        const accountIndex = notifications.findIndex(
          (accountNotifications) => accountNotifications.hostname === hostname,
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
                accounts,
                settings,
                notification.id,
                notifications[accountIndex].hostname,
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
