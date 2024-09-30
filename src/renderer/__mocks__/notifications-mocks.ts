import type { AccountNotifications } from '../types';
import {
  mockEnterpriseNotifications,
  mockGitHubNotifications,
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
    notifications: [mockGitHubNotifications[0]],
    error: null,
  },
];
