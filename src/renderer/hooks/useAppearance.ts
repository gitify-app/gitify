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
import { usePrefersReducedTransparency } from './usePrefersReducedTransparency';

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
  const enableTranslucency = useSettingsStore((s) => s.enableTranslucency);
  const prefersReducedTransparency = usePrefersReducedTransparency();

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
    const root = document.documentElement;

    // Glass degrades to solid surfaces under increased contrast or when the user
    // turns translucency off; `.gitify-solid` drives that in CSS (the OS Reduce
    // Transparency setting is handled by a media query in App.css).
    const solid = increaseContrast || !enableTranslucency;
    root.classList.toggle('gitify-solid', solid);

    // The full translucent Glass treatment (dissolved chrome, hairline dividers)
    // is active only when nothing is forcing solid surfaces.
    const vibrant =
      designLanguage === DesignLanguage.GLASS && !solid && !prefersReducedTransparency;
    root.classList.toggle('gitify-translucent', vibrant);

    if (!window.gitify.platform.isMacOS()) {
      return;
    }

    // Add `.gitify-vibrant` only after the material is applied, and drop it before
    // vibrancy is removed, so the window never renders black mid-switch.
    if (!vibrant) {
      root.classList.remove('gitify-vibrant');
    }

    window.gitify.setWindowVibrancy(vibrant).then(
      () => vibrant && root.classList.add('gitify-vibrant'),
      () => root.classList.remove('gitify-vibrant'),
    );
  }, [designLanguage, increaseContrast, enableTranslucency, prefersReducedTransparency]);
}
