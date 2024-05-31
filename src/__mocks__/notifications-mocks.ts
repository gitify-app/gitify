import type { AccountNotifications } from '../types';
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
  },
  {
    account: mockGitHubEnterpriseServerAccount,
    notifications: mockEnterpriseNotifications,
  },
];

export const mockSingleAccountNotifications: AccountNotifications[] = [
  {
    account: mockGitHubCloudAccount,
    notifications: [mockSingleNotification],
  },
];
