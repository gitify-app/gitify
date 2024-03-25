import axios from 'axios';
import { parse } from 'url';
import { useCallback, useState } from 'react';

import { AccountNotifications, AuthState, SettingsState } from '../types';
import { Notification } from '../typesGithub';
import { apiRequestAuth } from '../utils/api-requests';
import {
  getEnterpriseAccountToken,
  generateGitHubAPIUrl,
  isEnterpriseHost,
} from '../utils/helpers';
import { removeNotification } from '../utils/remove-notification';
import { triggerNativeNotifications } from '../utils/notifications';
import Constants from '../utils/constants';
import { removeNotifications } from '../utils/remove-notifications';
import { updateTrayIcon } from '../utils/comms';
import { getGitifySubjectDetails } from '../utils/subject';

interface NotificationsState {
  notifications: AccountNotifications[];
  removeNotificationFromState: (
    id: string,
    hostname: string,
    settings: SettingsState,
  ) => void;
  fetchNotifications: (
    accounts: AuthState,
    settings: SettingsState,
  ) => Promise<void>;
  markNotification: (
    accounts: AuthState,
    id: string,
    hostname: string,
    settings: SettingsState,
  ) => Promise<void>;
  markNotificationDone: (
    accounts: AuthState,
    id: string,
    hostname: string,
    settings: SettingsState,
  ) => Promise<void>;
  unsubscribeNotification: (
    accounts: AuthState,
    id: string,
    hostname: string,
    settings: SettingsState,
  ) => Promise<void>;
  markRepoNotifications: (
    accounts: AuthState,
    repoSlug: string,
    hostname: string,
    settings: SettingsState,
  ) => Promise<void>;
  markRepoNotificationsDone: (
    accounts: AuthState,
    repoSlug: string,
    hostname: string,
    settings: SettingsState,
  ) => Promise<void>;
  isFetching: boolean;
  requestFailed: boolean;
}

