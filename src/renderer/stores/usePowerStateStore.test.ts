import usePowerStateStore from './usePowerStateStore';

describe('renderer/stores/usePowerStateStore.ts', () => {
  beforeEach(() => {
    usePowerStateStore.setState({ isActive: true });
  });

  it('starts active', () => {
    expect(usePowerStateStore.getInitialState().isActive).toBe(true);
  });

  it('tracks sleep and wake transitions', () => {
    usePowerStateStore.getState().setActive(false);
    expect(usePowerStateStore.getState().isActive).toBe(false);

    usePowerStateStore.getState().setActive(true);
    expect(usePowerStateStore.getState().isActive).toBe(true);
  });
});
