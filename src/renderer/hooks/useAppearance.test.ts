import { renderHook, waitFor } from '@testing-library/react';

import { useSettingsStore } from '../stores';

import { DesignLanguage } from '../types';

import { useAppearance } from './useAppearance';

describe('renderer/hooks/useAppearance.ts', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-glass-material');
    document.documentElement.classList.remove(
      'gitify-vibrant',
      'gitify-solid',
      'gitify-translucent',
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

  it('degrades Glass to solid (no vibrancy) under increased contrast', () => {
    useSettingsStore.setState({ designLanguage: DesignLanguage.GLASS, increaseContrast: true });

    renderHook(() => useAppearance());

    expect(document.documentElement.classList.contains('gitify-solid')).toBe(true);
    expect(window.gitify.setWindowVibrancy).toHaveBeenCalledWith(false);
  });

  it('degrades Glass to solid when translucency is disabled', () => {
    useSettingsStore.setState({ designLanguage: DesignLanguage.GLASS, enableTranslucency: false });

    renderHook(() => useAppearance());

    expect(document.documentElement.classList.contains('gitify-solid')).toBe(true);
    expect(window.gitify.setWindowVibrancy).toHaveBeenCalledWith(false);
  });
});
