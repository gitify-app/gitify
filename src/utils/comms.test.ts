import { ipcRenderer, shell } from 'electron';
import { openExternalLink, setAutoLaunch, updateTrayIcon } from './comms';

describe('utils/comms.ts', () => {
  beforeEach(() => {
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

  it('should open an external link', () => {
    openExternalLink('http://www.gitify.io/');
    expect(shell.openExternal).toHaveBeenCalledTimes(1);
    expect(shell.openExternal).toHaveBeenCalledWith('http://www.gitify.io/');
  });

  it('should ignore opening external local links file:///', () => {
    openExternalLink('file:///Applications/SomeApp.app');
    expect(shell.openExternal).toHaveBeenCalledTimes(0);
  });

  it('should setAutoLaunch (true)', () => {
    setAutoLaunch(true);

    expect(ipcRenderer.send).toHaveBeenCalledWith('set-login-item-settings', {
      openAtLogin: true,
      openAsHidden: true,
    });
  });

  it('should setAutoLaunch (false)', () => {
    setAutoLaunch(false);

    expect(ipcRenderer.send).toHaveBeenCalledWith('set-login-item-settings', {
      openAsHidden: false,
      openAtLogin: false,
    });
  });
});
