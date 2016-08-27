import { CALL_API, isRSAA } from 'redux-api-middleware';
import {
  HAS_STARRED_REQUEST,
  NOTIFICATIONS_REQUEST,
  MARK_NOTIFICATION_REQUEST,
  MARK_REPO_NOTIFICATION_REQUEST
} from '../actions';

export default store => next => action => {
  if (!isRSAA(action)) {
    return next(action);
  }

  switch (action[CALL_API].types[0]) {
    case NOTIFICATIONS_REQUEST:
      const settings = store.getState().settings;
      const endpoint = action[CALL_API].endpoint + '?participating=';
      action[CALL_API].endpoint = endpoint + (settings.participating ? 'true' : 'false');

    case HAS_STARRED_REQUEST:
    case NOTIFICATIONS_REQUEST:
    case MARK_NOTIFICATION_REQUEST:
    case MARK_REPO_NOTIFICATION_REQUEST:
      const token = 'token ' + store.getState().auth.token;
      action[CALL_API].headers['Authorization'] = token;
  }

  return next(action);
};
