import { ipcRenderer, shell } from 'electron';
import { mockSettings } from '../__mocks__/state-mocks';
import type { Link } from '../types';
import {
  getAppVersion,
  hideWindow,
  openExternalLink,
  quitApp,
  setAutoLaunch,
  showWindow,
  updateTrayIcon,
} from './comms';
import * as storage from './storage';

describe('utils/comms.ts', () => {
  beforeEach(() => {
    jest.spyOn(ipcRenderer, 'send');
    jest.spyOn(ipcRenderer, 'invoke');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get app version', async () => {
    await getAppVersion();
    expect(ipcRenderer.invoke).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.invoke).toHaveBeenCalledWith('gitify:version');
  });

  it('should quit the app', () => {
    quitApp();
    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('gitify:quit');
  });

  it('should show the window', () => {
    showWindow();
    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('gitify:window-show');
  });

  it('should hide the window', () => {
    hideWindow();
    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('gitify:window-hide');
  });

  it('should send mark the icons as active', () => {
    const notificationsLength = 3;
    updateTrayIcon(notificationsLength);
    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('gitify:icon-active');
  });

  it('should send mark the icons as idle', () => {
    const notificationsLength = 0;
    updateTrayIcon(notificationsLength);
    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('gitify:icon-idle');
  });

  it('should open an external link', () => {
    jest
      .spyOn(storage, 'loadState')
      .mockReturnValue({ settings: mockSettings });

    openExternalLink('http://www.gitify.io/' as Link);
    expect(shell.openExternal).toHaveBeenCalledTimes(1);
    expect(shell.openExternal).toHaveBeenCalledWith('http://www.gitify.io/', {
      activate: true,
    });
  });

  it('should ignore opening external local links file:///', () => {
    openExternalLink('file:///Applications/SomeApp.app' as Link);
    expect(shell.openExternal).toHaveBeenCalledTimes(0);
  });

  it('should setAutoLaunch (true)', () => {
    setAutoLaunch(true);

    expect(ipcRenderer.send).toHaveBeenCalledWith('gitify:update-auto-launch', {
      openAtLogin: true,
      openAsHidden: true,
    });
  });

  it('should setAutoLaunch (false)', () => {
    setAutoLaunch(false);

    expect(ipcRenderer.send).toHaveBeenCalledWith('gitify:update-auto-launch', {
      openAsHidden: false,
      openAtLogin: false,
    });
  });
});
