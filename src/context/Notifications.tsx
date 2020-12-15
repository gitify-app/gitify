import React, { useState, createContext, useCallback } from 'react';

import { AccountNotifications } from '../types';

interface NotificationsContextState {
  notifications: AccountNotifications[];
  fetchNotifications: () => Promise<void>;
  isFetching: boolean;
}

export const NotificationsContext = createContext<
  Partial<NotificationsContextState>
>({});

export const NotificationsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isFetching, setIsFetching] = useState(false);
  const [notifications, setNotifications] = useState<AccountNotifications[]>(
    []
  );

  const fetchNotifications = useCallback(async () => {
    //
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        isFetching,
        notifications,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
