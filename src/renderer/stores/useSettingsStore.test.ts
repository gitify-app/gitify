import { act, renderHook } from '@testing-library/react';

import { Constants } from '../constants';

import { DesignLanguage, OpenPreference, type Percentage, Theme } from '../types';

import { DEFAULT_SETTINGS_STATE } from './defaults';
import useSettingsStore from './useSettingsStore';

describe('renderer/stores/useSettingsStore.ts', () => {
  test('should start with default settings', () => {
    const { result } = renderHook(() => useSettingsStore());

    expect(result.current).toMatchObject(DEFAULT_SETTINGS_STATE);
  });

  describe('Toggle Setting', () => {
    test('should toggle a representative setting', () => {
      const { result } = renderHook(() => useSettingsStore());

      expect(result.current.openAtStartup).toBe(false);

      act(() => {
        result.current.toggleSetting('openAtStartup');
      });

      expect(result.current.openAtStartup).toBe(true);
    });

    test('should throw error toggling non-boolean settings', () => {
      const { result } = renderHook(() => useSettingsStore());

      expect(() => {
        act(() => {
          result.current.toggleSetting('openLinks');
        });
      }).toThrowError("toggleSetting: 'openLinks' is not a boolean setting");
    });
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

  describe('Design language (additive migration)', () => {
    afterEach(() => {
      localStorage.removeItem(Constants.STORAGE.SETTINGS);
    });

    test('should default the design language to Classic', () => {
      const { result } = renderHook(() => useSettingsStore());

      expect(result.current.designLanguage).toBe(DesignLanguage.CLASSIC);
    });

    test('should give an existing persisted blob the Classic default while preserving its theme', async () => {
      // A blob persisted before designLanguage existed (zustand writes version 0).
      localStorage.setItem(
        Constants.STORAGE.SETTINGS,
        JSON.stringify({ state: { theme: Theme.DARK_DIMMED }, version: 0 }),
      );

      await act(async () => {
        await useSettingsStore.persist.rehydrate();
      });

      expect(useSettingsStore.getState().designLanguage).toBe(DesignLanguage.CLASSIC);
      expect(useSettingsStore.getState().theme).toBe(Theme.DARK_DIMMED);
    });

    test('should update the design language', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.updateSetting('designLanguage', DesignLanguage.GLASS);
      });

      expect(result.current.designLanguage).toBe(DesignLanguage.GLASS);
    });
  });
});
