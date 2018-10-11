import { Map } from 'immutable';

import Constants from '../../utils/constants';
import reducer from '../../reducers/notifications';
import {
  LOGOUT,
  NOTIFICATIONS,
  MARK_NOTIFICATION,
  MARK_REPO_NOTIFICATION,
  MARK_ACCOUNT_NOTIFICATION,
} from '../../actions';
import {
  mockedGithubNotifications,
  mockedEnterpriseNotifications,
} from '../../__mocks__/mockedData';

describe('reducers/notifications.js', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toMatchSnapshot();
  });

  it('should handle NOTIFICATIONS.REQUEST', () => {
    const action = {
      type: NOTIFICATIONS.REQUEST,
    };

    expect(reducer(undefined, action)).toMatchSnapshot();
  });

  it('should handle NOTIFICATIONS.SUCCESS', () => {
    expect(reducer(undefined, {})).toMatchSnapshot();

    const action = {
      type: NOTIFICATIONS.SUCCESS,
      payload: mockedGithubNotifications,
      hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
    };

    expect(reducer(undefined, action)).toMatchSnapshot();
  });

  it('should handle NOTIFICATIONS.FAILURE', () => {
    const action = {
      type: NOTIFICATIONS.FAILURE,
    };

    expect(reducer(undefined, action)).toMatchSnapshot();
  });

  it('should handle MARK_NOTIFICATION.SUCCESS - github.com', () => {
    const id = 1;
    const hostname = 'github.com';

    const action = {
      type: MARK_NOTIFICATION.SUCCESS,
      meta: { id, hostname },
    };

    const currentState = reducer(undefined, {}).setIn(
      ['response', 0],
      Map({
        hostname,
        notifications: mockedGithubNotifications,
      })
    );

    expect(reducer(currentState, action)).toMatchSnapshot();
  });

  it('should handle MARK_NOTIFICATION.SUCCESS - enterprise', () => {
    const id = 1;
    const hostname = 'github.gitify.io';

    const action = {
      type: MARK_NOTIFICATION.SUCCESS,
      meta: { id, hostname },
    };

    const currentState = reducer(undefined, {}).setIn(
      ['response', 0],
      Map({
        hostname,
        notifications: mockedEnterpriseNotifications,
      })
    );

    expect(reducer(currentState, action)).toMatchSnapshot();
  });

  it('should handle MARK_REPO_NOTIFICATION.SUCCESS - github.com', () => {
    const repoSlug = 'manosim/notifications-test';
    const hostname = 'github.gitify.io';

    const currentState = reducer(undefined, {}).setIn(
      ['response', 0],
      Map({
        hostname,
        notifications: mockedGithubNotifications,
      })
    );

    const action = {
      type: MARK_REPO_NOTIFICATION.SUCCESS,
      meta: { hostname, repoSlug },
    };

    expect(reducer(currentState, action)).toMatchSnapshot();
  });

  it('should handle MARK_REPO_NOTIFICATION.SUCCESS - enterprise', () => {
    const repoSlug = 'myorg/notifications-test';
    const hostname = 'github.gitify.io';

    const currentState = reducer(undefined, {}).setIn(
      ['response', 0],
      Map({
        hostname,
        notifications: mockedEnterpriseNotifications,
      })
    );

    const action = {
      type: MARK_REPO_NOTIFICATION.SUCCESS,
      meta: { hostname, repoSlug },
    };

    expect(reducer(currentState, action)).toMatchSnapshot();
  });

  it('should handle MARK_ACCOUNT_NOTIFICATION.SUCCESS - github.com', () => {
    const hostname = 'github.gitify.io';

    const currentState = reducer(undefined, {}).setIn(
      ['response', 0],
      Map({
        hostname,
        notifications: mockedEnterpriseNotifications,
      })
    );

    const action = {
      type: MARK_ACCOUNT_NOTIFICATION.SUCCESS,
      meta: { hostname },
    };

    expect(reducer(currentState, action)).toMatchSnapshot();
  });

  it('should handle MARK_ACCOUNT_NOTIFICATION.SUCCESS - enterprise', () => {
    const hostname = 'github.gitify.io';

    const currentState = reducer(undefined, {}).setIn(
      ['response', 0],
      Map({
        hostname,
        notifications: mockedEnterpriseNotifications,
      })
    );

    const action = {
      type: MARK_ACCOUNT_NOTIFICATION.SUCCESS,
      meta: { hostname },
    };

    expect(reducer(currentState, action)).toMatchSnapshot();
  });

  it('should handle LOGOUT', () => {
    const currentState = reducer(undefined, {}).setIn(
      ['response', 0],
      Map({
        hostname: 'github.gitify.io',
        notifications: mockedEnterpriseNotifications,
      })
    );

    const action = {
      type: LOGOUT,
    };

    expect(reducer(currentState, action)).toMatchSnapshot();
  });
});
