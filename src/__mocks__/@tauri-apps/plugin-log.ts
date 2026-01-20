import { vi } from 'vitest';

export const trace = vi.fn().mockResolvedValue(undefined);
export const debug = vi.fn().mockResolvedValue(undefined);
export const info = vi.fn().mockResolvedValue(undefined);
export const warn = vi.fn().mockResolvedValue(undefined);
export const error = vi.fn().mockResolvedValue(undefined);
