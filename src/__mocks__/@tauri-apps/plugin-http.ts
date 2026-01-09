import { vi } from 'vitest';

// Mock Tauri HTTP plugin fetch
// Tests that need HTTP mocking should mock this function or use vi.spyOn
export const fetch = vi.fn();
