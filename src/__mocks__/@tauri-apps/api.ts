import { vi } from 'vitest';

export const invoke = vi.fn();

export const event = {
  listen: vi.fn().mockResolvedValue(() => {}),
  emit: vi.fn(),
};

export const window = {
  getCurrentWindow: vi.fn().mockReturnValue({
    show: vi.fn(),
    hide: vi.fn(),
    setFocus: vi.fn(),
  }),
};

export const app = {
  getVersion: vi.fn().mockResolvedValue('0.0.1'),
};

// Mock convertFileSrc to return a mock asset URL
export const convertFileSrc = vi.fn((filePath: string) => {
  return `asset://localhost/${filePath}`;
});
