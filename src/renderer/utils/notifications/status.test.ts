import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../../__mocks__/account-mocks';

import type { AccountNotifications, GitifyError } from '../../types';

import { getErrorDetails } from '../core/errors';
import { deriveGlobalError, deriveStatus, hasNoAccountErrors } from './status';

function group(account = mockGitHubCloudAccount, error: GitifyError | null = null) {
  return { account, notifications: [], error } as AccountNotifications;
}

const clean = group();
const cleanSecond = group(mockGitHubEnterpriseServerAccount);
const networkError = group(mockGitHubCloudAccount, getErrorDetails('NETWORK'));
const networkErrorSecond = group(mockGitHubEnterpriseServerAccount, getErrorDetails('NETWORK'));
const rateLimitedError = group(mockGitHubEnterpriseServerAccount, getErrorDetails('RATE_LIMITED'));

const baseInput = { isLoading: false, isPaused: false, isError: false };

describe('renderer/utils/notifications/status.ts', () => {
  describe('deriveStatus', () => {
    it('reports loading only while the initial fetch is in flight', () => {
      expect(deriveStatus({ ...baseInput, isLoading: true, notifications: [] })).toBe('loading');
    });

    it('reports error when the query is paused (offline)', () => {
      expect(deriveStatus({ ...baseInput, isPaused: true, notifications: [clean] })).toBe('error');
    });

    it('reports error when the query failed', () => {
      expect(deriveStatus({ ...baseInput, isError: true, notifications: [clean] })).toBe('error');
    });

    it('reports error when every account has an error', () => {
      expect(deriveStatus({ ...baseInput, notifications: [networkError, rateLimitedError] })).toBe(
        'error',
      );
    });

    it('reports success when at least one account has no error', () => {
      expect(deriveStatus({ ...baseInput, notifications: [clean, networkError] })).toBe('success');
    });
  });

  describe('deriveGlobalError', () => {
    it('returns the offline error when paused', () => {
      expect(deriveGlobalError({ isPaused: true, notifications: [clean] })).toEqual(
        getErrorDetails('OFFLINE'),
      );
    });

    it('returns undefined when there are no accounts', () => {
      expect(deriveGlobalError({ isPaused: false, notifications: [] })).toBeUndefined();
    });

    it('returns the shared error when all accounts have the same error', () => {
      expect(
        deriveGlobalError({ isPaused: false, notifications: [networkError, networkErrorSecond] }),
      ).toEqual(getErrorDetails('NETWORK'));
    });

    it('returns undefined when accounts have differing errors', () => {
      expect(
        deriveGlobalError({ isPaused: false, notifications: [networkError, rateLimitedError] }),
      ).toBeUndefined();
    });

    it('returns undefined on partial failure', () => {
      expect(
        deriveGlobalError({ isPaused: false, notifications: [clean, networkError] }),
      ).toBeUndefined();
    });
  });

  describe('hasNoAccountErrors', () => {
    it('is true when there are no accounts', () => {
      expect(hasNoAccountErrors([])).toBe(true);
    });

    it('is true when every account has no error', () => {
      expect(hasNoAccountErrors([clean, cleanSecond])).toBe(true);
    });

    it('is false when some accounts have errors', () => {
      expect(hasNoAccountErrors([clean, networkError])).toBe(false);
    });

    it('is false when every account has an error', () => {
      expect(hasNoAccountErrors([networkError, rateLimitedError])).toBe(false);
    });
  });
});
