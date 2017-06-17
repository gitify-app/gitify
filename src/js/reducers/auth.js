import { Map, List } from 'immutable';
import { LOGIN, LOGOUT } from '../actions';

const initialState = Map({
  response: Map(),
  token: null,
  isFetching: false,
  failed: false,
  enterpriseAccounts: List(),
});

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN.REQUEST:
      return state
        .set('isFetching', true)
        .set('failed', false)
        .set('response', Map());
    case LOGIN.SUCCESS:
      if (action.isEnterprise) {
        return state
          .set('isFetching', false)
          .update('enterpriseAccounts', accounts =>
            accounts.push(
              Map({
                hostname: action.hostname,
                token: action.payload.access_token,
              })
            )
          );
      }

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
        .set('token', null)
        .set('enterpriseAccounts', List());
    default:
      return state;
  }
}
