import type { AxiosError } from 'axios';
import { useCallback, useState } from 'react';

import type {
  AccountNotifications,
  AuthState,
  GitifyError,
  SettingsState,
  Status,
} from '../types';
import type { GitHubRESTError, Notification } from '../typesGitHub';
import {
  ignoreNotificationThreadSubscription,
  listNotificationsForAuthenticatedUser,
  markNotificationThreadAsDone,
  markNotificationThreadAsRead,
  markRepositoryNotificationsAsRead,
} from '../utils/api/client';
import { determineFailureType } from '../utils/api/errors';
import Constants from '../utils/constants';
import {
  getEnterpriseAccountToken,
  getTokenForHost,
  isEnterpriseHost,
  isGitHubLoggedIn,
} from '../utils/helpers';
import {
  setTrayIconColor,
  triggerNativeNotifications,
} from '../utils/notifications';
import { removeNotification } from '../utils/remove-notification';
import { removeNotifications } from '../utils/remove-notifications';
import { getGitifySubjectDetails } from '../utils/subject';

interface NotificationsState {
  notifications: AccountNotifications[];
  removeNotificationFromState: (id: string, hostname: string) => void;
  fetchNotifications: (
    accounts: AuthState,
    settings: SettingsState,
  ) => Promise<void>;
  markNotificationRead: (
    accounts: AuthState,
    id: string,
    hostname: string,
  ) => Promise<void>;
  markNotificationDone: (
    accounts: AuthState,
    id: string,
    hostname: string,
  ) => Promise<void>;
  unsubscribeNotification: (
    accounts: AuthState,
    id: string,
    hostname: string,
  ) => Promise<void>;
  markRepoNotifications: (
    accounts: AuthState,
    repoSlug: string,
    hostname: string,
  ) => Promise<void>;
  markRepoNotificationsDone: (
    accounts: AuthState,
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
      function getGitHubNotifications() {
        if (!isGitHubLoggedIn(accounts)) {
          return;
        }

        return listNotificationsForAuthenticatedUser(
          Constants.DEFAULT_AUTH_OPTIONS.hostname,
          accounts.token,
          settings,
        );
      }

      function getEnterpriseNotifications() {
        return accounts.enterpriseAccounts.map((account) => {
          return listNotificationsForAuthenticatedUser(
            account.hostname,
            account.token,
            settings,
          );
        });
      }

      setStatus('loading');

      return Promise.all([
        getGitHubNotifications(),
        ...getEnterpriseNotifications(),
      ])
        .then((results) => {
          const [gitHubNotifications, ...entAccNotifications] = results;
          const enterpriseNotifications = entAccNotifications.map(
            (accountNotifications) => {
              const { hostname } = new URL(accountNotifications.config.url);
              return {
                hostname,
                notifications: accountNotifications.data.map(
                  (notification: Notification) => {
                    return {
                      ...notification,
                      hostname: hostname,
                    };
                  },
                ),
              };
            },
          );

          const data = isGitHubLoggedIn(accounts)
            ? [
                ...enterpriseNotifications,
                {
                  hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
                  notifications: gitHubNotifications.data.map(
                    (notification: Notification) => {
                      return {
                        ...notification,
                        hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
                      };
                    },
                  ),
                },
              ]
            : [...enterpriseNotifications];

          Promise.all(
            data.map(async (accountNotifications) => {
              return {
                hostname: accountNotifications.hostname,
                notifications: await Promise.all<Notification>(
                  accountNotifications.notifications.map(
                    async (notification: Notification) => {
                      if (!settings.detailedNotifications) {
                        return notification;
                      }

                      const token = getTokenForHost(
                        notification.hostname,
                        accounts,
                      );

                      const additionalSubjectDetails =
                        await getGitifySubjectDetails(notification, token);

                      return {
                        ...notification,
                        subject: {
                          ...notification.subject,
                          ...additionalSubjectDetails,
                        },
                      };
                    },
                  ),
                ).then((notifications) => {
                  return notifications.filter((notification) => {
                    if (
                      !settings.showBots &&
                      notification.subject?.user?.type === 'Bot'
                    ) {
                      return false;
                    }

                    return true;
                  });
                }),
              };
            }),
          ).then((parsedNotifications) => {
            setNotifications(parsedNotifications);
            triggerNativeNotifications(
              notifications,
              parsedNotifications,
              settings,
              accounts,
            );
            setStatus('success');
          });
        })
        .catch((err: AxiosError<GitHubRESTError>) => {
          setStatus('error');
          setErrorDetails(determineFailureType(err));
        });
    },
    [notifications],
  );

  const markNotificationRead = useCallback(
    async (accounts: AuthState, id: string, hostname: string) => {
      setStatus('loading');

      const isEnterprise = isEnterpriseHost(hostname);
      const token = isEnterprise
        ? getEnterpriseAccountToken(hostname, accounts.enterpriseAccounts)
        : accounts.token;

      try {
        await markNotificationThreadAsRead(id, hostname, token);

        const updatedNotifications = removeNotification(
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
    async (accounts: AuthState, id: string, hostname: string) => {
      setStatus('loading');

      const isEnterprise = isEnterpriseHost(hostname);
      const token = isEnterprise
        ? getEnterpriseAccountToken(hostname, accounts.enterpriseAccounts)
        : accounts.token;

      try {
        await markNotificationThreadAsDone(id, hostname, token);

        const updatedNotifications = removeNotification(
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
    async (accounts: AuthState, id: string, hostname: string) => {
      setStatus('loading');

      const isEnterprise = isEnterpriseHost(hostname);
      const token = isEnterprise
        ? getEnterpriseAccountToken(hostname, accounts.enterpriseAccounts)
        : accounts.token;

      try {
        await ignoreNotificationThreadSubscription(id, hostname, token);
        await markNotificationRead(accounts, id, hostname);
        setStatus('success');
      } catch (err) {
        setStatus('success');
      }
    },
    [notifications],
  );

  const markRepoNotifications = useCallback(
    async (accounts: AuthState, repoSlug: string, hostname: string) => {
      setStatus('loading');

      const isEnterprise = isEnterpriseHost(hostname);
      const token = isEnterprise
        ? getEnterpriseAccountToken(hostname, accounts.enterpriseAccounts)
        : accounts.token;

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
    async (accounts: AuthState, repoSlug: string, hostname: string) => {
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
    (id: string, hostname: string) => {
      const updatedNotifications = removeNotification(
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
