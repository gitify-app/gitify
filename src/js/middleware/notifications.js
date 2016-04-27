import _ from 'underscore';
import { NOTIFICATIONS_SUCCESS } from '../actions';

export default store => next => action => {
  switch (action.type) {
    case NOTIFICATIONS_SUCCESS:
      const notificationsState = store.getState().notifications;
      const previousNotifications = notificationsState.response.map(obj => obj.id);

      console.log('PREVIOUS');
      console.log(previousNotifications);

      // Check if notification is already in the store.
      const newNotifications = _.filter(action.payload, function (obj) {
        console.log(obj.id, !_.contains(previousNotifications, obj.id));
        return !_.contains(previousNotifications, obj.id);
      });

      console.log('=== NEW NOTIFICATIONS (' + newNotifications.length + ') ===');
      console.log(newNotifications);
      console.log('==============================');

      break;

  }

  return next(action);
};
