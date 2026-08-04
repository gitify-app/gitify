import { onlineManager } from '@tanstack/react-query';

import { Constants } from '../../constants';

import { queryClient, syncOnlineManagerWithBrowser } from './queryClient';

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

  describe('default options', () => {
    const { queries } = queryClient.getDefaultOptions();

    it('sets an explicit garbage-collection time', () => {
      expect(queries?.gcTime).toBe(Constants.QUERY_GC_TIME_MS);
    });

    it('sets refetchIntervalInBackground at the client level', () => {
      expect(queries?.refetchIntervalInBackground).toBe(true);
    });

    it('does not set staleTime at the client level', () => {
      // Each query configures its own staleTime at the point of use, since a
      // single global value would be wrong for at least one query (see
      // useNotifications/useAccounts, which poll on different cadences).
      expect(queries?.staleTime).toBeUndefined();
    });

    it('retries failed queries once after a cooldown', () => {
      expect(queries?.retry).toBe(1);
      expect(queries?.retryDelay).toBe(Constants.QUERY_RETRY_DELAY_MS);
    });
  });
});
