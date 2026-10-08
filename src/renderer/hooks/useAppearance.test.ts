import { act, cleanup, renderHook, screen, waitFor } from '@testing-library/react';
import { createElement, type PropsWithChildren } from 'react';

import { BaseStyles } from '@primer/react';
import { ThemeProvider, useTheme } from '@primer/react/next';

import { useSettingsStore } from '../stores';

import { DesignLanguage, Theme } from '../types';

import { useAppearance } from './useAppearance';

// Capture the Primer color-scheme setters so high-contrast schemes can be asserted.
const primerTheme = vi.hoisted(() => ({
  setColorMode: vi.fn(),
  setDayScheme: vi.fn(),
  setNightScheme: vi.fn(),
}));

vi.mock('@primer/react/next', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@primer/react/next')>()),
  useTheme: vi.fn(() => primerTheme),
}));

function mockPrefersContrast(matches: boolean) {
  return vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: query.includes('prefers-contrast') ? matches : false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }) as unknown as MediaQueryList,
  );
}

describe('renderer/hooks/useAppearance.ts', () => {
  beforeEach(() => {
    vi.mocked(useTheme).mockImplementation(() => primerTheme);
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-glass-material');
    document.documentElement.classList.remove(
      'gitify-vibrant',
      'gitify-translucent',
      'gitify-colored-icons',
    );
  });

  it('marks the root with the Classic design language by default', () => {
    renderHook(() => useAppearance());

    expect(document.documentElement.getAttribute('data-theme')).toBe('classic');
  });

  it('reflects the active design language on the root', () => {
    useSettingsStore.setState({ designLanguage: DesignLanguage.GLASS });

    renderHook(() => useAppearance());

    expect(document.documentElement.getAttribute('data-theme')).toBe('glass');
  });

  it('derives the glass material from the platform (vibrancy on macOS)', () => {
    vi.mocked(window.gitify.platform.isMacOS).mockReturnValue(true);

    renderHook(() => useAppearance());

    expect(document.documentElement.getAttribute('data-glass-material')).toBe('vibrancy');
  });

  it('uses the backdrop-filter material off macOS', () => {
    vi.mocked(window.gitify.platform.isMacOS).mockReturnValue(false);

    renderHook(() => useAppearance());

    expect(document.documentElement.getAttribute('data-glass-material')).toBe('backdrop-filter');
  });

  it('applies vibrancy and marks the root vibrant on macOS Glass', async () => {
    useSettingsStore.setState({ designLanguage: DesignLanguage.GLASS });

    renderHook(() => useAppearance());

    expect(window.gitify.setWindowVibrancy).toHaveBeenCalledWith(true);
    await waitFor(() =>
      expect(document.documentElement.classList.contains('gitify-vibrant')).toBe(true),
    );
  });

  it('disables vibrancy for Classic on macOS', () => {
    renderHook(() => useAppearance());

    expect(window.gitify.setWindowVibrancy).toHaveBeenCalledWith(false);
    expect(document.documentElement.classList.contains('gitify-vibrant')).toBe(false);
  });

  it('does not touch vibrancy off macOS', () => {
    vi.mocked(window.gitify.platform.isMacOS).mockReturnValue(false);
    useSettingsStore.setState({ designLanguage: DesignLanguage.GLASS });

    renderHook(() => useAppearance());

    expect(window.gitify.setWindowVibrancy).not.toHaveBeenCalled();
  });

  it('syncs the native theme to light for a light color mode', () => {
    useSettingsStore.setState({ theme: Theme.LIGHT });

    renderHook(() => useAppearance());

    expect(window.gitify.setNativeTheme).toHaveBeenCalledWith('light');
  });

  it('syncs the native theme to dark for a dark color mode', () => {
    useSettingsStore.setState({ theme: Theme.DARK });

    renderHook(() => useAppearance());

    expect(window.gitify.setNativeTheme).toHaveBeenCalledWith('dark');
  });

  it('syncs the native theme to system for the auto color mode', () => {
    useSettingsStore.setState({ theme: Theme.SYSTEM });

    renderHook(() => useAppearance());

    expect(window.gitify.setNativeTheme).toHaveBeenCalledWith('system');
  });

  it('syncs the native theme from the Glass-clamped color mode', () => {
    // Glass clamps DARK_DIMMED down to its base dark; the native theme must
    // follow the clamped mode, not the raw stored theme.
    useSettingsStore.setState({
      designLanguage: DesignLanguage.GLASS,
      theme: Theme.DARK_DIMMED,
    });

    renderHook(() => useAppearance());

    expect(window.gitify.setNativeTheme).toHaveBeenCalledWith('dark');
  });

  it('applies the high-contrast schemes for Classic under the increase contrast setting', () => {
    useSettingsStore.setState({
      designLanguage: DesignLanguage.CLASSIC,
      theme: Theme.LIGHT,
      increaseContrast: true,
    });

    renderHook(() => useAppearance());

    expect(primerTheme.setDayScheme).toHaveBeenCalledWith('light_high_contrast');
  });

  it('does not apply high-contrast schemes for Glass', () => {
    useSettingsStore.setState({
      designLanguage: DesignLanguage.GLASS,
      theme: Theme.LIGHT,
      increaseContrast: true,
    });

    renderHook(() => useAppearance());

    expect(primerTheme.setDayScheme).toHaveBeenCalledWith('light');
  });

  it('applies high contrast for Classic from the OS increase-contrast setting', () => {
    const spy = mockPrefersContrast(true);
    useSettingsStore.setState({
      designLanguage: DesignLanguage.CLASSIC,
      theme: Theme.LIGHT,
      increaseContrast: false,
    });

    renderHook(() => useAppearance());

    expect(primerTheme.setDayScheme).toHaveBeenCalledWith('light_high_contrast');
    spy.mockRestore();
  });

  it('degrades Glass to solid under the OS increase-contrast setting', () => {
    const spy = mockPrefersContrast(true);
    useSettingsStore.setState({ designLanguage: DesignLanguage.GLASS });

    renderHook(() => useAppearance());

    expect(window.gitify.setWindowVibrancy).toHaveBeenCalledWith(false);
    spy.mockRestore();
  });

  it('marks the root for colored status icons under Glass when enabled', () => {
    useSettingsStore.setState({
      designLanguage: DesignLanguage.GLASS,
      showStatusIconColors: true,
    });

    renderHook(() => useAppearance());

    expect(document.documentElement.classList.contains('gitify-colored-icons')).toBe(true);
  });

  it('keeps Glass status icons monochrome by default', () => {
    useSettingsStore.setState({ designLanguage: DesignLanguage.GLASS });

    renderHook(() => useAppearance());

    expect(document.documentElement.classList.contains('gitify-colored-icons')).toBe(false);
  });

  it('ignores the status icon colors setting under Classic', () => {
    useSettingsStore.setState({
      designLanguage: DesignLanguage.CLASSIC,
      showStatusIconColors: true,
    });

    renderHook(() => useAppearance());

    expect(document.documentElement.classList.contains('gitify-colored-icons')).toBe(false);
  });

  describe('with ThemeProvider', () => {
    let darkMedia: EventTarget & { matches: boolean };

    beforeEach(async () => {
      const actual =
        await vi.importActual<typeof import('@primer/react/next')>('@primer/react/next');
      vi.mocked(useTheme).mockImplementation(actual.useTheme);

      darkMedia = Object.assign(new EventTarget(), { matches: false });
      const otherMedia = Object.assign(new EventTarget(), { matches: false });
      vi.spyOn(window, 'matchMedia').mockImplementation(
        (query) =>
          (query === '(prefers-color-scheme: dark)' ? darkMedia : otherMedia) as MediaQueryList,
      );
    });

    afterEach(() => {
      cleanup();
      vi.restoreAllMocks();
      vi.mocked(useTheme).mockImplementation(() => primerTheme);
    });

    function renderWithTheme(theme: Theme) {
      useSettingsStore.setState({ theme });

      return renderHook(
        () => {
          useAppearance();
          return useTheme();
        },
        {
          wrapper: ({ children }: PropsWithChildren) =>
            createElement(
              ThemeProvider,
              null,
              createElement(
                BaseStyles,
                null,
                createElement('div', { 'data-testid': 'theme-content' }, children),
              ),
            ),
        },
      );
    }

    function getThemeWrapper() {
      const wrapper = screen.getByTestId('theme-content').closest('[data-color-mode]');
      expect(wrapper).toBeInTheDocument();
      return wrapper!;
    }

    it('applies appearance to the real provider and preserves its descendant wrapper', () => {
      const { result } = renderWithTheme(Theme.LIGHT);

      expect(result.current.colorMode).toBe('day');
      expect(result.current.colorScheme).toBe('light');
      const wrapper = getThemeWrapper();
      expect(wrapper).not.toBe(document.documentElement);
      expect(wrapper).toHaveAttribute('data-color-mode', 'light');
      expect(wrapper).toHaveAttribute('data-light-theme', 'light');
      expect(wrapper).toHaveAttribute('data-dark-theme', 'light');
      expect(wrapper.querySelector('[data-component="BaseStyles"]')).toContainElement(
        screen.getByTestId('theme-content'),
      );
    });

    it('updates the real provider when settings change from light to dark', async () => {
      const { result } = renderWithTheme(Theme.LIGHT);

      await act(async () => {
        useSettingsStore.setState({ theme: Theme.DARK });
      });

      expect(result.current.colorMode).toBe('night');
      expect(result.current.colorScheme).toBe('dark');
      expect(getThemeWrapper()).toHaveAttribute('data-color-mode', 'dark');
      expect(window.gitify.setNativeTheme).toHaveBeenLastCalledWith('dark');
    });

    it('follows OS changes in System mode without changing the saved preference', async () => {
      const { result } = renderWithTheme(Theme.SYSTEM);
      expect(result.current.resolvedColorMode).toBe('day');

      await act(async () => {
        darkMedia.matches = true;
        darkMedia.dispatchEvent(new Event('change'));
      });

      expect(result.current.colorMode).toBe('auto');
      expect(result.current.resolvedColorMode).toBe('night');
      expect(result.current.colorScheme).toBe('dark');
      expect(getThemeWrapper()).toHaveAttribute('data-color-mode', 'auto');
      expect(getThemeWrapper()).toHaveAttribute('data-light-theme', 'light');
      expect(getThemeWrapper()).toHaveAttribute('data-dark-theme', 'dark');
      expect(useSettingsStore.getState().theme).toBe(Theme.SYSTEM);
      expect(window.gitify.setNativeTheme).toHaveBeenLastCalledWith('system');
      expect(window.gitify.setNativeTheme).not.toHaveBeenCalledWith('dark');
    });

    it('applies an accessibility scheme through the real provider', () => {
      const { result } = renderWithTheme(Theme.DARK_COLORBLIND);

      expect(result.current.colorMode).toBe('night');
      expect(result.current.colorScheme).toBe('dark_colorblind');
      expect(getThemeWrapper()).toHaveAttribute('data-color-mode', 'dark');
      expect(getThemeWrapper()).toHaveAttribute('data-dark-theme', 'dark_colorblind');
    });
  });
});
