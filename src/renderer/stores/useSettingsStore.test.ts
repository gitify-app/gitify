import { act, renderHook } from '@testing-library/react';

import { Theme } from '../../shared/theme';

import type { Percentage } from '../types';
import { OpenPreference } from './types';

import { DEFAULT_SETTINGS_STATE } from './defaults';
import useSettingsStore from './useSettingsStore';

describe('useSettingsStore', () => {
  test('should start with default settings', () => {
    const { result } = renderHook(() => useSettingsStore());
    expect(result.current).toMatchObject(DEFAULT_SETTINGS_STATE);
  });

  describe('Update Setting', () => {
    test('should update a representative appearance setting', () => {
      const { result } = renderHook(() => useSettingsStore());
      act(() => {
        result.current.updateSetting('theme', Theme.DARK);
      });
      expect(result.current.theme).toBe(Theme.DARK);
    });

    test('should update a representative notification setting', () => {
      const { result } = renderHook(() => useSettingsStore());
      act(() => {
        result.current.updateSetting('markAsDoneOnOpen', false);
      });
      expect(result.current.markAsDoneOnOpen).toBe(false);
    });

    test('should update a representative tray setting', () => {
      const { result } = renderHook(() => useSettingsStore());
      act(() => {
        result.current.updateSetting('showNotificationsCountInTray', false);
      });
      expect(result.current.showNotificationsCountInTray).toBe(false);
    });

    test('should update a representative system setting', () => {
      const { result } = renderHook(() => useSettingsStore());
      act(() => {
        result.current.updateSetting('openLinks', OpenPreference.BACKGROUND);
      });
      expect(result.current.openLinks).toBe(OpenPreference.BACKGROUND);
    });

    test('should update arbitrary setting key', () => {
      const { result } = renderHook(() => useSettingsStore());
      act(() => {
        result.current.updateSetting('zoomPercentage', 150 as Percentage);
      });
      expect(result.current.zoomPercentage).toBe(150);
    });

    test('should update multiple settings independently', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.updateSetting('theme', Theme.DARK);
        result.current.updateSetting('markAsDoneOnOpen', false);
        result.current.updateSetting('openLinks', OpenPreference.BACKGROUND);
      });

      expect(result.current.theme).toBe(Theme.DARK);
      expect(result.current.markAsDoneOnOpen).toBe(false);
      expect(result.current.openLinks).toBe(OpenPreference.BACKGROUND);
    });
  });

  describe('Reset', () => {
    test('should reset all settings to default', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.updateSetting('theme', Theme.DARK);
        result.current.updateSetting('markAsDoneOnOpen', false);
        result.current.updateSetting('zoomPercentage', 150 as Percentage);
        result.current.updateSetting('openLinks', OpenPreference.BACKGROUND);
        result.current.reset();
      });

      expect(result.current).toMatchObject(DEFAULT_SETTINGS_STATE);
    });
  });
});
