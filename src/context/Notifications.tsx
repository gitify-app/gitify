import React, {
  useState,
  createContext,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import axios from 'axios';
import { parse } from 'url';

import { AccountNotifications } from '../types';
import { apiRequestAuth } from '../utils/api-requests';
import { AppContext } from './App';
import {
  generateGitHubAPIUrl,
  getEnterpriseAccountToken,
} from '../utils/helpers';
import { removeNotification } from '../utils/remove-notification';
import {
  setTrayIconColor,
  triggerNativeNotifications,
} from '../utils/notifications';
import { useInterval } from '../hooks/useInterval';
import Constants from '../utils/constants';

interface NotificationsContextState {
  notifications: AccountNotifications[];
  fetchNotifications: () => Promise<void>;
  markNotification: (id: string, hostname: string) => Promise<void>;
  unsubscribeNotification: (id: string, hostname: string) => Promise<void>;
  markRepoNotifications: (repoSlug: string, hostname: string) => Promise<void>;
  isFetching: boolean;
  requestFailed: boolean;
}

export const NotificationsContext = createContext<
  Partial<NotificationsContextState>
>({});

export const NotificationsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { accounts, settings } = useContext(AppContext);
  const [isFetching, setIsFetching] = useState(false);
  const [requestFailed, setRequestFailed] = useState(false);
  const [notifications, setNotifications] = useState<AccountNotifications[]>(
    []
  );

  const fetchNotifications = useCallback(async () => {
    const isGitHubLoggedIn = accounts.token !== null;
    const endpointSuffix = `notifications?participating=${settings.participating}`;

    function getGitHubNotifications() {
      if (!isGitHubLoggedIn) {
        return;
      }
      const url = `https://api.${Constants.DEFAULT_AUTH_OPTIONS.hostname}/${endpointSuffix}`;
      return apiRequestAuth(url, 'GET', accounts.token);
    }

    function getEnterpriseNotifications() {
      return accounts.enterpriseAccounts.map((account) => {
        const hostname = account.hostname;
        const token = account.token;
        const url = `https://${hostname}/api/v3/${endpointSuffix}`;
        return apiRequestAuth(url, 'GET', token);
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

          triggerNativeNotifications(notifications, data, settings);
          setNotifications(data);
          setIsFetching(false);
        })
      )
      .catch(() => {
        setIsFetching(false);
        setRequestFailed(true);
      });
  }, [accounts, notifications, settings]);

  const markNotification = useCallback(
    async (id, hostname) => {
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
      } catch (err) {
        // Skip
      }
    },
    [accounts, notifications]
  );

  const unsubscribeNotification = useCallback(
    async (id, hostname) => {
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
          { ignore: true }
        );
        await markNotification(id, hostname);
      } catch (err) {
        // Skip
      }
    },
    [accounts, notifications]
  );

  const markRepoNotifications = useCallback(
    async (repoSlug, hostname) => {
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

        const updatedNotifications = removeNotification(
          repoSlug,
          notifications,
          hostname
        );

        setNotifications(updatedNotifications);
        setTrayIconColor(updatedNotifications);
      } catch (err) {
        // Skip
      }
    },
    [accounts, notifications]
  );

  useInterval(() => {
    fetchNotifications();
  }, 60000);

  useEffect(() => {
    fetchNotifications();
  }, [settings.participating]);

  useEffect(() => {
    fetchNotifications();
  }, [accounts.token, accounts.enterpriseAccounts.length]);

  return (
    <NotificationsContext.Provider
      value={{
        isFetching,
        requestFailed,
        notifications,
        fetchNotifications,
        markNotification,
        unsubscribeNotification,
        markRepoNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
