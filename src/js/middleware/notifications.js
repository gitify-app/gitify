import _ from 'underscore';
import { NOTIFICATIONS_SUCCESS, MARK_NOTIFICATION_SUCCESS, MARK_REPO_NOTIFICATION_SUCCESS } from '../actions';
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

      Helpers.updateTrayIcon(action.payload.length);
      NativeNotifications.setup(newNotifications, settings);
      break;

    case MARK_NOTIFICATION_SUCCESS:
      var previousNotifications = notificationsState.response.map(obj => obj.id);
      Helpers.updateTrayIcon(previousNotifications.length - 1);
      break;

    case MARK_REPO_NOTIFICATION_SUCCESS:
      var previousNotifications = notificationsState.response;
      var newNotifications = _.reject(previousNotifications, (obj) => obj.repository.id === action.meta.repoId);
      Helpers.updateTrayIcon(newNotifications.length);
      break;
  }

  return next(action);
};
