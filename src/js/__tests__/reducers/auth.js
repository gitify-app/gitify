import { Map, fromJS } from 'immutable';
import { expect } from 'chai';

import reducer from '../../reducers/auth';
import { LOGIN, LOGOUT } from '../../actions';

describe('reducers/auth.js', () => {
  const initialState = fromJS({
    response: {},
    token: null,
    isFetching: false,
    failed: false
  });

  it('should return the initial state', () => {

    expect(reducer(undefined, {})).to.eql(initialState);

  });

  it('should handle LOGIN.REQUEST', () => {

    const action = {
      type: LOGIN.REQUEST
    };

    expect(reducer(undefined, action)).to.eql(
      initialState
        .set('isFetching', true)
        .set('failed', false)
        .set('response', Map())
        .set('token', null)
    );

  });

  it('should handle LOGIN.SUCCESS', () => {

    const fakeState = fromJS({
      isFetching: true,
      failed: false,
      response: {},
      token: null
    });

    expect(reducer(fakeState, {}).get('token')).to.be.null;

    const action = {
      type: LOGIN.SUCCESS,
      payload: {
        access_token: '123HELLOWORLDTOKEN'
      }
    };

    expect(reducer(fakeState, action)).to.eql(
      initialState
      .set('isFetching', false)
      .set('token', action.payload.access_token)
    );

    expect(reducer(fakeState, action).token).to.not.be.null;

  });

  it('should handle LOGIN.FAILURE', () => {

    const fakeState = fromJS({
      isFetching: true,
      failed: false,
      response: {},
      token: null
    });

    expect(reducer(fakeState, {}).get('token')).to.be.null;

    const action = {
      type: LOGIN.FAILURE,
      payload: {msg: 'Failed to login.'}
    };

    expect(reducer(fakeState, action)).to.eql(
      initialState
        .set('isFetching', false)
        .set('failed', true)
        .set('response', Map(action.payload))
    );

    expect(reducer(fakeState, action).get('token')).to.be.null;

  });

  it('should handle LOGOUT', () => {

    const fakeState = fromJS({
      isFetching: false,
      failed: false,
      response: {},
      token: 'LOGGEDINTOKEN'
    });

    expect(reducer(fakeState, {}).get('token')).to.not.be.null;

    const action = {
      type: LOGOUT
    };

    expect(reducer(fakeState, action)).to.eql(
      initialState
        .set('token', null)
        .set('response', null)
    );

    expect(reducer(fakeState, action).get('token')).to.be.null;

  });

});
