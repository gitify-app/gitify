import { LOGIN, LOGOUT } from '../actions';

const initialState = {
  response: {},
  token: null,
  isFetching: false,
  failed: false
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN.REQUEST:
      return {
        ...state,
        isFetching: true,
        failed: false,
        response: {},
        token: null
      };
    case LOGIN.SUCCESS:
      return {
        ...state,
        isFetching: false,
        token: action.payload.access_token
      };
    case LOGIN.FAILURE:
      return {
        ...state,
        isFetching: false,
        failed: true,
        response: action.payload
      };
    case LOGOUT:
      return {
        ...state,
        response: null,
        token: null
      };
    default:
      return state;
  }
};
