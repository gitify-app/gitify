import axios, { type AxiosError, type AxiosPromise } from 'axios';
import { useCallback, useState } from 'react';

import { RocketIcon } from '@primer/octicons-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import type {
  AccountNotifications,
  AuthState,
  GitifyError,
  GitifyNotification,
  SettingsState,
} from '../types';
import type { GithubRESTError, Notification } from '../typesGithub';
import { apiRequestAuth } from '../utils/api-requests';
import Constants, { Errors } from '../utils/constants';
import {
  formatReason,
  getNotificationTypeIcon,
  getNotificationTypeIconColor,
} from '../utils/github-api';
import {
  generateGitHubAPIUrl,
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
  isFetching: boolean;
  requestFailed: boolean;
  errorDetails: GitifyError;
}

export const useNotifications = (): NotificationsState => {
  const [isFetching, setIsFetching] = useState(false);
  const [requestFailed, setRequestFailed] = useState(false);
  const [errorDetails, setErrorDetails] = useState<GitifyError>();

  const [notifications, setNotifications] = useState<AccountNotifications[]>(
    [],
  );

  const fetchNotifications = useCallback(
    async (accounts: AuthState, settings: SettingsState) => {
      function getNotifications(hostname: string, token: string): AxiosPromise {
        const endpointSuffix = `notifications?participating=${settings.participating}`;
        const url = `${generateGitHubAPIUrl(hostname)}${endpointSuffix}`;
        return apiRequestAuth(url, 'GET', token);
      }

      function getGitHubNotifications() {
        if (!isGitHubLoggedIn(accounts)) {
          return;
        }
        return getNotifications(
          Constants.DEFAULT_AUTH_OPTIONS.hostname,
          accounts.token,
        );
      }

      function getEnterpriseNotifications() {
        return accounts.enterpriseAccounts.map((account) => {
          return getNotifications(account.hostname, account.token);
        });
      }

      setIsFetching(true);

      return axios
        .all([getGitHubNotifications(), ...getEnterpriseNotifications()])
        .then(
          axios.spread((gitHubNotifications, ...entAccNotifications) => {
            setRequestFailed(false);
            const enterpriseNotifications = entAccNotifications.map(
              (accountNotifications) => {
                const { hostname } = new URL(accountNotifications.config.url);
                return {
                  hostname,
                  notifications: accountNotifications.data.map(
                    (notification: Notification) => {
                      return mapToGitifyNotification(notification, hostname);
                    },
                  ) as GitifyNotification[],
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
                        return mapToGitifyNotification(
                          notification,
                          Constants.DEFAULT_AUTH_OPTIONS.hostname,
                        );
                      },
                    ) as GitifyNotification[],
                  },
                ]
              : [...enterpriseNotifications];

            axios
              .all(
                data.map(async (accountNotifications: AccountNotifications) => {
                  return {
                    hostname: accountNotifications.hostname,
                    notifications: await axios
                      .all<GitifyNotification>(
                        accountNotifications.notifications.map(
                          async (notification: GitifyNotification) => {
                            // if (!settings.detailedNotifications) {
                            return notification;
                            // }
                            /*

                            const token = getTokenForHost(
                              notification.hostname,
                              accounts,
                            );

                            // include this also in the same call
                            await generateGitHubWebUrl(notification, accounts)

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
                            */
                          },
                        ),
                      )
                      .then((notifications) => {
                        return notifications.filter((notification) => {
                          if (
                            !settings.showBots &&
                            notification?.user?.type === 'Bot'
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
        .catch((err: AxiosError<GithubRESTError>) => {
          setIsFetching(false);
          setRequestFailed(true);
          setErrorDetails(determineFailureType(err));
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

function mapToGitifyNotification(
  notification: Notification,
  hostname: string,
): GitifyNotification {
  const formattedReason = formatReason(notification.reason);
  // const icon = getNotificationTypeIcon(notification.subject);
  // const color = getNotificationTypeIconColor(notification.subject);

  return {
    hostname: hostname,
    id: notification.id,
    title: notification.subject.title,
    type: notification.subject.type,
    reason: {
      code: notification.reason,
      type: formattedReason.type,
      description: formattedReason.description,
    },
    unread: notification.unread,
    updated_at: {
      raw: notification.updated_at,
      formatted: formatDistanceToNow(parseISO(notification.updated_at), {
        addSuffix: true,
      }),
    },
    url: notification.repository.html_url, // default notification url
    repository: {
      full_name: notification.repository.full_name,
      html_url: notification.repository.html_url,
      avatar_url: notification.repository.owner.avatar_url,
    },
    // FIXME: TEMPORARILY HARDCODED
    icon: {
      type: RocketIcon,
      color: 'text-green-500',
    },
  };
}

function determineFailureType(err: AxiosError<GithubRESTError>): GitifyError {
  const status = err.response.status;
  const message = err.response.data.message;

  if (status === 401) {
    return Errors.BAD_CREDENTIALS;
  }

  if (status === 403) {
    if (message.includes("Missing the 'notifications' scope")) {
      return Errors.MISSING_SCOPES;
    }

    if (
      message.includes('API rate limit exceeded') ||
      message.includes('You have exceeded a secondary rate limit')
    ) {
      return Errors.RATE_LIMITED;
    }
  }

  return Errors.UNKNOWN;
}
