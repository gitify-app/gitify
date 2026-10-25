import { afterEach, beforeEach, type MockInstance, vi } from 'vitest';

/**
 * Restore spies created inside a test (or its hooks) after each test.
 *
 * The suite intentionally keeps some spies at module scope (inside `describe`
 * blocks) so every test in the file reuses them; a global `restoreMocks` would
 * tear those down after the first test. Track spies instead: module-scope spies
 * are created before the first `beforeEach` and are forgotten by the reset,
 * while spies created during a test are restored afterwards.
 */
const testSpies: MockInstance[] = [];
const persistentSpies = new Set<MockInstance>();
let firstTest = true;
const originalSpyOn = vi.spyOn.bind(vi) as (...args: unknown[]) => MockInstance;

vi.spyOn = ((...args: unknown[]) => {
  const spy = originalSpyOn(...args);

  if (!persistentSpies.has(spy)) {
    testSpies.push(spy);
  }

  return spy;
}) as unknown as typeof vi.spyOn;

beforeEach(() => {
  if (firstTest) {
    firstTest = false;

    // Anything already spied before the first test belongs to the file, not the
    // test. Keep it alive for every test in the file.
    for (const spy of testSpies) {
      persistentSpies.add(spy);
    }
  }

  testSpies.length = 0;
});

afterEach(() => {
  for (const spy of testSpies.splice(0)) {
    spy.mockRestore();
  }
});
