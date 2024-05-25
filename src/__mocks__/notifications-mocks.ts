import type { AccountNotifications } from '../types';
import {
  mockedEnterpriseNotifications,
  mockedGitHubNotifications,
  mockedSingleNotification,
} from '../utils/api/__mocks__/response-mocks';

export const mockedAccountNotifications: AccountNotifications[] = [
  {
    hostname: 'github.com',
    notifications: mockedGitHubNotifications,
  },
  {
    hostname: 'github.gitify.io',
    notifications: mockedEnterpriseNotifications,
  },
];

export const mockedSingleAccountNotifications: AccountNotifications[] = [
  {
    hostname: 'github.com',
    notifications: [mockedSingleNotification],
  },
];
