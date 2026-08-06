import { renderHook } from '@testing-library/react';

import { usePrefersReducedTransparency } from './usePrefersReducedTransparency';

function mockMatchMedia(matches: boolean) {
  vi.spyOn(window, 'matchMedia').mockReturnValue({
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as MediaQueryList);
}

describe('renderer/hooks/usePrefersReducedTransparency.ts', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is false when the OS does not request reduced transparency', () => {
    mockMatchMedia(false);

    const { result } = renderHook(() => usePrefersReducedTransparency());

    expect(result.current).toBe(false);
  });

  it('is true when the OS requests reduced transparency', () => {
    mockMatchMedia(true);

    const { result } = renderHook(() => usePrefersReducedTransparency());

    expect(result.current).toBe(true);
  });
});
