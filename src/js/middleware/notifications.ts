import * as _ from 'lodash';
import {
  NOTIFICATIONS,
  MARK_NOTIFICATION,
  MARK_REPO_NOTIFICATION,
} from '../actions';
import NativeNotifications from '../utils/notifications';
import { updateTrayIcon } from '../utils/comms';
import { AccountNotifications } from '../../types/reducers';

export default (store) => (next) => (action) => {
  const settings = store.getState().settings;
  const accountNotifications: AccountNotifications[] = store.getState()
    .notifications.response;

  switch (action.type) {
    case NOTIFICATIONS.SUCCESS:
      const previousNotifications = accountNotifications.map((account) => {
        return {
          hostname: account.hostname,
          notifications: account.notifications.map(
            (notification) => notification.id
          ),
        };
      });

      const newNotifications = action.payload.map((AccountNotifications) => {
        const accountPreviousNotifications =
          previousNotifications.length > 0
            ? previousNotifications.find(
                (obj) => obj.hostname === AccountNotifications.hostname
              ).notifications
            : [];

        return AccountNotifications.notifications.filter((obj) => {
          return !accountPreviousNotifications.includes(obj.id);
        });
      });

      const newNotificationsCount = newNotifications.reduce(
        (memo, acc) => memo + acc.length,
        0
      );

      const allNotificationsCount = action.payload.reduce(
        (memo, acc) => memo + acc.notifications.length,
        0
      );

      updateTrayIcon(allNotificationsCount);
      NativeNotifications.setup(
        newNotifications,
        newNotificationsCount,
        settings
      );
      break;

    case MARK_NOTIFICATION.SUCCESS:
      const prevNotificationsCount = accountNotifications.reduce(
        (memo, acc) => memo + acc.notifications.length,
        0
      );

      updateTrayIcon(prevNotificationsCount - 1);
      break;

    case MARK_REPO_NOTIFICATION.SUCCESS:
      const updatedNotificationsCount = accountNotifications
        .map((accNotifications) => {
          if (accNotifications.hostname !== action.meta.hostname) {
            return accNotifications;
          }

          return _.updateWith(
            accNotifications,
            '[notifications]',
            (notifications) => {
              return notifications.filter(
                (obj) => obj.repository.full_name !== action.meta.repoSlug
              );
            }
          );
        })
        .reduce((memo, acc) => memo + acc.notifications.length, 0);

      updateTrayIcon(updatedNotificationsCount);
      break;
  }

  return next(action);
};
