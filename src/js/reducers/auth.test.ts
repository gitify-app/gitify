import { AuthState } from '../../types/reducers';
import { LOGIN } from '../actions';
import { LOGOUT } from '../../types/actions';
import reducer from './auth';

describe('reducers/auth.ts', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toMatchSnapshot();
  });

  it('should handle LOGIN.REQUEST', () => {
    const action = {
      type: LOGIN.REQUEST,
    };

    expect(reducer(undefined, action)).toMatchSnapshot();
  });

  it('should handle LOGIN.SUCCESS - github.com', () => {
    const fakeState = {
      response: {},
      token: null,
      isFetching: true,
      failed: false,
    } as AuthState;

    expect(reducer(fakeState, {}).token).toBeNull();

    const action = {
      type: LOGIN.SUCCESS,
      payload: {
        access_token: '123HELLOWORLDTOKEN',
      },
    };

    expect(reducer(undefined, action)).toMatchSnapshot();
    expect(reducer(fakeState, action).token).toBe('123HELLOWORLDTOKEN');
  });

  it('should handle LOGIN.SUCCESS - enterprise', () => {
    const action = {
      type: LOGIN.SUCCESS,
      isEnterprise: true,
      hostname: 'github.gitify.io',
      payload: {
        access_token: '123HELLOWORLDTOKEN',
      },
    };

    expect(reducer(undefined, action)).toMatchSnapshot();
  });

  it('should handle LOGIN.FAILURE', () => {
    const fakeState = {
      response: {},
      token: null,
      isFetching: true,
      failed: false,
    } as AuthState;

    expect(reducer(fakeState, {}).token).toBeNull();

    const action = {
      type: LOGIN.FAILURE,
      payload: { msg: 'Failed to login.' },
    };

    expect(reducer(fakeState, action)).toMatchSnapshot();
    expect(reducer(fakeState, action).token).toBeNull();
  });

  it('should handle LOGOUT', () => {
    const fakeState = {
      response: {},
      token: 'LOGGEDINTOKEN',
      isFetching: false,
      failed: false,
      enterpriseAccounts: [],
    } as AuthState;

    expect(reducer(fakeState, {}).token).not.toBeNull();

    const action = {
      type: LOGOUT,
    };

    expect(reducer(fakeState, action)).toMatchSnapshot();
    expect(reducer(fakeState, action).token).toBeNull();
  });
});
