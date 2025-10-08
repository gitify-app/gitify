import { APPLICATION } from '../../../shared/constants';

import type { AccountNotifications, GitifyState } from '../../types';
import type { Notification } from '../../typesGitHub';
import { getAccountUUID } from '../auth/utils';
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

      const accountPreviousNotificationsIds = new Set<string>(
        accountPreviousNotifications.notifications.map((item) => item.id),
      );

      const accountNewNotifications = accountNotifications.notifications.filter(
        (item) => {
          return !accountPreviousNotificationsIds.has(`${item.id}`);
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
  const url: string = null;

  if (notifications.length === 1) {
    const notification = notifications[0];
    title = window.gitify.platform.isWindows()
      ? ''
      : notification.repository.full_name;
    body = notification.subject.title;
    // TODO FIXME = set url to notification url
  } else {
    title = APPLICATION.NAME;
    body = `You have ${notifications.length} notifications`;
  }

  return window.gitify.raiseNativeNotification(title, body, url);
};

export const raiseSoundNotification = async (volume: number) => {
  const path = await window.gitify.notificationSoundPath();

  const audio = new Audio(path);
  audio.volume = volume;
  audio.play();
};
