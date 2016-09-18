import _ from 'underscore';
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
      return {
        ...state,
        response: _.without(state.response, _.findWhere(state.response, {id: action.meta.id}))
      };
    case MARK_REPO_NOTIFICATION_SUCCESS:
      // FIXME! Action now has a repo slug only!
      return {
        ...state,
        response: _.reject(state.response, (obj) => obj.repository.full_name === action.meta.repoFullName)
      };
    default:
      return state;
  }
};
