import { defaultSettings } from '../context/App';
import type { SettingsState } from '../types';
import { getFilterCount, hasFiltersSet } from './filters';

describe('renderer/utils/filters.ts', () => {
  it('default filter settings', () => {
    expect(getFilterCount(defaultSettings)).toBe(0);
    expect(hasFiltersSet(defaultSettings)).toBe(false);
  });

  it('non-default reason filters', () => {
    const settings = {
      ...defaultSettings,
      filterReasons: ['subscribed', 'manual'],
    } as SettingsState;
    expect(getFilterCount(settings)).toBe(2);
    expect(hasFiltersSet(settings)).toBe(true);
  });

  it('non-default bot filters', () => {
    const settings = {
      ...defaultSettings,
      hideBots: true,
    } as SettingsState;
    expect(getFilterCount(settings)).toBe(1);
    expect(hasFiltersSet(settings)).toBe(true);
  });
});
