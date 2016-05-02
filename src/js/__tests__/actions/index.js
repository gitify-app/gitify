import { expect } from 'chai';
import nock from 'nock';
import { apiMiddleware } from 'redux-api-middleware';
import configureMockStore from 'redux-mock-store';
import * as actions from '../../actions';

const middlewares = [ apiMiddleware ];
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
      { type: actions.LOGIN_REQUEST, payload: undefined, meta: undefined },
      { type: actions.LOGIN_SUCCESS, payload: { body: { access_token: 'THISISATOKEN' } }, meta: undefined }
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
      { type: actions.LOGIN_REQUEST, payload: undefined, meta: undefined },
      { type: actions.LOGIN_FAILURE, payload: { body: { message } }, error: true, meta: undefined }
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
