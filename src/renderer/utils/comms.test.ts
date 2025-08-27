import { ipcRenderer, shell } from 'electron';

import { namespacedEvent } from '../../shared/events';

import { mockSettings } from '../__mocks__/state-mocks';
import type { Link } from '../types';
import {
  decryptValue,
  encryptValue,
  getAppVersion,
  hideWindow,
  openExternalLink,
  quitApp,
  setAlternateIdleIcon,
  setAutoLaunch,
  setKeyboardShortcut,
  showWindow,
  updateTrayIcon,
} from './comms';
import { Constants } from './constants';
import * as storage from './storage';

describe('renderer/utils/comms.ts', () => {
  beforeEach(() => {
    jest.spyOn(ipcRenderer, 'send');
    jest.spyOn(ipcRenderer, 'invoke');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('openExternalLink', () => {
    it('should open an external link', () => {
      jest
        .spyOn(storage, 'loadState')
        .mockReturnValue({ settings: mockSettings });

      openExternalLink('https://www.gitify.io/' as Link);
      expect(shell.openExternal).toHaveBeenCalledTimes(1);
      expect(shell.openExternal).toHaveBeenCalledWith(
        'https://www.gitify.io/',
        {
          activate: true,
        },
      );
    });

    it('should use default open preference if user settings not found', () => {
      jest.spyOn(storage, 'loadState').mockReturnValue({ settings: null });

      openExternalLink('https://www.gitify.io/' as Link);
      expect(shell.openExternal).toHaveBeenCalledTimes(1);
      expect(shell.openExternal).toHaveBeenCalledWith(
        'https://www.gitify.io/',
        {
          activate: true,
        },
      );
    });

    it('should ignore opening external local links file:///', () => {
      openExternalLink('file:///Applications/SomeApp.app' as Link);
      expect(shell.openExternal).toHaveBeenCalledTimes(0);
    });
  });

  it('should get app version', async () => {
    await getAppVersion();
    expect(ipcRenderer.invoke).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.invoke).toHaveBeenCalledWith(namespacedEvent('version'));
  });

  it('should encrypt a value', async () => {
    await encryptValue('value');
    expect(ipcRenderer.invoke).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.invoke).toHaveBeenCalledWith(
      namespacedEvent('safe-storage-encrypt'),
      'value',
    );
  });

  it('should decrypt a value', async () => {
    await decryptValue('value');
    expect(ipcRenderer.invoke).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.invoke).toHaveBeenCalledWith(
      namespacedEvent('safe-storage-decrypt'),
      'value',
    );
  });

  it('should quit the app', () => {
    quitApp();
    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith(namespacedEvent('quit'));
  });

  it('should show the window', () => {
    showWindow();
    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith(
      namespacedEvent('window-show'),
    );
  });

  it('should hide the window', () => {
    hideWindow();
    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith(
      namespacedEvent('window-hide'),
    );
  });

  it('should setAutoLaunch (true)', () => {
    setAutoLaunch(true);

    expect(ipcRenderer.send).toHaveBeenCalledWith(
      namespacedEvent('update-auto-launch'),
      {
        openAtLogin: true,
        openAsHidden: true,
      },
    );
  });

  it('should setAutoLaunch (false)', () => {
    setAutoLaunch(false);

    expect(ipcRenderer.send).toHaveBeenCalledWith(
      namespacedEvent('update-auto-launch'),
      {
        openAsHidden: false,
        openAtLogin: false,
      },
    );
  });

  it('should setAlternateIdleIcon', () => {
    setAlternateIdleIcon(true);

    expect(ipcRenderer.send).toHaveBeenCalledWith(
      namespacedEvent('use-alternate-idle-icon'),
      true,
    );
  });

  it('should enable keyboard shortcut', () => {
    setKeyboardShortcut(true);
    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith(
      namespacedEvent('update-keyboard-shortcut'),
      {
        enabled: true,
        keyboardShortcut: Constants.DEFAULT_KEYBOARD_SHORTCUT,
      },
    );
  });

  it('should disable keyboard shortcut', () => {
    setKeyboardShortcut(false);
    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith(
      namespacedEvent('update-keyboard-shortcut'),
      {
        enabled: false,
        keyboardShortcut: Constants.DEFAULT_KEYBOARD_SHORTCUT,
      },
    );
  });

  it('should send mark the icons as active', () => {
    const notificationsLength = 3;
    updateTrayIcon(notificationsLength);
    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith(
      namespacedEvent('icon-active'),
    );
  });

  it('should send mark the icons as idle', () => {
    const notificationsLength = 0;
    updateTrayIcon(notificationsLength);
    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith(namespacedEvent('icon-idle'));
  });

  it('should send mark the icons as error', () => {
    const notificationsLength = -1;
    updateTrayIcon(notificationsLength);
    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith(
      namespacedEvent('icon-error'),
    );
  });
});
