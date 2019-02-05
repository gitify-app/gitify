const { ipcRenderer } = require('electron');

import * as actions from '../actions';
import settingsMiddleware from './settings';

const createFakeStore = () => ({
  getState() {
    return {
      notifications: {},
      settings: {
        openAtStartup: false,
        playSound: false,
        showNotifications: false,
      },
    };
  },
});

const dispatchWithStoreOf = (storeData, action) => {
  let dispatched = null;
  const dispatch = settingsMiddleware(createFakeStore(storeData))(
    actionAttempt => (dispatched = actionAttempt)
  );
  dispatch(action);
  return dispatched;
};

describe('middleware/settings.js', () => {
  beforeEach(function() {
    ipcRenderer.send.mockReset();
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

  it('should toggle showAppIcon', () => {
    const action = {
      type: actions.UPDATE_SETTING,
      setting: 'showAppIcon',
      value: 'both',
    };

    expect(dispatchWithStoreOf({}, action)).toEqual(action);

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('show-app-icon', 'both');
  });
});
