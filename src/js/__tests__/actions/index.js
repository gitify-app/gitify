import { expect } from 'chai';
import nock from 'nock';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import Constants from '../../utils/constants';
import * as actions from '../../actions';

const middlewares = [ thunk ];
const createMockStore = configureMockStore(middlewares);

describe('actions/index.js', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('should login a user with success', () => {
    const code = 'THISISACODE';

    nock('https://github.com/')
      .post('/login/oauth/access_token', {

      })
      .reply(200, {
        body: { access_token: 'THISISATOKEN' }
      });

    const expectedActions = [
      { type: actions.LOGIN.REQUEST },
      { type: actions.LOGIN.SUCCESS, payload: { body: { access_token: 'THISISATOKEN' } } }
    ];

    const store = createMockStore({ response: [] }, expectedActions);

    return store.dispatch(actions.loginUser(code))
      .then(() => { // return of async actions
        expect(store.getActions()).to.eql(expectedActions);
      });

  });

  it('should login a user with failure', () => {
    const code = 'THISISACODE';
    const message = 'Oops! Something went wrong.';

    nock('https://github.com/')
      .post('/login/oauth/access_token', {

      })
      .reply(400, {
        body: { message }
      });

    const expectedActions = [
      { type: actions.LOGIN.REQUEST },
      { type: actions.LOGIN.FAILURE, payload: { body: { message } } }
    ];

    const store = createMockStore({ response: [] }, expectedActions);

    return store.dispatch(actions.loginUser(code))
      .then(() => { // return of async actions
        expect(store.getActions()).to.eql(expectedActions);
      });

  });

  it('should logout a user', () => {

    const expectedAction = {
      type: actions.LOGOUT
    };

    expect(actions.logout()).to.eql(expectedAction);

  });

  it('should fetch notifications with success', () => {
    const notifications = [
      {
        id: 1,
        title: 'This is a notification.'
      },
      {
        id: 2,
        title: 'This is another one.'
      }
    ];

    nock('https://api.github.com/')
      .get('/notifications?participating=false')
      .reply(200, {
        body: notifications
      });

    const expectedActions = [
      { type: actions.NOTIFICATIONS.REQUEST },
      { type: actions.NOTIFICATIONS.SUCCESS, payload: { body: notifications } }
    ];

    const store = createMockStore({
      auth: { token: 'THISISATOKEN' },
      settings: { participating: false },
      response: []
    }, expectedActions);

    return store.dispatch(actions.fetchNotifications())
      .then(() => { // return of async actions
        expect(store.getActions()).to.eql(expectedActions);
      });

  });

  it('should fetch notifications with failure', () => {
    const message = 'Oops! Something went wrong.';

    nock('https://api.github.com/')
      .get('/notifications?participating=false')
      .reply(400, {
        body: { message }
      });

    const expectedActions = [
      { type: actions.NOTIFICATIONS.REQUEST },
      { type: actions.NOTIFICATIONS.FAILURE, payload: { body: { message } } }
    ];

    const store = createMockStore({
      auth: { token: null },
      settings: { participating: false },
      response: []
    }, expectedActions);

    return store.dispatch(actions.fetchNotifications())
      .then(() => { // return of async actions
        expect(store.getActions()).to.eql(expectedActions);
      });

  });

  it('should mark a notification as read with success', () => {
    const id = 123;
    const message = 'Success.';

    nock('https://api.github.com/')
      .patch(`/notifications/threads/${id}`)
      .reply(200, {
        body: message
      });

    const expectedActions = [
      { type: actions.MARK_NOTIFICATION.REQUEST },
      { type: actions.MARK_NOTIFICATION.SUCCESS, payload: { body: message }, meta: { id } }
    ];

    const store = createMockStore({
      auth: { token: 'IAMATOKEN' },
      response: []
    }, expectedActions);

    return store.dispatch(actions.markNotification(id))
      .then(() => { // return of async actions
        expect(store.getActions()).to.eql(expectedActions);
      });

  });

  it('should mark a notification as read with failure', () => {
    const id = 123;
    const message = 'Oops! Something went wrong.';

    nock('https://api.github.com/')
      .patch(`/notifications/threads/${id}`)
      .reply(400, {
        body: { message }
      });

    const expectedActions = [
      { type: actions.MARK_NOTIFICATION.REQUEST },
      { type: actions.MARK_NOTIFICATION.FAILURE, payload: { body: { message } } }
    ];

    const store = createMockStore({
      auth: { token: null },
      response: []
    }, expectedActions);

    return store.dispatch(actions.markNotification(id))
      .then(() => { // return of async actions
        expect(store.getActions()).to.eql(expectedActions);
      });

  });

  it('should mark a repository\'s notifications as read with success', () => {

    const repoSlug = 'manosim/gitify';
    const message = 'Success.';

    nock('https://api.github.com/')
      .put(`/repos/${repoSlug}/notifications`)
      .reply(200, {
        body: message
      });

    const expectedActions = [
      { type: actions.MARK_REPO_NOTIFICATION.REQUEST },
      { type: actions.MARK_REPO_NOTIFICATION.SUCCESS, payload: { body: message }, meta: { repoFullName, repoId } }
    ];

    const store = createMockStore({
      auth: { token: 'IAMATOKEN' },
      response: []
    }, expectedActions);

    return store.dispatch(actions.markRepoNotifications(repoSlug))
      .then(() => { // return of async actions
        expect(store.getActions()).to.eql(expectedActions);
      });

  });

  it('should mark a repository\'s notifications as read with failure', () => {

    const repoSlug = 'manosim/gitify';
    const message = 'Oops! Something went wrong.';

    nock('https://api.github.com/')
    .put(`/repos/${repoSlug}/notifications`)
      .reply(400, {
        body: { message }
      });

    const expectedActions = [
      { type: actions.MARK_REPO_NOTIFICATION.REQUEST },
      { type: actions.MARK_REPO_NOTIFICATION.FAILURE, payload: { body: { message } } }
    ];

    const store = createMockStore({
      auth: { token: null },
      response: []
    }, expectedActions);

    return store.dispatch(actions.markRepoNotifications(repoSlug))
      .then(() => { // return of async actions
        expect(store.getActions()).to.eql(expectedActions);
      });

  });

  it('should check if the user has starred the repository (has)', () => {
    nock('https://api.github.com/')
      .get(`/user/starred/${Constants.REPO_SLUG}`)
      .reply(200);

    const expectedActions = [
      { type: actions.HAS_STARRED.REQUEST },
      { type: actions.HAS_STARRED.SUCCESS, payload: '' }
    ];

    const store = createMockStore({
      auth: { token: 'IAMATOKEN' },
      response: []
    }, expectedActions);

    return store.dispatch(actions.checkHasStarred())
      .then(() => { // return of async actions
        expect(store.getActions()).to.eql(expectedActions);
      });

  });

  it('should check if the user has starred the repository (has not)', () => {
    nock('https://api.github.com/')
      .get(`/user/starred/${Constants.REPO_SLUG}`)
      .reply(404);

    const expectedActions = [
      { type: actions.HAS_STARRED.REQUEST },
      { type: actions.HAS_STARRED.FAILURE, payload: '' }
    ];

    const store = createMockStore({
      auth: { token: 'IAMATOKEN' },
      response: []
    }, expectedActions);

    return store.dispatch(actions.checkHasStarred())
      .then(() => { // return of async actions
        expect(store.getActions()).to.eql(expectedActions);
      });

  });

  it('should search the notifications with a query', () => {

    const query = 'hello';

    const expectedAction = {
      type: actions.SEARCH_NOTIFICATIONS,
      query
    };

    expect(actions.searchNotifications(query)).to.eql(expectedAction);

  });

  it('should clear the search query', () => {

    const expectedAction = {
      type: actions.CLEAR_SEARCH
    };

    expect(actions.clearSearch()).to.eql(expectedAction);

  });

  it('should update a setting for a user', () => {

    const setting = 'participating';
    const value = true;

    const expectedAction = {
      type: actions.UPDATE_SETTING,
      setting,
      value
    };

    expect(actions.updateSetting(setting, value)).to.eql(expectedAction);

  });
});
