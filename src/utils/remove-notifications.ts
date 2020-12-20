import updateWith from 'lodash/updateWith';

import { AccountNotifications } from '../types';

export const removeNotifications = (
  repoSlug: string,
  notifications: AccountNotifications[],
  hostname: string
): AccountNotifications[] => {
  const accountIndex = notifications.findIndex(
    (accountNotifications) => accountNotifications.hostname === hostname
  );

  return updateWith(
    [...notifications],
    `[${accountIndex}][notifications]`,
    (accNotifications) => {
      return accNotifications.filter(
        (notification) => notification.repository.full_name !== repoSlug
      );
    }
  );
};
