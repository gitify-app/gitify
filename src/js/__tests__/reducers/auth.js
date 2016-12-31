import { Map } from 'immutable';

import { LOGIN, LOGOUT } from '../../actions';
import reducer from '../../reducers/auth';

describe('reducers/auth.js', () => {
  const initialState = Map({
    response: Map(),
    token: null,
    isFetching: false,
    failed: false
  });

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should handle LOGIN.REQUEST', () => {
    const action = {
      type: LOGIN.REQUEST
    };

    expect(reducer(undefined, action)).toEqual(
      initialState
        .set('isFetching', true)
        .set('failed', false)
        .set('response', Map())
        .set('token', null)
    );
  });

  it('should handle LOGIN.SUCCESS', () => {
    const fakeState = Map({
      response: Map(),
      token: null,
      isFetching: true,
      failed: false
    });

    expect(reducer(fakeState, {}).get('token')).toBeNull();

    const action = {
      type: LOGIN.SUCCESS,
      payload: {
        access_token: '123HELLOWORLDTOKEN'
      }
    };

    expect(reducer(fakeState, action)).toEqual(
      initialState
        .set('isFetching', false)
        .set('token', action.payload.access_token)
    );

    expect(reducer(fakeState, action).get('token')).toBe('123HELLOWORLDTOKEN');
  });

  it('should handle LOGIN.FAILURE', () => {
    const fakeState = Map({
      response: Map(),
      token: null,
      isFetching: true,
      failed: false
    });

    expect(reducer(fakeState, {}).get('token')).toBeNull();

    const action = {
      type: LOGIN.FAILURE,
      payload: {msg: 'Failed to login.'}
    };

    expect(reducer(fakeState, action)).toEqual(
      initialState
        .set('isFetching', false)
        .set('failed', true)
        .set('response', Map(action.payload))
    );

    expect(reducer(fakeState, action).get('token')).toBeNull();
  });

  it('should handle LOGOUT', () => {
    const fakeState = Map({
      response: Map(),
      token: 'LOGGEDINTOKEN',
      isFetching: false,
      failed: false
    });

    expect(reducer(fakeState, {}).get('token')).not.toBeNull();

    const action = {
      type: LOGOUT
    };

    expect(reducer(fakeState, action)).toEqual(
      initialState
        .set('token', null)
        .set('response', null)
    );

    expect(reducer(fakeState, action).get('token')).toBeNull();
  });
});
