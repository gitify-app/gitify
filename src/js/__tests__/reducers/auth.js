import { expect } from 'chai';
import reducer from '../../reducers/auth';
import {
  LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, CHECK_AUTH
} from '../../actions';

describe('reducers/auth.js', () => {
  const initialState = {
    response: {},
    token: null,
    isFetching: false,
    failed: false
  };

  it('should return the initial state', () => {

    expect(reducer(undefined, {})).to.eql(initialState);

  });

  it('should handle LOGIN_REQUEST', () => {

    const action = {
      type: LOGIN_REQUEST
    };

    expect(reducer(undefined, action)).to.eql({
      ...initialState,
      isFetching: true,
      failed: false,
      response: {},
      token: null
    });

  });

  it('should handle LOGIN_SUCCESS', () => {

    const fakeState = {
      isFetching: true,
      failed: false,
      response: {},
      token: null
    };

    expect(reducer(fakeState, {}).token).to.be.null;

    const action = {
      type: LOGIN_SUCCESS,
      payload: {
        access_token: '123HELLOWORLDTOKEN'
      }
    };

    expect(reducer(fakeState, action)).to.eql({
      ...initialState,
      isFetching: false,
      token: action.payload.access_token
    });

    expect(reducer(fakeState, action).token).to.not.be.null;

  });

  it('should handle LOGIN_FAILURE', () => {

    const fakeState = {
      isFetching: true,
      failed: false,
      response: {},
      token: null
    };

    expect(reducer(fakeState, {}).token).to.be.null;

    const action = {
      type: LOGIN_FAILURE,
      payload: 'Failed to login.'
    };

    expect(reducer(fakeState, action)).to.eql({
      ...initialState,
      isFetching: false,
      failed: true,
      response: action.payload
    });

    expect(reducer(fakeState, action).token).to.be.null;

  });

  it('should handle LOGOUT', () => {

    const fakeState = {
      isFetching: false,
      failed: false,
      response: {},
      token: 'LOGGEDINTOKEN'
    };

    expect(reducer(fakeState, {}).token).to.not.be.null;

    const action = {
      type: LOGOUT
    };

    expect(reducer(fakeState, action)).to.eql({
      ...initialState,
      token: null,
      response: null
    });

    expect(reducer(fakeState, action).token).to.be.null;

  });

  it('should handle CHECK_AUTH', () => {

    const fakeState = {
      isFetching: false,
      failed: false,
      response: {},
      token: null
    };

    const fakeToken = '123HELLOWORLDTOKEN';

    expect(reducer(fakeState, {}).token).to.be.null;

    const action = {
      type: CHECK_AUTH,
      token: fakeToken
    };

    expect(reducer(fakeState, action)).to.eql({
      ...initialState,
      token: fakeToken
    });

    expect(reducer(fakeState, action).token).to.not.be.null;

  });
});
