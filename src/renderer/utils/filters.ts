import { defaultSettings } from '../context/App';
import type { SettingsState } from '../types';

export function getFilterCount(settings: SettingsState): number {
  let count = 0;

  if (settings.filterReasons.length !== defaultSettings.filterReasons.length) {
    count += settings.filterReasons.length;
  }

  if (
    settings.detailedNotifications &&
    settings.hideBots !== defaultSettings.hideBots
  ) {
    count += 1;
  }

  return count;
}

export function hasFiltersSet(settings: SettingsState): boolean {
  return getFilterCount(settings) > 0;
}
