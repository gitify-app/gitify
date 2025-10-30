import { APPLICATION } from '../../../shared/constants';

import type { AccountNotifications, GitifyState } from '../../types';
import type { Notification } from '../../typesGitHub';
import { getAccountUUID } from '../auth/utils';
import { generateGitHubWebUrl } from '../helpers';
import { setTrayIconColorAndTitle } from './notifications';

export const triggerNativeNotifications = (
  previousNotifications: AccountNotifications[],
  newNotifications: AccountNotifications[],
  state: GitifyState,
) => {
  const diffNotifications = newNotifications.flatMap((accountNotifications) => {
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
      (notification) => {
        return !accountPreviousNotificationsIds.has(notification.id);
      },
    );

    return accountNewNotifications;
  });

  setTrayIconColorAndTitle(newNotifications, state.settings);

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

export const raiseNativeNotification = async (
  notifications: Notification[],
) => {
  let title: string;
  let body: string;
  let url: string = null;

  if (notifications.length === 1) {
    const notification = notifications[0];
    title = window.gitify.platform.isWindows()
      ? ''
      : notification.repository.full_name;
    body = notification.subject.title;
    url = await generateGitHubWebUrl(notification);
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
