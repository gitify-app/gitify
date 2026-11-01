import { vi } from 'vitest';

/**
 * Application code logs expected failures in tests that exercise error paths
 * (login failures, account refreshes, enrichment errors, storage migrations,
 * and so on). Replace the `electron-log` transport so those intentional
 * messages do not pollute the test output.
 *
 * The logger wrappers in `shared/logger` and `renderer/utils/core/logger` stay
 * real, so tests can still assert that application code calls them.
 */
vi.mock('electron-log', () => {
  const logger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    verbose: vi.fn(),
    silly: vi.fn(),
    initialize: vi.fn(),
    errorHandler: {
      startCatching: vi.fn(),
    },
    transports: {
      file: {
        fileName: 'test.log',
        getFile: vi.fn(() => ({ path: '/tmp/gitify-test.log' })),
      },
      console: {
        level: false,
      },
    },
  };

  return { default: logger };
});

vi.mock('electron-log/renderer', () => {
  const logger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    verbose: vi.fn(),
    silly: vi.fn(),
    initialize: vi.fn(),
    errorHandler: {
      startCatching: vi.fn(),
    },
    transports: {
      file: {
        fileName: 'test.log',
        getFile: vi.fn(() => ({ path: '/tmp/gitify-test.log' })),
      },
      console: {
        level: false,
      },
    },
  };

  return { default: logger };
});
