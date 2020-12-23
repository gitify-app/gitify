import updateWith from 'lodash/updateWith';

import { AccountNotifications } from '../types';
import { Notification } from '../typesGithub';

export const removeNotification = (
  id: string,
  notifications: AccountNotifications[],
  hostname: string
): AccountNotifications[] => {
  const accountIndex = notifications.findIndex(
    (accountNotifications) => accountNotifications.hostname === hostname
  );

  return updateWith(
    [...notifications],
    `[${accountIndex}][notifications]`,
    (accNotifications: Notification[]) => {
      return accNotifications.filter((notification) => notification.id !== id);
    }
  );
};
