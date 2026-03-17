import type { Token } from '../types';

import {
  pollGitHubDeviceFlow,
  startGitHubDeviceFlow,
} from '../utils/auth/utils';

/**
 * Test helper to simulate the device OAuth flow by orchestrating
 * `startGitHubDeviceFlow` and repeated `pollGitHubDeviceFlow` calls.
 *
 * This is a test-only helper to replace production-only orchestration logic
 * in tests without exporting orchestration from production code.
 */
export async function simulateDeviceFlow(): Promise<Token> {
  const session = await startGitHubDeviceFlow();

  const intervalMs = Math.max(5000, session.intervalSeconds * 1000);

  while (Date.now() < session.expiresAt) {
    const token = await pollGitHubDeviceFlow(session);

    if (token) {
      return token;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error('Device code expired before authorization completed');
}
