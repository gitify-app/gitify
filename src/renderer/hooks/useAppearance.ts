import { useEffect } from 'react';

import { useSettingsStore } from '../stores';

import { useTheme } from '../components/ui';

import { DesignLanguage } from '../types';

import {
  DEFAULT_DAY_COLOR_SCHEME,
  DEFAULT_DAY_HIGH_CONTRAST_COLOR_SCHEME,
  DEFAULT_NIGHT_COLOR_SCHEME,
  DEFAULT_NIGHT_HIGH_CONTRAST_COLOR_SCHEME,
  mapThemeModeToColorMode,
  mapThemeModeToColorScheme,
  resolveColorMode,
} from '../utils/ui/theme';

/**
 * Applies appearance side effects: Primer color mode/scheme plus the root
 * `data-theme` (design language) and `data-glass-material` attributes.
 *
 * Must be called from within the Primer `ThemeProvider` (it consumes `useTheme`).
 */
export function useAppearance(): void {
  const designLanguage = useSettingsStore((s) => s.designLanguage);
  const theme = useSettingsStore((s) => s.theme);
  const increaseContrast = useSettingsStore((s) => s.increaseContrast);

  const { setColorMode, setDayScheme, setNightScheme } = useTheme();

  useEffect(() => {
    const effectiveTheme = resolveColorMode(designLanguage, theme);
    const colorMode = mapThemeModeToColorMode(effectiveTheme);
    const colorScheme = mapThemeModeToColorScheme(effectiveTheme, increaseContrast);

    setColorMode(colorMode);

    // System theme has no fixed scheme; fall back to a day/night pair that still
    // honours high contrast.
    const dayFallback = increaseContrast
      ? DEFAULT_DAY_HIGH_CONTRAST_COLOR_SCHEME
      : DEFAULT_DAY_COLOR_SCHEME;
    const nightFallback = increaseContrast
      ? DEFAULT_NIGHT_HIGH_CONTRAST_COLOR_SCHEME
      : DEFAULT_NIGHT_COLOR_SCHEME;

    setDayScheme(colorScheme ?? dayFallback);
    setNightScheme(colorScheme ?? nightFallback);
  }, [designLanguage, theme, increaseContrast, setColorMode, setDayScheme, setNightScheme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', designLanguage);
  }, [designLanguage]);

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-glass-material',
      window.gitify.platform.isMacOS() ? 'vibrancy' : 'backdrop-filter',
    );
  }, []);

  useEffect(() => {
    if (!window.gitify.platform.isMacOS()) {
      return;
    }

    const root = document.documentElement;
    const enable = designLanguage === DesignLanguage.GLASS;

    // The `gitify-vibrant` class clears the window's own background so the native
    // material shows. Add it only after vibrancy is applied, and remove it before
    // vibrancy is dropped, so the window never renders black mid-switch.
    if (!enable) {
      root.classList.remove('gitify-vibrant');
    }

    window.gitify.setWindowVibrancy(enable).then(
      () => enable && root.classList.add('gitify-vibrant'),
      () => root.classList.remove('gitify-vibrant'),
    );
  }, [designLanguage]);
}
