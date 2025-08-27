import type { AccountNotifications } from '../types';
import type { StateType, Subject, SubjectType } from '../typesGitHub';
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

export function createSubjectMock(mocks: {
  title?: string;
  type?: SubjectType;
  state?: StateType;
}): Subject {
  return {
    title: mocks.title ?? 'Mock Subject',
    type: mocks.type ?? ('Unknown' as SubjectType),
    state: mocks.state ?? ('Unknown' as StateType),
    url: null,
    latest_comment_url: null,
  };
}
