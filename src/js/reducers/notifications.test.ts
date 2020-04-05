import Constants from '../utils/constants';
import reducer from './notifications';
import {
  NOTIFICATIONS,
  MARK_NOTIFICATION,
  MARK_REPO_NOTIFICATION,
} from '../actions';
import {
  mockedGithubNotifications,
  mockedEnterpriseNotifications,
} from '../__mocks__/mockedData';
import { LOGOUT } from '../../types/actions';
import { NotificationsState } from '../../types/reducers';

describe('reducers/notifications.ts', () => {
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
    const id = '138661096';
    const hostname = 'github.com';

    const action = {
      type: MARK_NOTIFICATION.SUCCESS,
      meta: { id, hostname },
    };

    const currentState: NotificationsState = {
      isFetching: false,
      failed: false,
      response: [
        {
          hostname,
          notifications: mockedGithubNotifications,
        },
      ],
    };

    expect(reducer(currentState, action)).toMatchSnapshot();
  });

  it('should handle MARK_NOTIFICATION.SUCCESS - github.com (without snapshot)', () => {
    const id = '138661096';
    const hostname = 'github.com';

    const action = {
      type: MARK_NOTIFICATION.SUCCESS,
      meta: { id, hostname },
    };

    const currentState: NotificationsState = {
      isFetching: false,
      failed: false,
      response: [
        {
          hostname,
          notifications: mockedGithubNotifications,
        },
      ],
    };

    expect(reducer(currentState, action)).toMatchObject({
      isFetching: false,
      failed: false,
      response: [
        {
          hostname,
          notifications: [mockedGithubNotifications[1]],
        },
      ],
    });
  });

  it('should handle MARK_NOTIFICATION.SUCCESS - enterprise', () => {
    const id = '4';
    const hostname = 'github.gitify.io';

    const action = {
      type: MARK_NOTIFICATION.SUCCESS,
      meta: { id, hostname },
    };

    const currentState: NotificationsState = {
      isFetching: false,
      failed: false,
      response: [
        {
          hostname,
          notifications: mockedEnterpriseNotifications,
        },
      ],
    };

    expect(reducer(currentState, action)).toMatchSnapshot();
  });

  it('should handle MARK_NOTIFICATION.SUCCESS - enterprise (without snapshot)', () => {
    const id = '4';
    const hostname = 'github.gitify.io';

    const action = {
      type: MARK_NOTIFICATION.SUCCESS,
      meta: { id, hostname },
    };

    const currentState: NotificationsState = {
      isFetching: false,
      failed: false,
      response: [
        {
          hostname,
          notifications: mockedEnterpriseNotifications,
        },
      ],
    };

    expect(reducer(currentState, action)).toMatchObject({
      isFetching: false,
      failed: false,
      response: [
        {
          hostname,
          notifications: mockedEnterpriseNotifications.filter(
            (item) => item.id !== id
          ),
        },
      ],
    });
  });

  it('should handle MARK_REPO_NOTIFICATION.SUCCESS - github.com', () => {
    const repoSlug = 'manosim/notifications-test';
    const hostname = 'github.gitify.io';

    const currentState: NotificationsState = {
      isFetching: false,
      failed: false,
      response: [
        {
          hostname,
          notifications: mockedGithubNotifications,
        },
      ],
    };

    const action = {
      type: MARK_REPO_NOTIFICATION.SUCCESS,
      meta: { hostname, repoSlug },
    };

    expect(reducer(currentState, action)).toMatchSnapshot();
  });

  it('should handle MARK_REPO_NOTIFICATION.SUCCESS - github.com (without snapshot)', () => {
    const repoSlug = 'manosim/notifications-test';
    const hostname = 'github.com';

    const currentState: NotificationsState = {
      isFetching: false,
      failed: false,
      response: [
        {
          hostname,
          notifications: mockedGithubNotifications,
        },
      ],
    };

    const action = {
      type: MARK_REPO_NOTIFICATION.SUCCESS,
      meta: { hostname, repoSlug },
    };

    expect(reducer(currentState, action)).toMatchObject({
      isFetching: false,
      failed: false,
      response: [
        {
          hostname,
          notifications: mockedGithubNotifications.filter(
            (item) => item.repository.full_name !== repoSlug
          ),
        },
      ],
    });
  });

  it('should handle MARK_REPO_NOTIFICATION.SUCCESS - enterprise', () => {
    const repoSlug = 'myorg/notifications-test';
    const hostname = 'github.gitify.io';

    const currentState: NotificationsState = {
      isFetching: false,
      failed: false,
      response: [
        {
          hostname,
          notifications: mockedEnterpriseNotifications,
        },
      ],
    };

    const action = {
      type: MARK_REPO_NOTIFICATION.SUCCESS,
      meta: { hostname, repoSlug },
    };

    expect(reducer(currentState, action)).toMatchSnapshot();
  });

  it('should handle LOGOUT', () => {
    const currentState: NotificationsState = {
      isFetching: false,
      failed: false,
      response: [
        {
          hostname: 'github.gitify.io',
          notifications: mockedEnterpriseNotifications,
        },
      ],
    };

    const action = {
      type: LOGOUT,
    };

    expect(reducer(currentState, action)).toMatchSnapshot();
  });
});
