import _ from 'underscore';
import { List, Map } from 'immutable';
import { NOTIFICATIONS, MARK_NOTIFICATION, MARK_REPO_NOTIFICATION } from '../actions';
import NativeNotifications from '../utils/notifications';
import { setBadge, updateTrayIcon } from '../utils/comms';

export default store => next => action => {
  const settings = store.getState().settings;
  const notificationsState = store.getState().notifications.toJS();
  const notificationsAccounts = store.getState().notifications.get('response');

  switch (action.type) {

    case NOTIFICATIONS.SUCCESS:

      const previousNotifications = notificationsAccounts.map((accNotifications) => {
        return accNotifications.update('notifications', notifications => notifications.map(obj => obj.get('id')));
      });

      const newNotifications = action.payload.map((accNotifications) => {
        const prevAccNotifications = previousNotifications
          .find(obj => obj.get('hostname') === accNotifications.get('hostname'), null, Map())
          .get('notifications', List());

        return accNotifications.get('notifications').filter((obj) => {
          return !prevAccNotifications.contains(obj.get('id'));
        });
      });

      const newNotificationsCount = newNotifications.reduce((memo, acc) => memo + acc.size, 0);

      updateTrayIcon(newNotificationsCount);
      setBadge(newNotificationsCount);
      NativeNotifications.setup(newNotifications, newNotificationsCount, settings);
      break;

    case MARK_NOTIFICATION.SUCCESS:
      const prevNotificationsCount = notificationsAccounts
        .reduce((memo, acc) => memo + acc.get('notifications').size, 0);

      updateTrayIcon(prevNotificationsCount - 1);
      setBadge(prevNotificationsCount - 1);
      break;

    case MARK_REPO_NOTIFICATION.SUCCESS:


      // var previousNotifications = notificationsState.response;
      // var newNotifications = _.reject(previousNotifications, (obj) => (
      //   obj.repository.full_name === action.meta.repoSlug
      // ));

      // updateTrayIcon(newNotifications.length);
      // setBadge(newNotifications.length);
      break;
  }

  return next(action);
};
