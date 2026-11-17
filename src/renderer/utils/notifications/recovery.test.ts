import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../../__mocks__/account-mocks';

import type { AccountNotifications, ErrorType } from '../../types';

import { getErrorDetails } from '../core/errors';
import { hasCleanAccount, isRetryableConnectionError, shouldUseRecoveryRetry } from './recovery';

function group(errorType: ErrorType | null = null, account = mockGitHubCloudAccount) {
  return {
    account,
    notifications: [],
    error: errorType ? getErrorDetails(errorType) : null,
  } as AccountNotifications;
}

describe('renderer/utils/notifications/recovery.ts', () => {
  describe('hasCleanAccount', () => {
    it('is true when at least one account has no error', () => {
      expect(hasCleanAccount([group(), group('BAD_CREDENTIALS')])).toBe(true);
    });

    it('is false when every account has an error', () => {
      expect(hasCleanAccount([group('NETWORK'), group('UNKNOWN')])).toBe(false);
    });

    it('is false with no accounts', () => {
      expect(hasCleanAccount([])).toBe(false);
    });
  });

  describe('isRetryableConnectionError', () => {
    it('is true for all-account network failures', () => {
      expect(
        isRetryableConnectionError([
          group('NETWORK'),
          group('NETWORK', mockGitHubEnterpriseServerAccount),
        ]),
      ).toBe(true);
    });

    it('is true for unknown classifications during recovery', () => {
      expect(
        isRetryableConnectionError([
          group('UNKNOWN'),
          group('UNKNOWN', mockGitHubEnterpriseServerAccount),
        ]),
      ).toBe(true);
    });

    it('is false when any definitive error is present', () => {
      expect(
        isRetryableConnectionError([
          group('NETWORK'),
          group('BAD_CREDENTIALS', mockGitHubEnterpriseServerAccount),
        ]),
      ).toBe(false);
    });

    it('is false for partial success', () => {
      expect(isRetryableConnectionError([group(), group('NETWORK')])).toBe(false);
    });

    it('is false with no accounts', () => {
      expect(isRetryableConnectionError([])).toBe(false);
    });
  });

  describe('shouldUseRecoveryRetry', () => {
    const networkFailures = [group('NETWORK'), group('UNKNOWN', mockGitHubEnterpriseServerAccount)];

    it('is true while recovering with a retryable failure', () => {
      expect(shouldUseRecoveryRetry('recovering', networkFailures)).toBe(true);
    });

    it('is false once recovery ends', () => {
      expect(shouldUseRecoveryRetry('online', networkFailures)).toBe(false);
    });

    it('is false while offline', () => {
      expect(shouldUseRecoveryRetry('offline', networkFailures)).toBe(false);
    });

    it('is false after a clean success', () => {
      expect(shouldUseRecoveryRetry('recovering', [group()])).toBe(false);
    });

    it('is false after a partial success', () => {
      expect(shouldUseRecoveryRetry('recovering', [group(), group('NETWORK')])).toBe(false);
    });

    it('is false after a definitive failure', () => {
      expect(shouldUseRecoveryRetry('recovering', [group('BAD_CREDENTIALS')])).toBe(false);
    });
  });
});
