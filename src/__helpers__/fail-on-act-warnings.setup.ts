import { afterEach, beforeEach } from 'vitest';

/**
 * Fail a test when React reports an update outside `act(...)`.
 *
 * These warnings are real bugs in the test (a store update or promise resolving
 * without being awaited) but are easy to miss in CI logs. Collect them and
 * assert after the test, including warnings emitted while unmounting.
 */
let actWarnings: string[] = [];
const originalConsoleError = console.error;

beforeEach(() => {
  actWarnings = [];
  console.error = (...args: unknown[]) => {
    const message = args.map(String).join(' ');

    if (message.includes('not wrapped in act')) {
      actWarnings.push(message);
    }

    originalConsoleError(...args);
  };
});

afterEach(async () => {
  // Let queued React work and unmount cleanup flush before checking.
  await new Promise((resolve) => setTimeout(resolve, 0));
  console.error = originalConsoleError;

  if (actWarnings.length > 0) {
    throw new Error(`React act(...) warnings:\n\n${actWarnings.join('\n\n')}`);
  }
});
