const { ipcRenderer } = require('electron');

import * as actions from '../actions';
import settingsMiddleware from './settings';

const dispatchWithStoreOf = (_, action) => {
  let dispatched = null;
  const dispatch = settingsMiddleware()(
    actionAttempt => (dispatched = actionAttempt)
  );
  dispatch(action);
  return dispatched;
};

describe('middleware/settings.js', () => {
  beforeEach(function() {
    spyOn(ipcRenderer, 'send');
  });

  it('should toggle the openAtStartup setting', () => {
    const action = {
      type: actions.UPDATE_SETTING,
      setting: 'openAtStartup',
      value: true,
    };

    expect(dispatchWithStoreOf({}, action)).toEqual(action);

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('startup-enable');
  });

  it('should toggle appPosition', () => {
    const action = {
      type: actions.UPDATE_SETTING,
      setting: 'appPosition',
      value: 'window',
    };

    expect(dispatchWithStoreOf({}, action)).toEqual(action);

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('set-app-position', 'window');
  });
});
