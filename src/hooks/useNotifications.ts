import axios from 'axios';
import { parse } from 'url';
import { useCallback, useState } from 'react';

import { AccountNotifications, AuthState, SettingsState } from '../types';
import { Notification } from '../typesGithub';
import { apiRequestAuth } from '../utils/api-requests';
import {
  getEnterpriseAccountToken,
  generateGitHubAPIUrl,
} from '../utils/helpers';
import { removeNotification } from '../utils/remove-notification';
import {
  triggerNativeNotifications,
  setTrayIconColor,
} from '../utils/notifications';
import Constants from '../utils/constants';
import { removeNotifications } from '../utils/remove-notifications';

interface NotificationsState {
  notifications: AccountNotifications[];
  fetchNotifications: (
    accounts: AuthState,
    settings: SettingsState
  ) => Promise<void>;
  markNotification: (
    accounts: AuthState,
    id: string,
    hostname: string
  ) => Promise<void>;
  unsubscribeNotification: (
    accounts: AuthState,
    id: string,
    hostname: string
  ) => Promise<void>;
  markRepoNotifications: (
    accounts: AuthState,
    repoSlug: string,
    hostname: string
  ) => Promise<void>;
  isFetching: boolean;
  requestFailed: boolean;
}

export const useNotifications = (colors: boolean): NotificationsState => {
  const [isFetching, setIsFetching] = useState(false);
  const [requestFailed, setRequestFailed] = useState(false);
  const [notifications, setNotifications] = useState<AccountNotifications[]>(
    []
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
          Constants.DEFAULT_AUTH_OPTIONS.hostname
        )}${endpointSuffix}`;
        return apiRequestAuth(url, 'GET', accounts.token);
      }

      function getEnterpriseNotifications() {
        return accounts.enterpriseAccounts.map((account) => {
          const url = `${generateGitHubAPIUrl(
            account.hostname
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
              }
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

            if (!colors) {
              setNotifications(data);
              triggerNativeNotifications(
                notifications,
                data,
                settings,
                accounts
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
                          if (
                            notification.subject.type !== 'PullRequest' &&
                            notification.subject.type !== 'Issue'
                          ) {
                            return notification;
                          }

                          const cardinalData = (
                            await apiRequestAuth(
                              notification.subject.url,
                              'GET',
                              accounts.token
                            )
                          ).data;

                          const state =
                            cardinalData.state === 'closed'
                              ? cardinalData.state_reason ||
                                (cardinalData.merged && 'merged') ||
                                'closed'
                              : (cardinalData.draft && 'draft') || 'open';

                          return {
                            ...notification,
                            subject: {
                              ...notification.subject,
                              state,
                            },
                          };
                        }
                      )
                    ),
                  };
                })
              )
              .then((parsedNotifications) => {
                setNotifications(parsedNotifications);
                triggerNativeNotifications(
                  notifications,
                  parsedNotifications,
                  settings,
                  accounts
                );
                setIsFetching(false);
              });
          })
        )
        .catch(() => {
          setIsFetching(false);
          setRequestFailed(true);
        });
    },
    [notifications]
  );

  const markNotification = useCallback(
    async (accounts, id, hostname) => {
      setIsFetching(true);

      const isEnterprise = hostname !== Constants.DEFAULT_AUTH_OPTIONS.hostname;
      const token = isEnterprise
        ? getEnterpriseAccountToken(hostname, accounts.enterpriseAccounts)
        : accounts.token;

      try {
        await apiRequestAuth(
          `${generateGitHubAPIUrl(hostname)}notifications/threads/${id}`,
          'PATCH',
          token,
          {}
        );

        const updatedNotifications = removeNotification(
          id,
          notifications,
          hostname
        );

        setNotifications(updatedNotifications);
        setTrayIconColor(updatedNotifications);
        setIsFetching(false);
      } catch (err) {
        setIsFetching(false);
      }
    },
    [notifications]
  );

  const unsubscribeNotification = useCallback(
    async (accounts, id, hostname) => {
      setIsFetching(true);

      const isEnterprise = hostname !== Constants.DEFAULT_AUTH_OPTIONS.hostname;
      const token = isEnterprise
        ? getEnterpriseAccountToken(hostname, accounts.enterpriseAccounts)
        : accounts.token;

      try {
        await apiRequestAuth(
          `${generateGitHubAPIUrl(
            hostname
          )}notifications/threads/${id}/subscription`,
          'PUT',
          token,
          { ignored: true }
        );
        await markNotification(accounts, id, hostname);
      } catch (err) {
        setIsFetching(false);
      }
    },
    [notifications]
  );

  const markRepoNotifications = useCallback(
    async (accounts, repoSlug, hostname) => {
      setIsFetching(true);

      const isEnterprise = hostname !== Constants.DEFAULT_AUTH_OPTIONS.hostname;
      const token = isEnterprise
        ? getEnterpriseAccountToken(hostname, accounts.enterpriseAccounts)
        : accounts.token;

      try {
        await apiRequestAuth(
          `${generateGitHubAPIUrl(hostname)}repos/${repoSlug}/notifications`,
          'PUT',
          token,
          {}
        );

        const updatedNotifications = removeNotifications(
          repoSlug,
          notifications,
          hostname
        );

        setNotifications(updatedNotifications);
        setTrayIconColor(updatedNotifications);
        setIsFetching(false);
      } catch (err) {
        setIsFetching(false);
      }
    },
    [notifications]
  );

  return {
    isFetching,
    requestFailed,
    notifications,

    fetchNotifications,
    markNotification,
    unsubscribeNotification,
    markRepoNotifications,
  };
};
