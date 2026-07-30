import { renderHook } from '@testing-library/react';

import { useAppearance } from './useAppearance';

describe('renderer/hooks/useAppearance.ts', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-glass-material');
  });

  it('marks the root with the Classic design language', () => {
    renderHook(() => useAppearance());

    expect(document.documentElement.getAttribute('data-theme')).toBe('classic');
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
});
