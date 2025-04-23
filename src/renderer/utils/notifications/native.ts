import path from 'node:path';

import { APPLICATION } from '../../../shared/constants';
import { isWindows } from '../../../shared/platform';
import { defaultSettings } from '../../context/App';
import type { AccountNotifications, GitifyState } from '../../types';
import { Notification } from '../../typesGitHub';
import { getAccountUUID } from '../auth/utils';
import { hideWindow, showWindow } from '../comms';
import { Constants } from '../constants';
import { openNotification } from '../links';
import { setTrayIconColor } from './notifications';

export const triggerNativeNotifications = (
  previousNotifications: AccountNotifications[],
  newNotifications: AccountNotifications[],
  state: GitifyState,
) => {
  const diffNotifications = newNotifications
    .map((accountNotifications) => {
      const accountPreviousNotifications = previousNotifications.find(
        (item) =>
          getAccountUUID(item.account) ===
          getAccountUUID(accountNotifications.account),
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
    raiseSoundNotification(state.settings.notificationVolume / 100);
  }

  if (state.settings.showNotifications) {
    raiseNativeNotification(diffNotifications);
  }
};

export const raiseNativeNotification = (notifications: Notification[]) => {
  let title: string;
  let body: string;

  if (notifications.length === 1) {
    const notification = notifications[0];
    title = isWindows() ? '' : notification.repository.full_name;
    body = notification.subject.title;
  } else {
    title = APPLICATION.NAME;
    body = `You have ${notifications.length} notifications.`;
  }

  const nativeNotification = new Notification(title, {
    body,
    silent: true,
  });

  nativeNotification.onclick = () => {
    if (notifications.length === 1) {
      hideWindow();
      openNotification(notifications[0]);
    } else {
      showWindow();
    }
  };

  return nativeNotification;
};

export const raiseSoundNotification = (
  volume = defaultSettings.notificationVolume / 100,
) => {
  const audio = new Audio(
    path.join(
      __dirname,
      '..',
      'assets',
      'sounds',
      Constants.NOTIFICATION_SOUND,
    ),
  );
  audio.volume = volume;
  audio.play();
};
