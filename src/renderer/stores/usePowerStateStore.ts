import { create } from 'zustand';

import type { PowerStateStore } from './types';

/**
 * Session-local power state.
 *
 * Not persisted: a fresh process always starts active, and the next
 * sleep/lock event flips it back off. Polling queries read `isActive` and
 * return `false` from `refetchInterval` while it is off.
 */
const usePowerStateStore = create<PowerStateStore>()((set) => ({
  isActive: true,
  setActive: (active) => set({ isActive: active }),
}));

export default usePowerStateStore;
