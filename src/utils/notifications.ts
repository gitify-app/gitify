import { ipcRenderer } from 'electron';
import { Notification } from '../typesGitHub';
import { isGitHubLoggedIn, openInBrowser } from '../utils/helpers';
import { updateTrayIcon } from './comms';

import type { AccountNotifications, AuthState, SettingsState } from '../types';
import { listNotificationsForAuthenticatedUser } from './api/client';
import Constants from './constants';
import { getGitifySubjectDetails } from './subject';

export const setTrayIconColor = (notifications: AccountNotifications[]) => {
  const allNotificationsCount = getNotificationCount(notifications);

  updateTrayIcon(allNotificationsCount);
};

export function getNotificationCount(notifications: AccountNotifications[]) {
  return notifications.reduce(
    (memo, acc) => memo + acc.notifications.length,
    0,
  );
}

export const triggerNativeNotifications = (
  previousNotifications: AccountNotifications[],
  newNotifications: AccountNotifications[],
  settings: SettingsState,
  accounts: AuthState,
) => {
  const diffNotifications = newNotifications
    .map((account) => {
      const accountPreviousNotifications = previousNotifications.find(
        (item) => item.hostname === account.hostname,
      );

      if (!accountPreviousNotifications) {
        return account.notifications;
      }

      const accountPreviousNotificationsIds =
        accountPreviousNotifications.notifications.map((item) => item.id);

      const accountNewNotifications = account.notifications.filter((item) => {
        return !accountPreviousNotificationsIds.includes(`${item.id}`);
      });

      return accountNewNotifications;
    })
    .reduce((acc, val) => acc.concat(val), []);

  setTrayIconColor(newNotifications);

  // If there are no new notifications just stop there
  if (!diffNotifications.length) {
    return;
  }

  if (settings.playSound) {
    raiseSoundNotification();
  }

  if (settings.showNotifications) {
    raiseNativeNotification(diffNotifications, accounts);
  }
};

export const raiseNativeNotification = (
  notifications: Notification[],
  accounts: AuthState,
) => {
  let title: string;
  let body: string;

  if (notifications.length === 1) {
    const notification = notifications[0];
    title = `${process.platform !== 'win32' ? 'Gitify - ' : ''}${
      notification.repository.full_name
    }`;
    body = notification.subject.title;
  } else {
    title = 'Gitify';
    body = `You have ${notifications.length} notifications.`;
  }

  const nativeNotification = new Notification(title, {
    body,
    silent: true,
  });

  nativeNotification.onclick = () => {
    if (notifications.length === 1) {
      ipcRenderer.send('hide-window');
      openInBrowser(notifications[0], accounts);
    } else {
      ipcRenderer.send('reopen-window');
    }
  };

  return nativeNotification;
};

export const raiseSoundNotification = () => {
  const audio = new Audio('assets/sounds/clearly.mp3');
  audio.volume = 0.2;
  audio.play();
};

function getGitHubNotifications(accounts: AuthState, settings: SettingsState) {
  if (!isGitHubLoggedIn(accounts)) {
    return;
  }

  return listNotificationsForAuthenticatedUser(
    Constants.DEFAULT_AUTH_OPTIONS.hostname,
    accounts.token,
    settings,
  );
}

function getEnterpriseNotifications(
  accounts: AuthState,
  settings: SettingsState,
) {
  return accounts.enterpriseAccounts.map((account) => {
    return listNotificationsForAuthenticatedUser(
      account.hostname,
      account.token,
      settings,
    );
  });
}

export async function getAllNotifications(
  accounts: AuthState,
  settings: SettingsState,
): Promise<AccountNotifications[]> {
  const responses = await Promise.all([
    getGitHubNotifications(accounts, settings),
    ...getEnterpriseNotifications(accounts, settings),
  ]);

  const notifications: AccountNotifications[] = await Promise.all(
    responses
      .filter((response) => !!response)
      .map(async (accountNotifications) => {
        const { hostname } = new URL(accountNotifications.config.url);

        let notifications = accountNotifications.data.map(
          (notification: Notification) => ({
            ...notification,
            hostname,
          }),
        );

        notifications = await enrichNotifications(
          notifications,
          accounts,
          settings,
        );

        notifications = filterNotifications(notifications, settings);

        return {
          hostname,
          notifications: notifications,
        };
      }),
  );

  return notifications;
}

export async function enrichNotifications(
  notifications: Notification[],
  accounts: AuthState,
  settings: SettingsState,
): Promise<Notification[]> {
  if (!settings.detailedNotifications) {
    return notifications;
  }

  const enrichedNotifications = await Promise.all(
    notifications.map(async (notification: Notification) => {
      const additionalSubjectDetails = await getGitifySubjectDetails(
        notification,
        accounts,
      );

      return {
        ...notification,
        subject: {
          ...notification.subject,
          ...additionalSubjectDetails,
        },
      };
    }),
  );

  return enrichedNotifications;
}

export function filterNotifications(
  notifications: Notification[],
  settings: SettingsState,
): Notification[] {
  return notifications.filter((notification) => {
    if (!settings.showBots && notification.subject?.user?.type === 'Bot') {
      return false;
    }
    return true;
  });
}
