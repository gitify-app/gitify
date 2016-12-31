const { ipcRenderer } = require('electron');

import * as actions from '../../actions';
import settingsMiddleware from '../../middleware/settings';

const createFakeStore = fakeData => ({
  getState() {
    return {
      notifications: {},
      settings: {
        openAtStartup: false,
        playSound: false,
        showNotifications: false
      }
    };
  }
});

const dispatchWithStoreOf = (storeData, action) => {
  let dispatched = null;
  const dispatch = settingsMiddleware(createFakeStore(storeData))(actionAttempt => dispatched = actionAttempt);
  dispatch(action);
  return dispatched;
};

describe('middleware/settings.js', () => {
  beforeEach(function() {
    ipcRenderer.send.mockReset();
  });

  it('should mark auto-launch setting to true (enable)', () => {
    const action = {
      type: actions.UPDATE_SETTING,
      setting: 'openAtStartup',
      value: true
    };

    expect(dispatchWithStoreOf({}, action)).toEqual(action);

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('startup-enable');
  });

  it('should mark auto-launch setting to false (disable)', () => {
    const action = {
      type: actions.UPDATE_SETTING,
      setting: 'openAtStartup',
      value: false
    };

    expect(dispatchWithStoreOf({}, action)).toEqual(action);

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('startup-disable');
  });
});
