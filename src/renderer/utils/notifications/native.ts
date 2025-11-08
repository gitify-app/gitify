import { APPLICATION } from '../../../shared/constants';

import type { Notification } from '../../typesGitHub';
import { generateGitHubWebUrl } from '../helpers';

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
