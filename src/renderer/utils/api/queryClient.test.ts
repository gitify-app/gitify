import { onlineManager } from '@tanstack/react-query';

import { syncOnlineManagerWithBrowser } from './queryClient';

describe('renderer/utils/api/queryClient.ts', () => {
  afterEach(() => {
    onlineManager.setOnline(true);
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
  });

  describe('syncOnlineManagerWithBrowser', () => {
    it('corrects onlineManager to offline when the device is offline', () => {
      onlineManager.setOnline(true);
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

      syncOnlineManagerWithBrowser();

      expect(onlineManager.isOnline()).toBe(false);
    });

    it('corrects onlineManager to online when the device is online', () => {
      onlineManager.setOnline(false);
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });

      syncOnlineManagerWithBrowser();

      expect(onlineManager.isOnline()).toBe(true);
    });
  });
});
