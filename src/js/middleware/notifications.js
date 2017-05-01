import _ from 'underscore';
import { NOTIFICATIONS, MARK_NOTIFICATION, MARK_REPO_NOTIFICATION } from '../actions';
import NativeNotifications from '../utils/notifications';
import { setBadge, updateTrayIcon } from '../utils/comms';

export default store => next => action => {
  const settings = store.getState().settings;
  const notificationsState = store.getState().notifications.toJS();

  switch (action.type) {

    case NOTIFICATIONS.SUCCESS:
      var previousNotifications = notificationsState.response.map(obj => obj.id);
      var newNotifications = _.filter(action.payload.toJS(), function (obj) {
        return !_.contains(previousNotifications, obj.id);
      });

      updateTrayIcon(action.payload.size);
      setBadge(action.payload.size);
      NativeNotifications.setup(newNotifications, settings);
      break;

    case MARK_NOTIFICATION.SUCCESS:
      var previousNotifications = notificationsState.response.map(obj => obj.id);
      updateTrayIcon(previousNotifications.length - 1);
      setBadge(previousNotifications.length - 1);
      break;

    case MARK_REPO_NOTIFICATION.SUCCESS:
      var previousNotifications = notificationsState.response;
      var newNotifications = _.reject(previousNotifications, (obj) => (
        obj.repository.full_name === action.meta.repoSlug
      ));

      updateTrayIcon(newNotifications.length);
      setBadge(newNotifications.length);
      break;
  }

  return next(action);
};
