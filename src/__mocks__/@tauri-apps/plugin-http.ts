import { vi } from 'vitest';

/**
 * Create a mock Response object that mimics the Tauri HTTP plugin response
 */
export function createMockResponse(
  data: unknown,
  options?: {
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
  },
) {
  const { status = 200, statusText = 'OK', headers = {} } = options || {};
  const headersMap = new Map(
    Object.entries({
      'content-type': 'application/json',
      ...headers,
    }).map(([k, v]) => [k.toLowerCase(), v]),
  );

  return {
    status,
    statusText,
    ok: status >= 200 && status < 300,
    headers: {
      get: (name: string) => headersMap.get(name.toLowerCase()) || null,
      forEach: (cb: (value: string, key: string) => void) => {
        headersMap.forEach(cb);
      },
    },
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
  };
}

// Mock Tauri HTTP plugin fetch with default empty response
export const fetch = vi.fn().mockResolvedValue(createMockResponse({}));
