import { vi } from 'vitest';

export const getCurrentWindow = vi.fn().mockReturnValue({
  startResizeDragging: vi.fn().mockResolvedValue(undefined),
  startDragging: vi.fn().mockResolvedValue(undefined),
  setSize: vi.fn().mockResolvedValue(undefined),
  setPosition: vi.fn().mockResolvedValue(undefined),
  show: vi.fn().mockResolvedValue(undefined),
  hide: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  minimize: vi.fn().mockResolvedValue(undefined),
  maximize: vi.fn().mockResolvedValue(undefined),
  unmaximize: vi.fn().mockResolvedValue(undefined),
  isMaximized: vi.fn().mockResolvedValue(false),
  setFullscreen: vi.fn().mockResolvedValue(undefined),
  isFullscreen: vi.fn().mockResolvedValue(false),
});
