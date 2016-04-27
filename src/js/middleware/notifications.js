import _ from 'underscore';
import { NOTIFICATIONS_SUCCESS, MARK_NOTIFICATION_REQUEST, MARK_REPO_NOTIFICATION_REQUEST } from '../actions';
import NativeNotifications from '../utils/notifications';
import Helpers from '../utils/helpers';

export default store => next => action => {
  const settings = store.getState().settings;
  const notificationsState = store.getState().notifications;

  switch (action.type) {
    case NOTIFICATIONS_SUCCESS:
      var previousNotifications = notificationsState.response.map(obj => obj.id);
      var newNotifications = _.filter(action.payload, function (obj) {
        return !_.contains(previousNotifications, obj.id);
      });

      Helpers.updateTrayIcon(newNotifications);
      NativeNotifications.setup(newNotifications, settings);
      break;

    case MARK_NOTIFICATION_REQUEST:
    case MARK_REPO_NOTIFICATION_REQUEST:
      var previousNotifications = notificationsState.response.map(obj => obj.id);
      var newNotifications = _.filter(action.payload, function (obj) {
        return !_.contains(previousNotifications, obj.id);
      });

      Helpers.updateTrayIcon(newNotifications);
      break;
  }

  return next(action);
};
