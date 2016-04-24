import {
  LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, CHECK_AUTH
} from '../actions';

const initialState = {
  response: {},
  token: null,
  isFetching: false,
  failed: false
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN_REQUEST:
      return {
        ...state,
        isFetching: true,
        failed: false,
        response: {},
        token: null
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        isFetching: false,
        token: action.payload.access_token
      };
    case LOGIN_FAILURE:
      return {
        ...state,
        isFetching: false,
        failed: true,
        response: action.payload
      };
    case LOGOUT:
      return {
        ...state,
        response: null
      };
    case CHECK_AUTH:
      return {
        ...state,
        token: action.token
      };
    default:
      return state;
  }
};
