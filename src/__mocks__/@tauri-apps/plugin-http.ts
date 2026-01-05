import { vi } from 'vitest';

// Mock fetch that throws an error to indicate it shouldn't be called in tests
// Tests should mock axios instead since the code checks isTauriEnvironment()
export const fetch = vi
  .fn()
  .mockRejectedValue(
    new Error(
      'Tauri HTTP plugin should not be called in tests - mock axios instead',
    ),
  );
