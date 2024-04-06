import axios, { AxiosError } from 'axios';
import { useCallback, useState } from 'react';

import {
  AccountNotifications,
  AuthState,
  SettingsState,
  FailureType,
} from '../types';
import { GithubRESTError, Notification } from '../typesGithub';
import { apiRequestAuth } from '../utils/api-requests';
import {
  getEnterpriseAccountToken,
  generateGitHubAPIUrl,
  isEnterpriseHost,
  getTokenForHost,
} from '../utils/helpers';
import { removeNotification } from '../utils/remove-notification';
import {
  triggerNativeNotifications,
  setTrayIconColor,
} from '../utils/notifications';
import Constants from '../utils/constants';
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
  isFetching: boolean;
  requestFailed: boolean;
  failureType: FailureType;
}

export const useNotifications = (colors: boolean): NotificationsState => {
  const [isFetching, setIsFetching] = useState(false);
  const [requestFailed, setRequestFailed] = useState(false);
  const [failureType, setFailureType] = useState<FailureType>('NONE');

  const [notifications, setNotifications] = useState<AccountNotifications[]>(
    [],
  );

  const fetchNotifications = useCallback(
    async (accounts: AuthState, settings: SettingsState) => {
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
      setFailureType('NONE');
      setRequestFailed(false);

      return axios
        .all([getGitHubNotifications(), ...getEnterpriseNotifications()])
        .then(
          axios.spread((gitHubNotifications, ...entAccNotifications) => {
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
            const data = isGitHubLoggedIn
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
                    notifications: await axios
                      .all<Notification>(
                        accountNotifications.notifications.map(
                          async (notification: Notification) => {
                            const token = getTokenForHost(
                              notification.hostname,
                              accounts,
                            );

                            const additionalSubjectDetails =
                              await getGitifySubjectDetails(
                                notification,
                                token,
                              );

                            return {
                              ...notification,
                              subject: {
                                ...notification.subject,
                                ...additionalSubjectDetails,
                              },
                            };
                          },
                        ),
                      )
                      .then((notifications) => {
                        return notifications.filter((notification) => {
                          if (
                            !settings.showBots &&
                            notification.subject?.user.type === 'Bot'
                          ) {
                            return false;
                          }

                          return true;
                        });
                      }),
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
        .catch((err: AxiosError) => {
          console.log(JSON.stringify(err));
          let failureType: FailureType = 'UNKNOWN';

          const data = err.response.data as GithubRESTError;

          if (err.response.status === 401) {
            failureType = 'BAD_CREDENTIALS';
          } else if (err.response.status === 403) {
            if (
              data.message.includes('API rate limit exceeded') ||
              data.message.includes('You have exceeded a secondary rate limit')
            ) {
              failureType = 'RATE_LIMIT';
            } else if (
              data.message.includes("Missing the 'notifications' scope")
            ) {
              failureType = 'MISSING_SCOPES';
            }
          }

          setIsFetching(false);
          setFailureType(failureType);
          setRequestFailed(true);
        });
    },
    [notifications],
  );

  const markNotificationRead = useCallback(
    async (accounts: AuthState, id: string, hostname: string) => {
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

        setNotifications(updatedNotifications);
        setTrayIconColor(updatedNotifications);
        setIsFetching(false);
      } catch (err) {
        setIsFetching(false);
      }
    },
    [notifications],
  );

  const markNotificationDone = useCallback(
    async (accounts: AuthState, id: string, hostname: string) => {
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

        setNotifications(updatedNotifications);
        setTrayIconColor(updatedNotifications);
        setIsFetching(false);
      } catch (err) {
        setIsFetching(false);
      }
    },
    [notifications],
  );

  const unsubscribeNotification = useCallback(
    async (accounts: AuthState, id: string, hostname: string) => {
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
        await markNotificationRead(accounts, id, hostname);
      } catch (err) {
        setIsFetching(false);
      }
    },
    [notifications],
  );

  const markRepoNotifications = useCallback(
    async (accounts: AuthState, repoSlug: string, hostname: string) => {
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
        setTrayIconColor(updatedNotifications);
        setIsFetching(false);
      } catch (err) {
        setIsFetching(false);
      }
    },
    [notifications],
  );

  const markRepoNotificationsDone = useCallback(
    async (accounts: AuthState, repoSlug: string, hostname: string) => {
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
        setIsFetching(false);
      } catch (err) {
        setIsFetching(false);
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
    isFetching,
    requestFailed,
    failureType,
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
