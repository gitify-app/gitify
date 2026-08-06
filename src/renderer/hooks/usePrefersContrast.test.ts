import { renderHook } from '@testing-library/react';

import { usePrefersContrast } from './usePrefersContrast';

function mockMatchMedia(matches: boolean) {
  vi.spyOn(window, 'matchMedia').mockReturnValue({
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as MediaQueryList);
}

describe('renderer/hooks/usePrefersContrast.ts', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is false when the OS does not request increased contrast', () => {
    mockMatchMedia(false);

    const { result } = renderHook(() => usePrefersContrast());

    expect(result.current).toBe(false);
  });

  it('is true when the OS requests increased contrast', () => {
    mockMatchMedia(true);

    const { result } = renderHook(() => usePrefersContrast());

    expect(result.current).toBe(true);
  });
});