export const useNotifications = (colors: boolean): NotificationsState => {
  const [isFetching, setIsFetching] = useState(false);
  const [requestFailed, setRequestFailed] = useState(false);
  const [notifications, setNotifications] = useState<AccountNotifications[]>(
    [],
  );

  const fetchNotifications = useCallback(
    async (accounts: AuthState, settings) => {
      const isGitHubLoggedIn = accounts.token !== null;
      const endpointSuffix = `notifications?participating=${settings.participating}`;

      function getGitHubNotifications() {
        if (!isGitHubLoggedIn) {
          return;
        }
        const url = `${generateGitHubAPIUrl(
          Constants.DEFAULT_AUTH_OPTIONS.hostname,
        )}${endpointSuffix}`;
        return apiRequestAuth(url, 'GET', accounts.token);
      }

      function getEnterpriseNotifications() {
        return accounts.enterpriseAccounts.map((account) => {
          const url = `${generateGitHubAPIUrl(
            account.hostname,
          )}${endpointSuffix}`;
          return apiRequestAuth(url, 'GET', account.token);
        });
      }

      setIsFetching(true);
      setRequestFailed(false);

      return axios
        .all([getGitHubNotifications(), ...getEnterpriseNotifications()])
        .then(
          axios.spread((gitHubNotifications, ...entAccNotifications) => {
            const enterpriseNotifications = entAccNotifications.map(
              (accountNotifications) => {
                const { hostname } = parse(accountNotifications.config.url);
                return {
                  hostname,
                  notifications: accountNotifications.data,
                };
              },
            );
            const data = isGitHubLoggedIn
              ? [
                  ...enterpriseNotifications,
                  {
                    hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
                    notifications: gitHubNotifications.data,
                  },
                ]
              : [...enterpriseNotifications];

            if (colors === false) {
              setNotifications(data);
              triggerNativeNotifications(
                notifications,
                data,
                settings,
                accounts,
              );
              setIsFetching(false);
              return;
            }
            axios
              .all(
                data.map(async (accountNotifications) => {
                  return {
                    hostname: accountNotifications.hostname,
                    notifications: await axios.all<Notification>(
                      accountNotifications.notifications.map(
                        async (notification: Notification) => {
                          const isEnterprise = isEnterpriseHost(
                            accountNotifications.hostname,
                          );
                          const token = isEnterprise
                            ? getEnterpriseAccountToken(
                                accountNotifications.hostname,
                                accounts.enterpriseAccounts,
                              )
                            : accounts.token;

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
                    ),
                  };
                }),
              )
              .then((parsedNotifications) => {
                setNotifications(parsedNotifications);
                triggerNativeNotifications(
                  notifications,
                  parsedNotifications,
                  settings,
                  accounts,
                );
                setIsFetching(false);
              });
          }),
        )
        .catch(() => {
          setIsFetching(false);
          setRequestFailed(true);
        });
    },
    [notifications],
  );

  const markNotification = useCallback(
    async (accounts, id, hostname, settings) => {
      setIsFetching(true);

      const isEnterprise = isEnterpriseHost(hostname);
      const token = isEnterprise
        ? getEnterpriseAccountToken(hostname, accounts.enterpriseAccounts)
        : accounts.token;

      try {
        await apiRequestAuth(
          `${generateGitHubAPIUrl(hostname)}notifications/threads/${id}`,
          'PATCH',
          token,
          {},
        );

        const updatedNotifications = removeNotification(
          id,
          notifications,
          hostname,
        );

        const updatedNotificationsCount = updatedNotifications.reduce(
          (memo, acc) => memo + acc.notifications.length,
          0,
        );

        setNotifications(updatedNotifications);
        updateTrayIcon({
          notificationsCount: updatedNotificationsCount,
          showNotificationsCountInTray: settings.showNotificationsCountInTray,
        });
        setIsFetching(false);
      } catch (err) {
        setIsFetching(false);
      }
    },
    [notifications],
  );

  const markNotificationDone = useCallback(
    async (accounts, id, hostname, settings) => {
      setIsFetching(true);

      const isEnterprise = isEnterpriseHost(hostname);
      const token = isEnterprise
        ? getEnterpriseAccountToken(hostname, accounts.enterpriseAccounts)
        : accounts.token;

      try {
        await apiRequestAuth(
          `${generateGitHubAPIUrl(hostname)}notifications/threads/${id}`,
          'DELETE',
          token,
          {},
        );

        const updatedNotifications = removeNotification(
          id,
          notifications,
          hostname,
        );

        const updatedNotificationsCount = updatedNotifications.reduce(
          (memo, acc) => memo + acc.notifications.length,
          0,
        );

        setNotifications(updatedNotifications);
        updateTrayIcon({
          notificationsCount: updatedNotificationsCount,
          showNotificationsCountInTray: settings.showNotificationsCountInTray,
        });
        setIsFetching(false);
      } catch (err) {
        setIsFetching(false);
      }
    },
    [notifications],
  );

  const unsubscribeNotification = useCallback(
    async (accounts, id, hostname, settings) => {
      setIsFetching(true);

      const isEnterprise = isEnterpriseHost(hostname);
      const token = isEnterprise
        ? getEnterpriseAccountToken(hostname, accounts.enterpriseAccounts)
        : accounts.token;

      try {
        await apiRequestAuth(
          `${generateGitHubAPIUrl(
            hostname,
          )}notifications/threads/${id}/subscription`,
          'PUT',
          token,
          { ignored: true },
        );
        await markNotification(accounts, id, hostname, settings);
      } catch (err) {
        setIsFetching(false);
      }
    },
    [notifications],
  );

  const markRepoNotifications = useCallback(
    async (accounts, repoSlug, hostname, settings) => {
      setIsFetching(true);

      const isEnterprise = isEnterpriseHost(hostname);
      const token = isEnterprise
        ? getEnterpriseAccountToken(hostname, accounts.enterpriseAccounts)
        : accounts.token;

      try {
        await apiRequestAuth(
          `${generateGitHubAPIUrl(hostname)}repos/${repoSlug}/notifications`,
          'PUT',
          token,
          {},
        );

        const updatedNotifications = removeNotifications(
          repoSlug,
          notifications,
          hostname,
        );

        setNotifications(updatedNotifications);

        const updatedNotificationsCount = updatedNotifications.reduce(
          (memo, acc) => memo + acc.notifications.length,
          0,
        );
        updateTrayIcon({
          notificationsCount: updatedNotificationsCount,
          showNotificationsCountInTray: settings.showNotificationsCountInTray,
        });

        setIsFetching(false);
      } catch (err) {
        setIsFetching(false);
      }
    },
    [notifications],
  );

  const markRepoNotificationsDone = useCallback(
    async (accounts, repoSlug, hostname, settings) => {
      setIsFetching(true);

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
                settings,
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

        const updatedNotificationsCount = updatedNotifications.reduce(
          (memo, acc) => memo + acc.notifications.length,
          0,
        );
        updateTrayIcon({
          notificationsCount: updatedNotificationsCount,
          showNotificationsCountInTray: settings.showNotificationsCountInTray,
        });

        setIsFetching(false);
      } catch (err) {
        setIsFetching(false);
      }
    },
    [notifications],
  );

  const removeNotificationFromState = useCallback(
    (id, hostname, settings) => {
      const updatedNotifications = removeNotification(
        id,
        notifications,
        hostname,
      );

      setNotifications(updatedNotifications);

      const updatedNotificationsCount = updatedNotifications.reduce(
        (memo, acc) => memo + acc.notifications.length,
        0,
      );
      updateTrayIcon({
        notificationsCount: updatedNotificationsCount,
        showNotificationsCountInTray: settings.showNotificationsCountInTray,
      });
    },
    [notifications],
  );

  return {
    isFetching,
    requestFailed,
    notifications,

    removeNotificationFromState,
    fetchNotifications,
    markNotification,
    markNotificationDone,
    unsubscribeNotification,
    markRepoNotifications,
    markRepoNotificationsDone,
  };
};
