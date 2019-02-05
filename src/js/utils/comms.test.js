import {
  updateTrayIcon,
  setBadge,
  reOpenWindow,
  openExternalLink,
  setAutoLaunch,
} from './comms';

const { ipcRenderer, shell } = require('electron');

describe('utils/comms.js', () => {
  beforeEach(function() {
    ipcRenderer.send.mockReset();
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

  it('should set the badge count', () => {
    setBadge(3);
    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('set-badge', 3);
  });

  it('should reopen the window', () => {
    reOpenWindow();
    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('reopen-window');
  });

  it('should open an external link', () => {
    openExternalLink('http://www.gitify.io/');
    expect(shell.openExternal).toHaveBeenCalledTimes(1);
    expect(shell.openExternal).toHaveBeenCalledWith('http://www.gitify.io/');
  });

  it('should setAutoLaunch (true)', () => {
    setAutoLaunch(true);
    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('startup-enable');
  });

  it('should setAutoLaunch (false)', () => {
    setAutoLaunch(false);
    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('startup-disable');
  });
});
