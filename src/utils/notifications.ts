import { ipcRenderer } from 'electron';
import type {
  AccountNotifications,
  AuthState,
  GitifyState,
  SettingsState,
} from '../types';
import { Notification } from '../typesGitHub';
import { openInBrowser } from '../utils/helpers';
import { listNotificationsForAuthenticatedUser } from './api/client';
import { updateTrayIcon } from './comms';
import { isWindows } from './platform';
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
  state: GitifyState,
) => {
  const diffNotifications = newNotifications
    .map((accountNotifications) => {
      const accountPreviousNotifications = previousNotifications.find(
        (item) =>
          item.account.hostname === accountNotifications.account.hostname,
      );

      if (!accountPreviousNotifications) {
        return accountNotifications.notifications;
      }

      const accountPreviousNotificationsIds =
        accountPreviousNotifications.notifications.map((item) => item.id);

      const accountNewNotifications = accountNotifications.notifications.filter(
        (item) => {
          return !accountPreviousNotificationsIds.includes(`${item.id}`);
        },
      );

      return accountNewNotifications;
    })
    .reduce((acc, val) => acc.concat(val), []);

  setTrayIconColor(newNotifications);

  // If there are no new notifications just stop there
  if (!diffNotifications.length) {
    return;
  }

  if (state.settings.playSound) {
    raiseSoundNotification();
  }

  if (state.settings.showNotifications) {
    raiseNativeNotification(diffNotifications, state.auth);
  }
};

export const raiseNativeNotification = (
  notifications: Notification[],
  auth: AuthState,
) => {
  let title: string;
  let body: string;

  if (notifications.length === 1) {
    const notification = notifications[0];
    title = `${isWindows() ? '' : 'Gitify - '}${
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
      openInBrowser(notifications[0]);
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

function getNotifications(state: GitifyState) {
  return state.auth.accounts.map((account) => {
    return {
      account,
      notifications: listNotificationsForAuthenticatedUser(
        account,
        state.settings,
      ),
    };
  });
}

export async function getAllNotifications(
  state: GitifyState,
): Promise<AccountNotifications[]> {
  const responses = await Promise.all([...getNotifications(state)]);

  const notifications: AccountNotifications[] = await Promise.all(
    responses
      .filter((response) => !!response)
      .map(async (accountNotifications) => {
        let notifications = (await accountNotifications.notifications).data.map(
          (notification: Notification) => ({
            ...notification,
            account: accountNotifications.account,
          }),
        );

        notifications = await enrichNotifications(notifications, state);

        notifications = filterNotifications(notifications, state.settings);

        return {
          account: accountNotifications.account,
          notifications: notifications,
        };
      }),
  );

  return notifications;
}

export async function enrichNotifications(
  notifications: Notification[],
  state: GitifyState,
): Promise<Notification[]> {
  if (!state.settings.detailedNotifications) {
    return notifications;
  }

  const enrichedNotifications = await Promise.all(
    notifications.map(async (notification: Notification) => {
      const additionalSubjectDetails =
        await getGitifySubjectDetails(notification);

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
