import { create } from 'zustand';

import type { GnomeExtensionState } from '../../shared/events';

import {
  enableGnomeExtension,
  getGnomeExtensionState,
  installGnomeExtension,
} from '../utils/system/comms';

interface GnomeExtensionStore {
  state: GnomeExtensionState | null;
  busy: boolean;

  refresh: () => Promise<void>;
  install: () => Promise<void>;
  enable: () => Promise<void>;
}

export const useGnomeExtensionStore = create<GnomeExtensionStore>()((set) => {
  const apply = async (action: () => Promise<GnomeExtensionState>) => {
    set({ busy: true });
    set({ state: await action(), busy: false });
  };

  return {
    state: null,
    busy: false,

    refresh: async () => {
      if (window.gitify.platform.isGnome()) {
        set({ state: await getGnomeExtensionState() });
      }
    },

    install: () => apply(installGnomeExtension),
    enable: () => apply(enableGnomeExtension),
  };
});
