import { expect } from 'chai';
import * as actions from '../../actions';
import settingsMiddleware from '../../middleware/settings';
const ipcRenderer = window.require('electron').ipcRenderer;

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
    ipcRenderer.send.reset();
  });

  it('should mark auto-launch setting to true (enable)', () => {

    const action = {
      type: actions.UPDATE_SETTING,
      setting: 'openAtStartup',
      value: true
    };

    expect(dispatchWithStoreOf({}, action)).to.eql(action);

    expect(ipcRenderer.send).to.have.been.calledOnce;
    expect(ipcRenderer.send).to.have.been.calledWith('startup-enable');

  });

  it('should mark auto-launch setting to false (disable)', () => {

    const action = {
      type: actions.UPDATE_SETTING,
      setting: 'openAtStartup',
      value: false
    };

    expect(dispatchWithStoreOf({}, action)).to.eql(action);

    expect(ipcRenderer.send).to.have.been.calledOnce;
    expect(ipcRenderer.send).to.have.been.calledWith('startup-disable');

  });
});
