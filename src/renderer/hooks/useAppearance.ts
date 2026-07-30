import { useEffect } from 'react';

import { useSettingsStore } from '../stores';

import { useTheme } from '../components/ui';

import { DesignLanguage } from '../types';

import {
  DEFAULT_DAY_COLOR_SCHEME,
  DEFAULT_NIGHT_COLOR_SCHEME,
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
  const prefersReducedTransparency = usePrefersReducedTransparency();

  const { setColorMode, setDayScheme, setNightScheme } = useTheme();

  useEffect(() => {
    const effectiveTheme = resolveColorMode(designLanguage, theme);
    const colorMode = mapThemeModeToColorMode(effectiveTheme);
    const colorScheme = mapThemeModeToColorScheme(effectiveTheme);

    setColorMode(colorMode);

    // Keep the native window appearance in sync so the macOS vibrancy material
    // renders light/dark to match (else dark Glass gets a light material).
    window.gitify.setNativeTheme(
      colorMode === 'day' ? 'light' : colorMode === 'night' ? 'dark' : 'system',
    );

    // System theme has no fixed scheme; fall back to a day/night pair.
    setDayScheme(colorScheme ?? DEFAULT_DAY_COLOR_SCHEME);
    setNightScheme(colorScheme ?? DEFAULT_NIGHT_COLOR_SCHEME);
  }, [designLanguage, theme, setColorMode, setDayScheme, setNightScheme]);

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

    // Glass is always translucent; it only degrades to solid under the OS Reduce
    // Transparency / Increase Contrast settings (a media query in App.css).
    const vibrant = designLanguage === DesignLanguage.GLASS && !prefersReducedTransparency;
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
  }, [designLanguage, prefersReducedTransparency]);
}
