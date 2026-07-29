import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../../__mocks__/account-mocks';

import {
  clearServerPollIntervals,
  computeRefetchIntervalMs,
  reportServerPollInterval,
} from './pollInterval';

describe('renderer/utils/notifications/pollInterval.ts', () => {
  beforeEach(() => {
    clearServerPollIntervals();
  });

  it('returns the user interval when no server interval has been reported', () => {
    expect(computeRefetchIntervalMs(60000, [mockGitHubCloudAccount])).toBe(60000);
  });

  it('stretches the interval to the slowest server recommendation', () => {
    reportServerPollInterval(mockGitHubCloudAccount, 60);
    reportServerPollInterval(mockGitHubEnterpriseServerAccount, 300);

    expect(
      computeRefetchIntervalMs(60000, [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount]),
    ).toBe(300000);
  });

  it('never polls faster than the user interval', () => {
    reportServerPollInterval(mockGitHubCloudAccount, 60);

    expect(computeRefetchIntervalMs(120000, [mockGitHubCloudAccount])).toBe(120000);
  });

  it('ignores intervals reported for accounts no longer polled', () => {
    reportServerPollInterval(mockGitHubEnterpriseServerAccount, 300);

    expect(computeRefetchIntervalMs(60000, [mockGitHubCloudAccount])).toBe(60000);
  });

  it('ignores invalid reported values', () => {
    reportServerPollInterval(mockGitHubCloudAccount, Number.NaN);
    reportServerPollInterval(mockGitHubCloudAccount, 0);
    reportServerPollInterval(mockGitHubCloudAccount, -5);

    expect(computeRefetchIntervalMs(60000, [mockGitHubCloudAccount])).toBe(60000);
  });

  it('uses the latest reported value for an account', () => {
    reportServerPollInterval(mockGitHubCloudAccount, 300);
    reportServerPollInterval(mockGitHubCloudAccount, 90);

    expect(computeRefetchIntervalMs(60000, [mockGitHubCloudAccount])).toBe(90000);
  });

  it('returns the user interval when no accounts are polled', () => {
    reportServerPollInterval(mockGitHubCloudAccount, 300);

    expect(computeRefetchIntervalMs(60000, [])).toBe(60000);
  });
});
