import { act, renderHook, waitFor } from '@testing-library/react';

import { useLoginItemStatus } from './useLoginItemStatus';

describe('renderer/hooks/useLoginItemStatus.ts', () => {
  it('reads the login-item status on mount', async () => {
    vi.mocked(window.gitify.getLoginItemSettings).mockResolvedValue({
      openAtLogin: true,
      status: 'enabled',
    });

    const { result } = renderHook(() => useLoginItemStatus());

    await waitFor(() => expect(result.current).toEqual({ openAtLogin: true, status: 'enabled' }));
  });

  it('re-reads the status when the window regains focus', async () => {
    const getLoginItemSettings = vi.mocked(window.gitify.getLoginItemSettings);
    getLoginItemSettings.mockResolvedValueOnce({
      openAtLogin: true,
      status: 'requires-approval',
    });

    const { result } = renderHook(() => useLoginItemStatus());
    await waitFor(() => expect(result.current?.status).toBe('requires-approval'));

    getLoginItemSettings.mockResolvedValueOnce({
      openAtLogin: true,
      status: 'enabled',
    });

    act(() => {
      window.dispatchEvent(new Event('focus'));
    });

    await waitFor(() => expect(result.current?.status).toBe('enabled'));
    expect(getLoginItemSettings).toHaveBeenCalledTimes(2);
  });

  it('returns null when the status read fails', async () => {
    vi.mocked(window.gitify.getLoginItemSettings).mockRejectedValue(new Error('unavailable'));

    const { result } = renderHook(() => useLoginItemStatus());

    await waitFor(() => expect(window.gitify.getLoginItemSettings).toHaveBeenCalled());
    expect(result.current).toBeNull();
  });
});
