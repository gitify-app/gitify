import {
  updateTrayIcon,
  openExternalLink,
  setAutoLaunch,
  restoreSetting,
} from './comms';

const { ipcRenderer, shell } = require('electron');

const remote = require('@electron/remote');

describe('utils/comms.ts', () => {
  beforeEach(function() {
    jest.spyOn(ipcRenderer, 'send');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send mark the icons as active', () => {
    const notificationsLength = 3;
    updateTrayIcon(notificationsLength);
    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('update-icon', 'TrayActive');
  });

  it('should send mark the icons as idle', () => {
    const notificationsLength = 0;
    updateTrayIcon(notificationsLength);
    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('update-icon');
  });

  it('should restore a setting', () => {
    restoreSetting('foo', 'bar');
    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('foo', 'bar');
  });

  it('should open an external link', () => {
    openExternalLink('http://www.gitify.io/');
    expect(shell.openExternal).toHaveBeenCalledTimes(1);
    expect(shell.openExternal).toHaveBeenCalledWith('http://www.gitify.io/');
  });

  it('should setAutoLaunch (true)', () => {
    jest.spyOn(remote.app, 'setLoginItemSettings');

    setAutoLaunch(true);
    expect(remote.app.setLoginItemSettings).toHaveBeenCalledTimes(1);
    expect(remote.app.setLoginItemSettings).toHaveBeenCalledWith({
      openAtLogin: true,
      openAsHidden: true,
    });
  });

  it('should setAutoLaunch (false)', () => {
    jest.spyOn(remote.app, 'setLoginItemSettings');

    setAutoLaunch(false);
    expect(remote.app.setLoginItemSettings).toHaveBeenCalledTimes(1);
    expect(remote.app.setLoginItemSettings).toHaveBeenCalledWith({
      openAtLogin: false,
      openAsHidden: false,
    });
  });
});
