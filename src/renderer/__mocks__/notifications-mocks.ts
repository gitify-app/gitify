import type { AccountNotifications, GitifyError } from '../types';
import type { Notification, StateType, SubjectType } from '../typesGitHub';
import {
  mockEnterpriseNotifications,
  mockGitHubNotifications,
  mockSingleNotification,
} from '../utils/api/__mocks__/response-mocks';
import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from './state-mocks';

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

export function mockNotificationWithSubject(mocks: {
  title?: string;
  type?: SubjectType;
  state?: StateType;
}): Notification {
  return {
    subject: {
      title: mocks.title ?? 'Mock Subject',
      type: mocks.type ?? ('Unknown' as SubjectType),
      state: mocks.state ?? ('Unknown' as StateType),
      url: null,
      latest_comment_url: null,
    },
  } as Notification;
}

export function mockAccountWithError(error: GitifyError): AccountNotifications {
  return {
    account: mockGitHubCloudAccount,
    notifications: [],
    error,
  };
}

export function mockNotificationWithRepoName(
  id: string,
  repoFullName: string | null,
): Notification {
  return {
    id,
    repository: repoFullName ? { full_name: repoFullName } : null,
    account: mockGitHubCloudAccount,
  } as Notification;
}
