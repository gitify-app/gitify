import axios from 'axios';
import nock from 'nock';

import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../../__mocks__/account-mocks';
import {
  createMockNotificationForRepoName,
  createPartialMockNotification,
  mockSingleAccountNotifications,
} from '../../__mocks__/notifications-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';
import {
  type AccountNotifications,
  GroupBy,
  type Link,
  type SettingsState,
} from '../../types';
import type { Repository } from '../../typesGitHub';
import * as logger from '../../utils/logger';
import {
  enrichNotification,
  getNotificationCount,
  getUnreadNotificationCount,
  stabilizeNotificationsOrder,
} from './notifications';

describe('renderer/utils/notifications/notifications.ts', () => {
  beforeEach(() => {
    // axios will default to using the XHR adapter which can't be intercepted
    // by nock. So, configure axios to use the node adapter.
    axios.defaults.adapter = 'http';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getNotificationCount', () => {
    const result = getNotificationCount(mockSingleAccountNotifications);

    expect(result).toBe(1);
  });

  it('getUnreadNotificationCount', () => {
    const result = getUnreadNotificationCount(mockSingleAccountNotifications);

    expect(result).toBe(1);
  });

  it('enrichNotification - catches error and logs message', async () => {
    const rendererLogErrorSpy = jest
      .spyOn(logger, 'rendererLogError')
      .mockImplementation();
    const rendererLogWarnSpy = jest
      .spyOn(logger, 'rendererLogWarn')
      .mockImplementation();

    const mockError = new Error('Test error');
    const mockNotification = createPartialMockNotification({
      title: 'This issue will throw an error',
      type: 'Issue',
      url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/1' as Link,
    });
    const mockRepository = {
      full_name: 'gitify-app/notifications-test',
    } as Repository;
    mockNotification.repository = mockRepository;

    nock('https://api.github.com')
      .get('/repos/gitify-app/notifications-test/issues/1')
      .replyWithError(mockError);

    await enrichNotification(mockNotification, mockSettings);

    expect(rendererLogErrorSpy).toHaveBeenCalledWith(
      'enrichNotification',
      'failed to enrich notification details for',
      mockError,
      mockNotification,
    );

    expect(rendererLogWarnSpy).toHaveBeenCalledWith(
      'enrichNotification',
      'Continuing with base notification details',
    );
  });

  describe('stabilizeNotificationsOrder', () => {
    const acc1: AccountNotifications = {
      account: mockGitHubCloudAccount,
      notifications: [
        createMockNotificationForRepoName('a1', 'owner/repo-1'),
        createMockNotificationForRepoName('a2', 'owner/repo-2'),
        createMockNotificationForRepoName('a3', 'owner/repo-1'),
      ],
      error: null,
    };

    const acc2: AccountNotifications = {
      account: mockGitHubEnterpriseServerAccount,
      notifications: [
        createMockNotificationForRepoName('b1', 'owner/repo-3'),
        createMockNotificationForRepoName('b2', 'owner/repo-4'),
        createMockNotificationForRepoName('b3', 'owner/repo-3'),
      ],
      error: null,
    };

    const mockAccounts: AccountNotifications[] = [acc1, acc2];

    it('assigns sequential order across all notifications when not grouped (DATE)', () => {
      const settings: SettingsState = {
        ...mockSettings,
        groupBy: GroupBy.DATE,
      };

      stabilizeNotificationsOrder(mockAccounts, settings);

      expect(
        mockAccounts.flatMap((acc) => acc.notifications).map((n) => n.order),
      ).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('groups by repository when REPOSITORY and assigns order in first-seen repo groups', () => {
      const settings: SettingsState = {
        ...mockSettings,
        groupBy: GroupBy.REPOSITORY,
      };

      stabilizeNotificationsOrder(mockAccounts, settings);

      expect(
        mockAccounts.flatMap((acc) => acc.notifications).map((n) => n.order),
      ).toEqual([0, 2, 1, 3, 5, 4]);
    });
  });
});
