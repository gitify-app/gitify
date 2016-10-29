import { Map } from 'immutable';
import { LOGIN, LOGOUT } from '../actions';

const initialState = Map({
  response: Map(),
  token: null,
  isFetching: false,
  failed: false
});

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN.REQUEST:
      return state
        .set('isFetching', true)
        .set('failed', false)
        .set('response', Map())
        .set('token', null);
    case LOGIN.SUCCESS:
      return state
        .set('isFetching', false)
        .set('token', action.payload.access_token);
    case LOGIN.FAILURE:
      return state
        .set('isFetching', false)
        .set('failed', true)
        .set('response', Map(action.payload));
    case LOGOUT:
      return state
        .set('response', null)
        .set('token', null);
    default:
      return state;
  }
};
