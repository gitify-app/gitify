import useConnectionStore from './useConnectionStore';

describe('renderer/stores/useConnectionStore.ts', () => {
  beforeEach(() => {
    useConnectionStore.setState({
      state: 'online',
      recoveringSince: null,
      baselineDataUpdatedAt: 0,
    });
  });

  it('starts online', () => {
    expect(useConnectionStore.getInitialState().state).toBe('online');
  });

  it('starts recovery with a baseline and timestamp', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

    useConnectionStore.getState().startRecovery(1234);

    expect(useConnectionStore.getState()).toMatchObject({
      state: 'recovering',
      baselineDataUpdatedAt: 1234,
    });
    expect(useConnectionStore.getState().recoveringSince).toBe(Date.now());
  });

  it('does not extend an in-progress recovery on duplicate entry', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

    useConnectionStore.getState().startRecovery(1234);
    const startedAt = useConnectionStore.getState().recoveringSince;

    vi.advanceTimersByTime(5_000);
    useConnectionStore.getState().startRecovery(9999);

    expect(useConnectionStore.getState()).toMatchObject({
      state: 'recovering',
      recoveringSince: startedAt,
      baselineDataUpdatedAt: 1234,
    });
  });

  it('settles online and clears the recovery metadata', () => {
    useConnectionStore.getState().startRecovery(1234);
    useConnectionStore.getState().settle();

    expect(useConnectionStore.getState()).toMatchObject({
      state: 'online',
      recoveringSince: null,
      baselineDataUpdatedAt: 0,
    });
  });

  it('goes offline immediately and clears recovery', () => {
    useConnectionStore.getState().startRecovery(1234);
    useConnectionStore.getState().setOffline();

    expect(useConnectionStore.getState()).toMatchObject({
      state: 'offline',
      recoveringSince: null,
      baselineDataUpdatedAt: 0,
    });
  });
});
