const { remote } = require('electron');

import * as actions from '../actions';
import settingsMiddleware from './settings';

const dispatchWithStoreOf = (_, action) => {
  let dispatched = null;
  const dispatch = settingsMiddleware()(
    (actionAttempt) => (dispatched = actionAttempt)
  );
  dispatch(action);
  return dispatched;
};

describe('middleware/settings.js', () => {
  it('should toggle the openAtStartup setting', () => {
    spyOn(remote.app, 'setLoginItemSettings');

    const action = {
      type: actions.UPDATE_SETTING,
      setting: 'openAtStartup',
      value: true,
    };

    expect(dispatchWithStoreOf({}, action)).toEqual(action);

    expect(remote.app.setLoginItemSettings).toHaveBeenCalledTimes(1);
  });
});
