import { CALL_API, isRSAA } from 'redux-api-middleware';
import { NOTIFICATIONS_REQUEST } from '../actions';

export default store => next => action => {
  if (!isRSAA(action)) {
    return next(action);
  }

  if (action[CALL_API].types[0] === NOTIFICATIONS_REQUEST) {
    const token = 'token ' + store.getState().auth.token;
    action[CALL_API].headers['Authorization'] = token;

    const settings = store.getState().settings;
    const endpoint = action[CALL_API].endpoint + '?participating=';
    action[CALL_API].endpoint = endpoint + (settings.participating ? 'true' : 'false');
  }

  return next(action);
};
