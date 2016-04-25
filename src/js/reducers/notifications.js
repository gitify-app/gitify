import {
  NOTIFICATIONS_REQUEST, NOTIFICATIONS_SUCCESS, NOTIFICATIONS_FAILURE
} from '../actions';

const initialState = {
  response: {},
  isFetching: false,
  failed: false
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case NOTIFICATIONS_REQUEST:
      return {
        ...state,
        isFetching: true,
        failed: false,
        response: {}
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
    default:
      return state;
  }
};
