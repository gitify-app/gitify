import type { AxiosError } from 'axios';
import { useCallback, useState } from 'react';

import { formatDistanceToNow, parseISO } from 'date-fns';
import type {
  AccountNotifications,
  AuthState,
  GitifyError,
  GitifyNotification,
  SettingsState,
  Status,
} from '../types';
import type {
  GitHubRESTError,
  GitifySubject,
  Notification,
} from '../typesGitHub';
import {
  ignoreNotificationThreadSubscription,
  listNotificationsForAuthenticatedUser,
  markNotificationThreadAsDone,
  markNotificationThreadAsRead,
  markRepositoryNotificationsAsRead,
} from '../utils/api/client';
import { determineFailureType } from '../utils/api/errors';
import Constants from '../utils/constants';
import { getTokenForHost, isGitHubLoggedIn } from '../utils/helpers';
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
        .then(([...responses]) => {
          const rawAccountsNotifications = responses
            .filter((response) => !!response)
            .map((accountNotifications) => {
              const { hostname } = new URL(accountNotifications.config.url);

              return {
                hostname,
                notifications: accountNotifications.data,
              };
            });

          Promise.all(
            rawAccountsNotifications.map(async (accountNotifications) => {
              return {
                hostname: accountNotifications.hostname,
                notifications: await Promise.all<GitifyNotification>(
                  accountNotifications.notifications.map(
                    async (notification: Notification) => {
                      return mapToGitifyNotification(
                        notification,
                        getTokenForHost(
                          accountNotifications.hostname,
                          accounts,
                        ),
                        settings,
                      );
                    },
                  ),
                ),
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

      const token = getTokenForHost(hostname, accounts);

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

      const token = getTokenForHost(hostname, accounts);

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

      const token = getTokenForHost(hostname, accounts);

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
    // TODO - this may need to change
    html_url: notification.subject.html_url ?? notification.repository.html_url,
    repository: {
      full_name: notification.repository.full_name,
      html_url: notification.repository.html_url,
      avatar_url: notification.repository.owner.avatar_url,
      owner: {
        avatar_url: notification.repository.owner.avatar_url,
      },
    },
    state: notification.subject?.state,
    user: notification.subject?.user,
    icon: {
      type: getNotificationTypeIcon(notification.subject),
      color: getNotificationTypeIconColor(notification.subject),
    },
  };
}
