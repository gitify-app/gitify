import reducer from '../../reducers/notifications';
import { NOTIFICATIONS, MARK_NOTIFICATION, MARK_REPO_NOTIFICATION } from '../../actions';

describe('reducers/notifications.js', () => {
  const initialState = {
    response: [],
    isFetching: false,
    failed: false
  };

  const notifications = [
    {
      id: 1,
      repository: {
        full_name: 'ekonstantinidis/gitify'
      },
      text: 'New Release'
    },
    {
      id: 2,
      repository: {
        full_name: 'ekonstantinidis/gitify'
      },
      text: 'It\'s Great'
    }
  ];

  it('should return the initial state', () => {

    expect(reducer(undefined, {})).to.eql(initialState);

  });

  it('should handle NOTIFICATIONS.REQUEST', () => {

    const action = {
      type: NOTIFICATIONS.REQUEST,
      query: 'hello'
    };

    expect(reducer(undefined, action)).to.eql({
      ...initialState,
      isFetching: true,
      failed: false
    });

  });

  it('should handle NOTIFICATIONS.SUCCESS', () => {

    expect(reducer(undefined, {})).to.eql(initialState);

    const action = {
      type: NOTIFICATIONS.SUCCESS,
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

  it('should handle NOTIFICATIONS.FAILURE', () => {

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
      type: NOTIFICATIONS.FAILURE,
      payload: response
    };

    expect(reducer(currentState, action)).to.eql({
      ...initialState,
      isFetching: false,
      failed: true,
      response: []
    });

  });

  it('should handle MARK_NOTIFICATION.SUCCESS', () => {

    const currentState = {
      ...initialState,
      response: notifications
    };

    expect(reducer(currentState, {}).response.length).to.equal(2);

    const action = {
      type: MARK_NOTIFICATION.SUCCESS,
      meta: {
        id: 1
      }
    };

    expect(reducer(currentState, action).response.length).to.equal(1);

  });

  it('should handle MARK_REPO_NOTIFICATION.SUCCESS', () => {

    const currentState = {
      ...initialState,
      response: notifications
    };

    expect(reducer(currentState, {}).response.length).to.equal(2);

    const action = {
      type: MARK_REPO_NOTIFICATION.SUCCESS,
      meta: {
        repoFullName: 'ekonstantinidis/gitify'
      }
    };

    expect(reducer(currentState, action).response.length).to.equal(0);

  });
});
