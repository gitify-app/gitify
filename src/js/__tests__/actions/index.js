import { expect } from 'chai';
import * as actions from '../../actions';

describe('actions/index.js', () => {
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
