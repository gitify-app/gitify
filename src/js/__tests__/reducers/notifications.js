import { expect } from 'chai';
import reducer from '../../reducers/notifications';
import {
  NOTIFICATIONS_REQUEST, NOTIFICATIONS_SUCCESS, NOTIFICATIONS_FAILURE,
  MARK_NOTIFICATION_SUCCESS, MARK_REPO_NOTIFICATION_SUCCESS
} from '../../actions';

describe('reducers/notifications.js', () => {
  const initialState = {
    response: [],
    isFetching: false,
    failed: false
  };

  it('should return the initial state', () => {

    expect(reducer(undefined, {})).to.eql(initialState);

  });

  it('should handle NOTIFICATIONS_REQUEST', () => {

    const action = {
      type: NOTIFICATIONS_REQUEST,
      query: 'hello'
    };

    expect(reducer(undefined, action)).to.eql({
      ...initialState,
      isFetching: true,
      failed: false
    });

  });

  it('should handle NOTIFICATIONS_SUCCESS', () => {

    const notifications = [
      {
        id: 1,
        repository: 'ekonstantinidis/gitify',
        text: 'New Release'
      },
      {
        id: 2,
        repository: 'ekonstantinidis/gitify',
        text: 'It\'s Great'
      }
    ];

    expect(reducer(undefined, {})).to.eql(initialState);

    const action = {
      type: NOTIFICATIONS_SUCCESS,
      payload: notifications
    };

    const currentState = {
      ...initialState,
      isFetching: true,
      failed: false
    };

    expect(reducer(currentState, action)).to.eql({
      ...initialState,
      isFetching: false,
      response: notifications
    });

  });

  it('should handle NOTIFICATIONS_FAILURE', () => {

    const response = {
      error: 404,
      message: 'Oops! Something went wrong.'
    };

    const currentState = {
      ...initialState,
      isFetching: true,
      failed: false
    };

    expect(reducer(currentState, {})).to.eql(currentState);

    const action = {
      type: NOTIFICATIONS_FAILURE,
      payload: response
    };

    expect(reducer(currentState, action)).to.eql({
      ...initialState,
      isFetching: false,
      failed: true,
      response: response
    });

  });
});
