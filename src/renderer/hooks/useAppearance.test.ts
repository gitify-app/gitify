import { renderHook, waitFor } from '@testing-library/react';

import { useSettingsStore } from '../stores';

import { DesignLanguage, Theme } from '../types';

import { useAppearance } from './useAppearance';

// Capture the Primer color-scheme setters so high-contrast schemes can be asserted.
const primerTheme = vi.hoisted(() => ({
  setColorMode: vi.fn(),
  setDayScheme: vi.fn(),
  setNightScheme: vi.fn(),
}));

vi.mock('@primer/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@primer/react')>()),
  useTheme: () => primerTheme,
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
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-glass-material');
    document.documentElement.classList.remove('gitify-vibrant', 'gitify-translucent');
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
});
