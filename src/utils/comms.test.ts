import { ipcRenderer, shell } from 'electron';
import {
  updateTrayIcon,
  openExternalLink,
  setAutoLaunch,
  restoreSetting,
} from './comms';

describe('utils/comms.ts', () => {
  beforeEach(function () {
    jest.spyOn(ipcRenderer, 'send');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send mark the icon as active', () => {
    const notificationsCount = 3;
    updateTrayIcon({ notificationsCount });
    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('update-icon', {
      notificationsCount: 3,
    });
  });

  it('should send mark the icon as idle', () => {
    const notificationsCount = 0;
    updateTrayIcon({ notificationsCount });
    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('update-icon', {
      notificationsCount: 0,
      showNotificationsCountInTray: undefined,
    });
  });

  it('should send showNotificationsCountInTray true (with notifications)', () => {
    const notificationsCount = 2;
    const showNotificationsCountInTray = true;
    updateTrayIcon({ notificationsCount, showNotificationsCountInTray });
    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('update-icon', {
      notificationsCount,
      showNotificationsCountInTray,
    });
  });

  it('should send showNotificationsCountInTray true (without notifications)', () => {
    const showNotificationsCountInTray = true;
    updateTrayIcon({ showNotificationsCountInTray });
    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('update-icon', {
      notificationsCount: undefined,
      showNotificationsCountInTray,
    });
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
