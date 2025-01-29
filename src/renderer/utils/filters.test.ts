import { mockSingleAccountNotifications } from '../__mocks__/notifications-mocks';
import { defaultSettings } from '../context/App';
import type { SettingsState } from '../types';
import {
  getNonBotFilterCount,
  getReasonFilterCount,
  hasAnyFiltersSet,
} from './filters';

describe('renderer/utils/filters.ts', () => {
  describe('has filters', () => {
    it('default filter settings', () => {
      expect(hasAnyFiltersSet(defaultSettings)).toBe(false);
    });

    it('non-default reason filters', () => {
      const settings = {
        ...defaultSettings,
        filterReasons: ['subscribed', 'manual'],
      } as SettingsState;
      expect(hasAnyFiltersSet(settings)).toBe(true);
    });

    it('non-default bot filters', () => {
      const settings = {
        ...defaultSettings,
        hideBots: true,
      } as SettingsState;
      expect(hasAnyFiltersSet(settings)).toBe(true);
    });
  });

  describe('filter counts', () => {
    it('hideBots', () => {
      expect(getNonBotFilterCount(mockSingleAccountNotifications)).toBe(1);
    });

    it('reason', () => {
      expect(
        getReasonFilterCount(mockSingleAccountNotifications, 'subscribed'),
      ).toBe(1);
    });
  });
});
