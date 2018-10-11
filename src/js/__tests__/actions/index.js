import nock from 'nock';
import axios from 'axios';
import { fromJS, Map, List } from 'immutable';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions';
import Constants from '../../utils/constants';
import { mockedEnterpriseAccounts } from '../../__mocks__/mockedData';

const middlewares = [thunk];
const createMockStore = configureMockStore(middlewares);

describe('actions/index.js', () => {
  const mockEnterpriseAuthOptions = {
    hostname: 'github.gitify.io',
    clientId: '1a1a1a1a1a1a1a1a1a1a',
    clientSecret: '2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b',
  };

  beforeEach(() => {
    axios.defaults.adapter = require('axios/lib/adapters/http');
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should login a user (non enterprise) with success', () => {
    const authOptions = Constants.DEFAULT_AUTH_OPTIONS;
    const code = 'THISISACODE';

    nock('https://github.com/')
      .post('/login/oauth/access_token', {})
      .reply(200, {
        access_token: 'THISISATOKEN',
      });

    const expectedActions = [
      { type: actions.LOGIN.REQUEST },
      {
        type: actions.LOGIN.SUCCESS,
        isEnterprise: false,
        hostname: 'github.com',
        payload: { access_token: 'THISISATOKEN' },
      },
    ];

    const store = createMockStore({}, expectedActions);

    return store.dispatch(actions.loginUser(authOptions, code)).then(() => {
      // return of async actions
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should login a user (non enterprise) with failure', () => {
    const authOptions = Constants.DEFAULT_AUTH_OPTIONS;
    const code = 'THISISACODE';
    const message = 'Oops! Something went wrong.';

    nock('https://github.com/')
      .post('/login/oauth/access_token', {})
      .reply(400, { message });

    const expectedActions = [
      { type: actions.LOGIN.REQUEST },
      {
        type: actions.LOGIN.FAILURE,
        payload: { message },
      },
    ];

    const store = createMockStore({}, expectedActions);

    return store.dispatch(actions.loginUser(authOptions, code)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should login a user (enterprise) with success', () => {
    const authOptions = mockEnterpriseAuthOptions;
    const code = 'THISISACODE';

    nock('https://github.gitify.io/')
      .post('/login/oauth/access_token', {})
      .reply(200, {
        access_token: 'THISISATOKEN',
      });

    const expectedActions = [
      { type: actions.LOGIN.REQUEST },
      {
        type: actions.LOGIN.SUCCESS,
        isEnterprise: true,
        hostname: 'github.gitify.io',
        payload: { access_token: 'THISISATOKEN' },
      },
    ];

    const store = createMockStore({}, expectedActions);

    return store.dispatch(actions.loginUser(authOptions, code)).then(() => {
      // return of async actions
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should login a user (enterprise) with failure', () => {
    const authOptions = mockEnterpriseAuthOptions;
    const code = 'THISISACODE';
    const message = 'Oops! Something went wrong.';

    nock('https://github.gitify.io/')
      .post('/login/oauth/access_token', {})
      .reply(400, { message });

    const expectedActions = [
      { type: actions.LOGIN.REQUEST },
      {
        type: actions.LOGIN.FAILURE,
        payload: { message },
      },
    ];

    const store = createMockStore({}, expectedActions);

    return store.dispatch(actions.loginUser(authOptions, code)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should logout a user', () => {
    const expectedAction = {
      type: actions.LOGOUT,
    };

    expect(actions.logout()).toEqual(expectedAction);
  });

  it('should fetch notifications with success - github.com & enterprise', () => {
    const notifications = [
      { id: 1, title: 'This is a notification.' },
      { id: 2, title: 'This is another one.' },
    ];

    nock('https://api.github.com/')
      .get('/notifications?participating=false')
      .reply(200, notifications);

    nock('https://github.gitify.io/api/v3/')
      .get('/notifications?participating=false')
      .reply(200, notifications);

    const expectedPayload = fromJS([
      {
        hostname: 'github.gitify.io',
        notifications: [
          { id: 1, title: 'This is a notification.' },
          { id: 2, title: 'This is another one.' },
        ],
      },
      {
        hostname: 'github.com',
        notifications: [
          { id: 1, title: 'This is a notification.' },
          { id: 2, title: 'This is another one.' },
        ],
      },
    ]);

    const expectedActions = [
      { type: actions.NOTIFICATIONS.REQUEST },
      { type: actions.NOTIFICATIONS.SUCCESS, payload: expectedPayload },
    ];

    const store = createMockStore(
      {
        auth: Map({
          token: 'THISISATOKEN',
          enterpriseAccounts: mockedEnterpriseAccounts,
        }),
        settings: Map({
          participating: false,
        }),
        notifications: Map({ response: List() }),
      },
      expectedActions
    );

    return store.dispatch(actions.fetchNotifications()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should fetch notifications with failure - github.com & enterprise', () => {
    const message = 'Oops! Something went wrong.';

    nock('https://api.github.com/')
      .get('/notifications?participating=false')
      .reply(400, { message });

    nock('https://github.gitify.io/api/v3/')
      .get('/notifications?participating=false')
      .reply(400, { message });

    const expectedActions = [
      { type: actions.NOTIFICATIONS.REQUEST },
      { type: actions.NOTIFICATIONS.FAILURE, payload: { message } },
    ];

    const store = createMockStore(
      {
        auth: Map({
          token: 'THISISATOKEN',
          enterpriseAccounts: mockedEnterpriseAccounts,
        }),
        settings: Map({
          participating: false,
        }),
        notifications: Map({ response: List() }),
      },
      expectedActions
    );

    return store.dispatch(actions.fetchNotifications()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should fetch notifications with success - enterprise only', () => {
    const notifications = [
      { id: 1, title: 'This is a notification.' },
      { id: 2, title: 'This is another one.' },
    ];

    nock('https://github.gitify.io/api/v3/')
      .get('/notifications?participating=false')
      .reply(200, notifications);

    const expectedPayload = fromJS([
      {
        hostname: 'github.gitify.io',
        notifications: [
          { id: 1, title: 'This is a notification.' },
          { id: 2, title: 'This is another one.' },
        ],
      },
    ]);

    const expectedActions = [
      { type: actions.NOTIFICATIONS.REQUEST },
      { type: actions.NOTIFICATIONS.SUCCESS, payload: expectedPayload },
    ];

    const store = createMockStore(
      {
        auth: Map({
          token: null,
          enterpriseAccounts: mockedEnterpriseAccounts,
        }),
        settings: Map({
          participating: false,
        }),
        notifications: Map({ response: List() }),
      },
      expectedActions
    );

    return store.dispatch(actions.fetchNotifications()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should fetch notifications with failure - enterprise only', () => {
    const message = 'Oops! Something went wrong.';

    nock('https://github.gitify.io/api/v3/')
      .get('/notifications?participating=false')
      .reply(400, { message });

    const expectedActions = [
      { type: actions.NOTIFICATIONS.REQUEST },
      { type: actions.NOTIFICATIONS.FAILURE, payload: { message } },
    ];

    const store = createMockStore(
      {
        auth: Map({
          token: null,
          enterpriseAccounts: mockedEnterpriseAccounts,
        }),
        settings: Map({
          participating: false,
        }),
        notifications: Map({ response: List() }),
      },
      expectedActions
    );

    return store.dispatch(actions.fetchNotifications()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should fetch notifications with success - github.com only', () => {
    const notifications = [
      { id: 1, title: 'This is a notification.' },
      { id: 2, title: 'This is another one.' },
    ];

    nock('https://api.github.com/')
      .get('/notifications?participating=false')
      .reply(200, notifications);

    const expectedPayload = fromJS([
      {
        hostname: 'github.com',
        notifications: notifications,
      },
    ]);

    const expectedActions = [
      { type: actions.NOTIFICATIONS.REQUEST },
      { type: actions.NOTIFICATIONS.SUCCESS, payload: expectedPayload },
    ];

    const store = createMockStore(
      {
        auth: Map({
          token: 'THISISATOKEN',
          enterpriseAccounts: List(),
        }),
        settings: Map({
          participating: false,
        }),
        notifications: Map({ response: List() }),
      },
      expectedActions
    );

    return store.dispatch(actions.fetchNotifications()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should fetch notifications with failure - github.com only', () => {
    const message = 'Oops! Something went wrong.';

    nock('https://api.github.com/')
      .get('/notifications?participating=false')
      .reply(400, { message });

    const expectedActions = [
      { type: actions.NOTIFICATIONS.REQUEST },
      { type: actions.NOTIFICATIONS.FAILURE, payload: { message } },
    ];

    const store = createMockStore(
      {
        auth: Map({
          token: 'THISISATOKEN',
          enterpriseAccounts: List(),
        }),
        settings: Map({
          participating: false,
        }),
        notifications: Map({ response: List() }),
      },
      expectedActions
    );

    return store.dispatch(actions.fetchNotifications()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should mark a notification as read with success - github.com', () => {
    const id = 123;
    const hostname = 'github.com';
    const message = 'Success.';

    nock('https://api.github.com/')
      .patch(`/notifications/threads/${id}`)
      .reply(200, { message });

    const expectedActions = [
      { type: actions.MARK_NOTIFICATION.REQUEST },
      {
        type: actions.MARK_NOTIFICATION.SUCCESS,
        payload: { message },
        meta: { id, hostname },
      },
    ];

    const store = createMockStore(
      {
        auth: Map({
          token: 'THISISATOKEN',
          enterpriseAccounts: mockedEnterpriseAccounts,
        }),
        notifications: Map({ response: List() }),
      },
      expectedActions
    );

    return store.dispatch(actions.markNotification(id, hostname)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should mark a notification as read with failure - github.com', () => {
    const id = 123;
    const hostname = 'github.com';
    const message = 'Oops! Something went wrong.';

    nock('https://api.github.com/')
      .patch(`/notifications/threads/${id}`)
      .reply(400, { message });

    const expectedActions = [
      { type: actions.MARK_NOTIFICATION.REQUEST },
      { type: actions.MARK_NOTIFICATION.FAILURE, payload: { message } },
    ];

    const store = createMockStore(
      {
        auth: Map({
          token: 'THISISATOKEN',
          enterpriseAccounts: mockedEnterpriseAccounts,
        }),
        settings: Map({
          participating: false,
        }),
        notifications: Map({ response: List() }),
      },
      expectedActions
    );

    return store.dispatch(actions.markNotification(id, hostname)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should mark a notification as read with success - enterprise', () => {
    const id = 123;
    const hostname = 'github.gitify.io';
    const message = 'Success.';

    nock('https://github.gitify.io/api/v3/')
      .patch(`/notifications/threads/${id}`)
      .reply(200, { message });

    const expectedActions = [
      { type: actions.MARK_NOTIFICATION.REQUEST },
      {
        type: actions.MARK_NOTIFICATION.SUCCESS,
        payload: { message },
        meta: { id, hostname },
      },
    ];

    const store = createMockStore(
      {
        auth: Map({
          token: 'THISISATOKEN',
          enterpriseAccounts: mockedEnterpriseAccounts,
        }),
        notifications: Map({ response: List() }),
      },
      expectedActions
    );

    return store.dispatch(actions.markNotification(id, hostname)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should mark a notification as read with failure - enterprise', () => {
    const id = 123;
    const hostname = 'github.gitify.io';
    const message = 'Oops! Something went wrong.';

    nock('https://github.gitify.io/api/v3/')
      .patch(`/notifications/threads/${id}`)
      .reply(400, { message });

    const expectedActions = [
      { type: actions.MARK_NOTIFICATION.REQUEST },
      { type: actions.MARK_NOTIFICATION.FAILURE, payload: { message } },
    ];

    const store = createMockStore(
      {
        auth: Map({
          token: 'THISISATOKEN',
          enterpriseAccounts: mockedEnterpriseAccounts,
        }),
      },
      expectedActions
    );

    return store.dispatch(actions.markNotification(id, hostname)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it("should mark a repository's notifications as read with success - github.com", () => {
    const hostname = 'github.com';
    const repoSlug = 'manosim/gitify';
    const message = 'Success.';

    nock('https://api.github.com/')
      .put(`/repos/${repoSlug}/notifications`)
      .reply(200, { message });

    const expectedActions = [
      { type: actions.MARK_REPO_NOTIFICATION.REQUEST },
      {
        type: actions.MARK_REPO_NOTIFICATION.SUCCESS,
        payload: { message },
        meta: { repoSlug, hostname },
      },
    ];

    const store = createMockStore(
      {
        auth: Map({ token: 'IAMATOKEN' }),
      },
      expectedActions
    );

    return store
      .dispatch(actions.markRepoNotifications(repoSlug, hostname))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
  });

  it("should mark a repository's notifications as read with failure - github.com", () => {
    const hostname = 'github.com';
    const repoSlug = 'manosim/gitify';
    const message = 'Oops! Something went wrong.';

    nock('https://api.github.com/')
      .put(`/repos/${repoSlug}/notifications`)
      .reply(400, { message });

    const expectedActions = [
      { type: actions.MARK_REPO_NOTIFICATION.REQUEST },
      { type: actions.MARK_REPO_NOTIFICATION.FAILURE, payload: { message } },
    ];

    const store = createMockStore(
      {
        auth: Map({
          token: 'THISISATOKEN',
          enterpriseAccounts: mockedEnterpriseAccounts,
        }),
      },
      expectedActions
    );

    return store
      .dispatch(actions.markRepoNotifications(repoSlug, hostname))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
  });

  it("should mark a repository's notifications as read with success - enterprise", () => {
    const hostname = 'github.gitify.io';
    const repoSlug = 'manosim/gitify';
    const message = 'Success.';

    nock('https://github.gitify.io/api/v3/')
      .put(`/repos/${repoSlug}/notifications`)
      .reply(200, { message });

    const expectedActions = [
      { type: actions.MARK_REPO_NOTIFICATION.REQUEST },
      {
        type: actions.MARK_REPO_NOTIFICATION.SUCCESS,
        payload: { message },
        meta: { repoSlug, hostname },
      },
    ];

    const store = createMockStore(
      {
        auth: Map({
          token: 'THISISATOKEN',
          enterpriseAccounts: mockedEnterpriseAccounts,
        }),
      },
      expectedActions
    );

    return store
      .dispatch(actions.markRepoNotifications(repoSlug, hostname))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
  });

  it("should mark a repository's notifications as read with failure - enterprise", () => {
    const hostname = 'github.gitify.io';
    const repoSlug = 'manosim/gitify';
    const message = 'Oops! Something went wrong.';

    nock('https://github.gitify.io/api/v3/')
      .put(`/repos/${repoSlug}/notifications`)
      .reply(400, { message });

    const expectedActions = [
      { type: actions.MARK_REPO_NOTIFICATION.REQUEST },
      { type: actions.MARK_REPO_NOTIFICATION.FAILURE, payload: { message } },
    ];

    const store = createMockStore(
      {
        auth: Map({
          token: 'THISISATOKEN',
          enterpriseAccounts: mockedEnterpriseAccounts,
        }),
      },
      expectedActions
    );

    return store
      .dispatch(actions.markRepoNotifications(repoSlug, hostname))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
  });

  it("should mark an account's notifications as read with success - github.com", () => {
    const hostname = 'github.com';
    const message = 'Success.';

    nock('https://api.github.com/')
      .put('/notifications')
      .reply(200, { message });

    const expectedActions = [
      { type: actions.MARK_ACCOUNT_NOTIFICATION.REQUEST },
      {
        type: actions.MARK_ACCOUNT_NOTIFICATION.SUCCESS,
        payload: { message },
        meta: { hostname },
      },
    ];

    const store = createMockStore(
      {
        auth: Map({ token: 'IAMATOKEN' }),
      },
      expectedActions
    );

    return store
      .dispatch(actions.markAccountNotifications(hostname))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
  });

  it("should mark an account's notifications as read with failure - github.com", () => {
    const hostname = 'github.com';
    const message = 'Oops! Something went wrong.';

    nock('https://api.github.com/')
      .put('/notifications')
      .reply(400, { message });

    const expectedActions = [
      { type: actions.MARK_ACCOUNT_NOTIFICATION.REQUEST },
      { type: actions.MARK_ACCOUNT_NOTIFICATION.FAILURE, payload: { message } },
    ];

    const store = createMockStore(
      {
        auth: Map({
          token: 'THISISATOKEN',
          enterpriseAccounts: mockedEnterpriseAccounts,
        }),
      },
      expectedActions
    );

    return store
      .dispatch(actions.markAccountNotifications(hostname))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
  });

  it("should mark an account's notifications as read with success - enterprise", () => {
    const hostname = 'github.gitify.io';
    const message = 'Success.';

    nock('https://github.gitify.io/api/v3/')
      .put('/notifications')
      .reply(200, { message });

    const expectedActions = [
      { type: actions.MARK_ACCOUNT_NOTIFICATION.REQUEST },
      {
        type: actions.MARK_ACCOUNT_NOTIFICATION.SUCCESS,
        payload: { message },
        meta: { hostname },
      },
    ];

    const store = createMockStore(
      {
        auth: Map({
          token: 'THISISATOKEN',
          enterpriseAccounts: mockedEnterpriseAccounts,
        }),
      },
      expectedActions
    );

    return store
      .dispatch(actions.markAccountNotifications(hostname))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
  });

  it("should mark an account's notifications as read with failure - enterprise", () => {
    const hostname = 'github.gitify.io';
    const message = 'Oops! Something went wrong.';

    nock('https://github.gitify.io/api/v3/')
      .put('/notifications')
      .reply(400, { message });

    const expectedActions = [
      { type: actions.MARK_ACCOUNT_NOTIFICATION.REQUEST },
      { type: actions.MARK_ACCOUNT_NOTIFICATION.FAILURE, payload: { message } },
    ];

    const store = createMockStore(
      {
        auth: Map({
          token: 'THISISATOKEN',
          enterpriseAccounts: mockedEnterpriseAccounts,
        }),
      },
      expectedActions
    );

    return store
      .dispatch(actions.markAccountNotifications(hostname))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
  });

  it('should check if the user has starred the repository (has)', () => {
    nock('https://api.github.com/')
      .get(`/user/starred/${Constants.REPO_SLUG}`)
      .reply(200);

    const expectedActions = [
      { type: actions.HAS_STARRED.REQUEST },
      { type: actions.HAS_STARRED.SUCCESS, payload: '' },
    ];

    const store = createMockStore(
      {
        auth: Map({ token: 'IAMATOKEN' }),
        settings: Map({
          participating: false,
          isEnterprise: false,
          baseUrl: 'github.com',
        }),
        notifications: Map({ response: List() }),
      },
      expectedActions
    );

    return store.dispatch(actions.checkHasStarred()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should check if the user has starred the repository (has not)', () => {
    nock('https://api.github.com/')
      .get(`/user/starred/${Constants.REPO_SLUG}`)
      .reply(404);

    const expectedActions = [
      { type: actions.HAS_STARRED.REQUEST },
      { type: actions.HAS_STARRED.FAILURE, payload: '' },
    ];

    const store = createMockStore(
      {
        auth: Map({ token: 'IAMATOKEN' }),
        settings: Map({
          participating: false,
          isEnterprise: false,
          baseUrl: 'github.com',
        }),
        notifications: Map({ response: List() }),
      },
      expectedActions
    );

    return store.dispatch(actions.checkHasStarred()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should search the notifications with a query', () => {
    const query = 'hello';

    const expectedAction = {
      type: actions.SEARCH_NOTIFICATIONS,
      query,
    };

    expect(actions.searchNotifications(query)).toEqual(expectedAction);
  });

  it('should clear the search query', () => {
    const expectedAction = {
      type: actions.CLEAR_SEARCH,
    };

    expect(actions.clearSearch()).toEqual(expectedAction);
  });

  it('should update a setting for a user', () => {
    const setting = 'participating';
    const value = true;

    const expectedAction = {
      type: actions.UPDATE_SETTING,
      setting,
      value,
    };

    expect(actions.updateSetting(setting, value)).toEqual(expectedAction);
  });

  it('should handle TOGGLE_SETTINGS_MODAL', () => {
    const expectedAction = {
      type: actions.TOGGLE_SETTINGS_MODAL,
    };

    expect(actions.toggleSettingsModal()).toEqual(expectedAction);
  });
});
