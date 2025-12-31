import { vi } from 'vitest';

// Mock the Tauri HTTP plugin fetch function
export const fetch = vi
  .fn()
  .mockImplementation(async (_url: string, _options?: RequestInit) => {
    // Return a mock Response object
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({
        'content-type': 'application/json',
      }),
      json: vi.fn().mockResolvedValue({}),
      text: vi.fn().mockResolvedValue(''),
    };
  });
