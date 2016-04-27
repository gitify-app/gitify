import _ from 'underscore';
import {
  NOTIFICATIONS_REQUEST, NOTIFICATIONS_SUCCESS, NOTIFICATIONS_FAILURE,
  MARK_NOTIFICATION_SUCCESS
} from '../actions';

const initialState = {
  response: [],
  isFetching: false,
  failed: false
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case NOTIFICATIONS_REQUEST:
      return {
        ...state,
        isFetching: true,
        failed: false
      };
    case NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        isFetching: false,
        response: action.payload
      };
    case NOTIFICATIONS_FAILURE:
      return {
        ...state,
        failed: true,
        isFetching: false,
        response: action.payload
      };
    case MARK_NOTIFICATION_SUCCESS:
      return {
        ...state,
        response: _.without(state.response, _.findWhere(state.response, {id: action.meta.id}))
      };
    default:
      return state;
  }
};
