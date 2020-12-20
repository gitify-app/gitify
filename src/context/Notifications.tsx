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
import Constants from '../utils/constants';
import { triggerNativeNotifications } from '../utils/notifications';
import { useInterval } from '../hooks/useInterval';

interface NotificationsContextState {
  notifications: AccountNotifications[];
  fetchNotifications: () => Promise<void>;
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
      .catch((error) => {
        setIsFetching(false);
        setRequestFailed(true);
      });
  }, [accounts, notifications, settings]);

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
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
