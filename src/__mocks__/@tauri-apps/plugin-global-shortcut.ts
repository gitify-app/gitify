import { vi } from 'vitest';

export const register = vi.fn().mockResolvedValue(undefined);
export const unregister = vi.fn().mockResolvedValue(undefined);
export const isRegistered = vi.fn().mockResolvedValue(false);
export const unregisterAll = vi.fn().mockResolvedValue(undefined);
