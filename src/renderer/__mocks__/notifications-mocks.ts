import { Constants } from '../constants';
import type {
  AccountNotifications,
  GitifyNotification,
  GitifyReason,
  GitifyRepository,
  GitifySubject,
  Hostname,
  Link,
} from '../types';
import {
  mockEnterpriseNotifications,
  mockGitHubNotifications,
  mockSingleNotification,
} from '../utils/api/__mocks__/response-mocks';
import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from './account-mocks';
import { mockToken } from './state-mocks';
import { mockGitifyUser } from './user-mocks';

export const mockAccountNotifications: AccountNotifications[] = [
  {
    account: mockGitHubCloudAccount,
    notifications: mockGitHubNotifications,
    error: null,
  },
  {
    account: mockGitHubEnterpriseServerAccount,
    notifications: mockEnterpriseNotifications,
    error: null,
  },
];

export const mockSingleAccountNotifications: AccountNotifications[] = [
  {
    account: mockGitHubCloudAccount,
    notifications: [mockSingleNotification],
    error: null,
  },
];

export function createPartialMockNotification(
  subject: Partial<GitifySubject>,
  repository?: Partial<GitifyRepository>,
): GitifyNotification {
  const mockNotification: Partial<GitifyNotification> = {
    account: {
      method: 'Personal Access Token',
      platform: 'GitHub Cloud',
      hostname: Constants.GITHUB_API_BASE_URL as Hostname,
      token: mockToken,
      user: mockGitifyUser,
      hasRequiredScopes: true,
    },
    reason: {
      code: 'subscribed',
      title: 'Updated',
      description: "You're watching the repository.",
    } as GitifyReason,
    subject: subject as GitifySubject,
    repository: {
      name: 'notifications-test',
      fullName: 'gitify-app/notifications-test',
      htmlUrl: 'https://github.com/gitify-app/notifications-test' as Link,
      owner: {
        login: 'gitify-app',
        avatarUrl: 'https://avatars.githubusercontent.com/u/1' as Link,
        type: 'Organization',
      },
      ...repository,
    } as GitifyRepository,
  };

  return mockNotification as GitifyNotification;
}

export function createMockNotificationForRepoName(
  id: string,
  repoFullName: string | null,
): GitifyNotification {
  return {
    id,
    repository: repoFullName ? { fullName: repoFullName } : null,
    account: mockGitHubCloudAccount,
  } as GitifyNotification;
}
