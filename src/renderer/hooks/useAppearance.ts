import { useEffect } from 'react';

import { useTheme } from '@primer/react';

import { useSettingsStore } from '../stores';

import {
  DEFAULT_DAY_COLOR_SCHEME,
  DEFAULT_DAY_HIGH_CONTRAST_COLOR_SCHEME,
  DEFAULT_NIGHT_COLOR_SCHEME,
  DEFAULT_NIGHT_HIGH_CONTRAST_COLOR_SCHEME,
  mapThemeModeToColorMode,
  mapThemeModeToColorScheme,
} from '../utils/ui/theme';

/**
 * Single seam for all appearance side effects. Must be called from within the
 * Primer `ThemeProvider` (it consumes `useTheme`).
 *
 * Owns:
 * - Color mode + day/night scheme application (Primer), preserving the
 *   "auto + high contrast" fallback composition.
 * - The root design-language (`data-theme`) and platform material
 *   (`data-glass-material`) attributes that the CSS token layer keys off,
 *   alongside the `data-color-mode` attribute Primer's `ThemeProvider` owns.
 *
 * `data-theme` is currently always `classic` — a settings-driven design
 * language is introduced later. `data-glass-material` is derived from the OS
 * so `App.css` can branch base-transparency / blur behaviour declaratively.
 * Every rule keyed off `data-glass-material` must also be scoped under
 * `[data-theme="glass"]`, so these attributes are inert under Classic.
 */
export function useAppearance(): void {
  const theme = useSettingsStore((s) => s.theme);
  const increaseContrast = useSettingsStore((s) => s.increaseContrast);

  const { setColorMode, setDayScheme, setNightScheme } = useTheme();

  useEffect(() => {
    const colorMode = mapThemeModeToColorMode(theme);
    const colorScheme = mapThemeModeToColorScheme(theme, increaseContrast);

    setColorMode(colorMode);

    // When colorScheme is null (System theme), use appropriate fallbacks
    // based on whether high contrast is enabled
    const dayFallback = increaseContrast
      ? DEFAULT_DAY_HIGH_CONTRAST_COLOR_SCHEME
      : DEFAULT_DAY_COLOR_SCHEME;
    const nightFallback = increaseContrast
      ? DEFAULT_NIGHT_HIGH_CONTRAST_COLOR_SCHEME
      : DEFAULT_NIGHT_COLOR_SCHEME;

    setDayScheme(colorScheme ?? dayFallback);
    setNightScheme(colorScheme ?? nightFallback);
  }, [theme, increaseContrast, setColorMode, setDayScheme, setNightScheme]);

  useEffect(() => {
    const root = document.documentElement;

    // The only design language today is Classic; a settings-driven language
    // is wired in later.
    root.setAttribute('data-theme', 'classic');

    // Material fidelity is platform-decided: real vibrancy on macOS, CSS
    // backdrop-filter elsewhere. Inert until a Glass language keys off it.
    root.setAttribute(
      'data-glass-material',
      window.gitify.platform.isMacOS() ? 'vibrancy' : 'backdrop-filter',
    );
  }, []);
}
