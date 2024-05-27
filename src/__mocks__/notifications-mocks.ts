import type { AccountNotifications } from '../types';
import {
  mockEnterpriseNotifications,
  mockGitHubNotifications,
  mockSingleNotification,
} from '../utils/api/__mocks__/response-mocks';

export const mockAccountNotifications: AccountNotifications[] = [
  {
    hostname: 'github.com',
    notifications: mockGitHubNotifications,
  },
  {
    hostname: 'github.gitify.io',
    notifications: mockEnterpriseNotifications,
  },
];

export const mockSingleAccountNotifications: AccountNotifications[] = [
  {
    hostname: 'github.com',
    notifications: [mockSingleNotification],
  },
];
