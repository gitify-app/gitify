import { mockSettings } from '../__mocks__/state-mocks';
import { type Link, OpenPreference } from '../types';
import {
  decryptValue,
  encryptValue,
  getAppVersion,
  hideWindow,
  openExternalLink,
  quitApp,
  setAutoLaunch,
  setKeyboardShortcut,
  setUseAlternateIdleIcon,
  showWindow,
  updateTrayColor,
  updateTrayTitle,
} from './comms';
import * as storage from './storage';

describe('renderer/utils/comms.ts', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('openExternalLink', () => {
    it('should open an external link', () => {
      jest.spyOn(storage, 'loadState').mockReturnValue({
        settings: { ...mockSettings, openLinks: OpenPreference.BACKGROUND },
      });

      openExternalLink('https://gitify.io/' as Link);

      expect(window.gitify.openExternalLink).toHaveBeenCalledTimes(1);
      expect(window.gitify.openExternalLink).toHaveBeenCalledWith(
        'https://gitify.io/',
        false,
      );
    });

    it('should open in foreground when preference set to FOREGROUND', () => {
      jest.spyOn(storage, 'loadState').mockReturnValue({
        settings: { ...mockSettings, openLinks: OpenPreference.FOREGROUND },
      });

      openExternalLink('https://gitify.io/' as Link);

      expect(window.gitify.openExternalLink).toHaveBeenCalledWith(
        'https://gitify.io/',
        true,
      );
    });

    it('should use default open preference if user settings not found', () => {
      jest.spyOn(storage, 'loadState').mockReturnValue({ settings: null });

      openExternalLink('https://gitify.io/' as Link);

      expect(window.gitify.openExternalLink).toHaveBeenCalledTimes(1);
      expect(window.gitify.openExternalLink).toHaveBeenCalledWith(
        'https://gitify.io/',
        true,
      );
    });

    it('should ignore opening external local links file:///', () => {
      openExternalLink('file:///Applications/SomeApp.app' as Link);

      expect(window.gitify.openExternalLink).not.toHaveBeenCalled();
    });

    it('should ignore non-https links (http)', () => {
      openExternalLink('http://example.com' as Link);
      expect(window.gitify.openExternalLink).not.toHaveBeenCalled();
    });
  });

  describe('app/version & crypto helpers', () => {
    it('gets app version', async () => {
      const version = await getAppVersion();
      expect(window.gitify.app.version).toHaveBeenCalledTimes(1);
      expect(version).toBe('v0.0.1');
    });

    it('encrypts value', async () => {
      const value = await encryptValue('plain');

      expect(window.gitify.encryptValue).toHaveBeenCalledTimes(1);
      expect(window.gitify.encryptValue).toHaveBeenCalledWith('plain');
      expect(value).toBe('encrypted');
    });

    it('decrypts value', async () => {
      const value = await decryptValue('encrypted');

      expect(window.gitify.decryptValue).toHaveBeenCalledTimes(1);
      expect(window.gitify.decryptValue).toHaveBeenCalledWith('encrypted');
      expect(value).toBe('decrypted');
    });
  });

  describe('window / app actions', () => {
    it('quits app', () => {
      quitApp();
      expect(window.gitify.app.quit).toHaveBeenCalledTimes(1);
    });

    it('shows window', () => {
      showWindow();
      expect(window.gitify.app.show).toHaveBeenCalledTimes(1);
    });

    it('hides window', () => {
      hideWindow();
      expect(window.gitify.app.hide).toHaveBeenCalledTimes(1);
    });
  });

  describe('settings toggles', () => {
    it('sets auto launch', () => {
      setAutoLaunch(true);

      expect(window.gitify.setAutoLaunch).toHaveBeenCalledTimes(1);
      expect(window.gitify.setAutoLaunch).toHaveBeenCalledWith(true);
    });

    it('sets alternate idle icon', () => {
      setUseAlternateIdleIcon(false);

      expect(window.gitify.tray.useAlternateIdleIcon).toHaveBeenCalledTimes(1);
      expect(window.gitify.tray.useAlternateIdleIcon).toHaveBeenCalledWith(
        false,
      );
    });

    it('sets keyboard shortcut', () => {
      setKeyboardShortcut(true);

      expect(window.gitify.setKeyboardShortcut).toHaveBeenCalledTimes(1);
      expect(window.gitify.setKeyboardShortcut).toHaveBeenCalledWith(true);
    });
  });

  describe('tray helpers', () => {
    it('updates tray icon color with count', () => {
      updateTrayColor(5);

      expect(window.gitify.tray.updateColor).toHaveBeenCalledTimes(1);
      expect(window.gitify.tray.updateColor).toHaveBeenCalledWith(5);
    });

    it('updates tray title with provided value', () => {
      updateTrayTitle('gitify');

      expect(window.gitify.tray.updateTitle).toHaveBeenCalledTimes(1);
      expect(window.gitify.tray.updateTitle).toHaveBeenCalledWith('gitify');
    });
  });
});
