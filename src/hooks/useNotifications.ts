import axios, { type AxiosError, type AxiosPromise } from 'axios';
import { useCallback, useState } from 'react';

import { formatDistanceToNow, parseISO } from 'date-fns';
import type {
  AccountNotifications,
  AccountNotifications,
  AuthState,
  GitifyError,
  GitifyNotification,
  SettingsState,
} from '../types';
import type {
  GithubRESTError,
  GitifySubject,
  Notification,
} from '../typesGithub';
import { apiRequestAuth } from '../utils/api-requests';
import { determineFailureType } from '../utils/api/errors';
import Constants from '../utils/constants';
import {
  generateGitHubAPIUrl,
  getEnterpriseAccountToken,
  getTokenForHost,
  isEnterpriseHost,
  isGitHubLoggedIn,
} from '../utils/helpers';
import {
  getNotificationTypeIcon,
  getNotificationTypeIconColor,
} from '../utils/icons';
import {
  setTrayIconColor,
  triggerNativeNotifications,
} from '../utils/notifications';
import { formatReason } from '../utils/reason';
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
      function getNotifications(hostname: string, token: string): AxiosPromise<Notification[]> {
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

                            // const gitifyNotification = await mapToGitifyNotification(notification, token, settings);)
                           
                            return notification;                            
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

async function mapToGitifyNotification(
  notification: Notification,
  token: string,
  settings: SettingsState,
): Promise<GitifyNotification> {
  let extraSubjectDetails: GitifySubject;

  if (settings.detailedNotifications) {
    extraSubjectDetails = await getGitifySubjectDetails(notification, token);

    notification.subject.state = extraSubjectDetails.state;
    notification.subject.user = extraSubjectDetails.user;
    notification.subject.html_url = extraSubjectDetails.user.html_url;
  }

  const formattedReason = formatReason(notification.reason);

  return {
    hostname: notification.hostname,
    id: notification.id,
    title: notification.subject.title,
    type: notification.subject.type,
    reason: {
      code: notification.reason,
      type: formattedReason.title,
      description: formattedReason.description,
    },
    unread: notification.unread,
    updated_at: {
      raw: notification.updated_at,
      formatted: formatDistanceToNow(parseISO(notification.updated_at), {
        addSuffix: true,
      }),
    },
    url: notification.subject.html_url ?? notification.repository.html_url,
    repository: {
      full_name: notification.repository.full_name,
      html_url: notification.repository.html_url,
      avatar_url: notification.repository.owner.avatar_url,
    },
    state: notification.subject?.state,
    user: notification.subject?.user,
    icon: {
      type: getNotificationTypeIcon(notification.subject),
      color: getNotificationTypeIconColor(notification.subject),
    },
  };
}
