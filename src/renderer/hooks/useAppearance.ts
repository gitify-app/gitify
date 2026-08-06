import { useEffect } from 'react';

import { useTheme } from '@primer/react';

import type { NativeThemeSource } from '../../shared/events';

import { useSettingsStore } from '../stores';

import { DesignLanguage } from '../types';

import { rendererLogError, toError } from '../utils/core/logger';
import {
  DEFAULT_DAY_COLOR_SCHEME,
  DEFAULT_DAY_HIGH_CONTRAST_COLOR_SCHEME,
  DEFAULT_NIGHT_COLOR_SCHEME,
  DEFAULT_NIGHT_HIGH_CONTRAST_COLOR_SCHEME,
  mapThemeModeToColorMode,
  mapThemeModeToColorScheme,
  resolveColorMode,
} from '../utils/ui/theme';
import { usePrefersContrast } from './usePrefersContrast';
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
  const showStatusIconColors = useSettingsStore((s) => s.showStatusIconColors);
  const prefersReducedTransparency = usePrefersReducedTransparency();
  const prefersContrast = usePrefersContrast();

  const { setColorMode, setDayScheme, setNightScheme } = useTheme();

  useEffect(() => {
    const effectiveTheme = resolveColorMode(designLanguage, theme);
    const colorMode = mapThemeModeToColorMode(effectiveTheme);

    // High contrast swaps in Primer's `*_high_contrast` schemes for Classic, driven by
    // the in-app setting or the OS "Increase Contrast" preference. Glass never takes
    // them; it degrades to a solid surface instead (see the vibrancy effect below).
    const highContrast =
      designLanguage === DesignLanguage.CLASSIC && (increaseContrast || prefersContrast);
    const colorScheme = mapThemeModeToColorScheme(effectiveTheme, highContrast);

    setColorMode(colorMode);

    // Keep the native window appearance in sync so the macOS vibrancy material
    // renders light/dark to match (else dark Glass gets a light material). Not
    // gated to macOS: on other platforms this simply aligns native chrome with
    // the chosen theme, which is harmless (SYSTEM sends 'system', i.e. no override).
    let nativeTheme: NativeThemeSource = 'system';
    if (colorMode === 'day') {
      nativeTheme = 'light';
    } else if (colorMode === 'night') {
      nativeTheme = 'dark';
    }
    window.gitify
      .setNativeTheme(nativeTheme)
      .catch((err) =>
        rendererLogError('useAppearance', 'Failed to sync native theme source', toError(err)),
      );

    // System theme has no fixed scheme; fall back to a day/night pair that honours
    // high contrast.
    setDayScheme(
      colorScheme ??
        (highContrast ? DEFAULT_DAY_HIGH_CONTRAST_COLOR_SCHEME : DEFAULT_DAY_COLOR_SCHEME),
    );
    setNightScheme(
      colorScheme ??
        (highContrast ? DEFAULT_NIGHT_HIGH_CONTRAST_COLOR_SCHEME : DEFAULT_NIGHT_COLOR_SCHEME),
    );
  }, [
    designLanguage,
    theme,
    increaseContrast,
    prefersContrast,
    setColorMode,
    setDayScheme,
    setNightScheme,
  ]);

  useEffect(() => {
    document.documentElement.dataset.theme = designLanguage;
  }, [designLanguage]);

  useEffect(() => {
    document.documentElement.dataset.glassMaterial = window.gitify.platform.isMacOS()
      ? 'vibrancy'
      : 'backdrop-filter';
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle(
      'gitify-colored-icons',
      designLanguage === DesignLanguage.GLASS && showStatusIconColors,
    );
  }, [designLanguage, showStatusIconColors]);

  useEffect(() => {
    const root = document.documentElement;

    // Glass is always translucent; it degrades to solid under the OS Reduce
    // Transparency or Increase Contrast settings (matched by a media query in App.css).
    const vibrant =
      designLanguage === DesignLanguage.GLASS && !prefersReducedTransparency && !prefersContrast;
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
  }, [designLanguage, prefersReducedTransparency, prefersContrast]);
}
