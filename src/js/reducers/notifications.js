import { Map, List, fromJS } from 'immutable';
import { NOTIFICATIONS, MARK_NOTIFICATION, MARK_REPO_NOTIFICATION } from '../actions';

const initialState = Map({
  response: List(),
  isFetching: false,
  failed: false
});

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case NOTIFICATIONS.REQUEST:
      return state
        .set('isFetching', true)
        .set('failed', false);
    case NOTIFICATIONS.REQUEST:
      return state
        .set('isFetching', false)
        .set('response', fromJS(action.payload));
    case NOTIFICATIONS.FAILURE:
      return state
        .set('isFetching', false)
        .set('failed', true)
        .set('response', List());
    case MARK_NOTIFICATION.SUCCESS:
      return state
        .set('response', state.get('response')
          .filterNot((obj) => obj.get('id') === action.meta.id));
    case MARK_REPO_NOTIFICATION.SUCCESS:
      return state
        .set('response', state.get('response')
          .filterNot((obj) => obj.getIn(['repository', 'full_name']) === action.meta.repoSlug));
    default:
      return state;
  }
};
