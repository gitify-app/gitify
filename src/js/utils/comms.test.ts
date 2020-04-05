import {
  updateTrayIcon,
  reOpenWindow,
  openExternalLink,
  setAutoLaunch,
} from './comms';

const { ipcRenderer, remote, shell } = require('electron');

describe('utils/comms.ts', () => {
  beforeEach(function () {
    spyOn(ipcRenderer, 'send');
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
    spyOn(remote.app, 'setLoginItemSettings');

    setAutoLaunch(true);
    expect(remote.app.setLoginItemSettings).toHaveBeenCalledTimes(1);
    expect(remote.app.setLoginItemSettings).toHaveBeenCalledWith({
      openAtLogin: true,
      openAsHidden: true,
    });
  });

  it('should setAutoLaunch (false)', () => {
    spyOn(remote.app, 'setLoginItemSettings');

    setAutoLaunch(false);
    expect(remote.app.setLoginItemSettings).toHaveBeenCalledTimes(1);
    expect(remote.app.setLoginItemSettings).toHaveBeenCalledWith({
      openAtLogin: false,
      openAsHidden: false,
    });
  });
});
