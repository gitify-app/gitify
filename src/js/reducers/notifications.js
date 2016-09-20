import _ from 'underscore';

import { NOTIFICATIONS, MARK_NOTIFICATION, MARK_REPO_NOTIFICATION } from '../actions';

const initialState = {
  response: [],
  isFetching: false,
  failed: false
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case NOTIFICATIONS.REQUEST:
      return {
        ...state,
        isFetching: true,
        failed: false
      };
    case NOTIFICATIONS.SUCCESS:
      return {
        ...state,
        isFetching: false,
        response: action.payload
      };
    case NOTIFICATIONS.FAILURE:
      return {
        ...state,
        failed: true,
        isFetching: false,
        response: []
      };
    case MARK_NOTIFICATION.SUCCESS:
      return {
        ...state,
        response: _.without(state.response, _.findWhere(state.response, {id: action.meta.id}))
      };
    case MARK_REPO_NOTIFICATION.SUCCESS:
      return {
        ...state,
        response: _.reject(state.response, (obj) => obj.repository.full_name === action.meta.repoFullName)
      };
    default:
      return state;
  }
};
