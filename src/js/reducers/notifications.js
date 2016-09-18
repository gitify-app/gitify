import { Map, List, fromJS } from 'immutable';

import {
  NOTIFICATIONS_REQUEST, NOTIFICATIONS_SUCCESS, NOTIFICATIONS_FAILURE,
  MARK_NOTIFICATION_SUCCESS, MARK_REPO_NOTIFICATION_SUCCESS
} from '../actions';

const initialState = Map({
  response: List(),
  isFetching: false,
  failed: false
});

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case NOTIFICATIONS_REQUEST:
      return state
        .set('isFetching', true)
        .set('failed', false);
    case NOTIFICATIONS_SUCCESS:
      return state
        .set('isFetching', false)
        .set('response', fromJS(action.payload));
    case NOTIFICATIONS_FAILURE:
      return state
        .set('isFetching', false)
        .set('failed', true)
        .set('response', List());
    case MARK_NOTIFICATION_SUCCESS:
      return state
        .set('response', state.get('response')
          .filterNot((obj) => obj.get('id') === action.meta.id));
    case MARK_REPO_NOTIFICATION_SUCCESS:
      return state
        .set('response', state.get('response')
          .filterNot((obj) => obj.getIn(['repository', 'full_name']) === action.meta.repoSlug));
    default:
      return state;
  }
};
