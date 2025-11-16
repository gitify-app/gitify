import { Constants } from '../constants';
import type {
  Account,
  AccountNotifications,
  GitifyError,
  Hostname,
  Token,
} from '../types';
import {
  mockEnterpriseNotifications,
  mockGitHubNotifications,
  mockSingleNotification,
} from '../utils/api/__mocks__/response-mocks';
import { mockGitifyUser } from './user-mocks';

export const mockPersonalAccessTokenAccount: Account = {
  platform: 'GitHub Cloud',
  method: 'Personal Access Token',
  token: 'token-123-456' as Token,
  hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
  user: mockGitifyUser,
  hasRequiredScopes: true,
};

export const mockOAuthAccount: Account = {
  platform: 'GitHub Enterprise Server',
  method: 'OAuth App',
  token: '1234568790' as Token,
  hostname: 'github.gitify.io' as Hostname,
  user: mockGitifyUser,
  hasRequiredScopes: true,
};

export const mockGitHubCloudAccount: Account = {
  platform: 'GitHub Cloud',
  method: 'Personal Access Token',
  token: 'token-123-456' as Token,
  hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
  user: mockGitifyUser,
  version: 'latest',
  hasRequiredScopes: true,
};

export const mockGitHubEnterpriseServerAccount: Account = {
  platform: 'GitHub Enterprise Server',
  method: 'Personal Access Token',
  token: '1234568790' as Token,
  hostname: 'github.gitify.io' as Hostname,
  user: mockGitifyUser,
  hasRequiredScopes: true,
};

export const mockGitHubAppAccount: Account = {
  platform: 'GitHub Cloud',
  method: 'GitHub App',
  token: '987654321' as Token,
  hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
  user: mockGitifyUser,
  hasRequiredScopes: true,
};

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

export function mockAccountWithError(error: GitifyError): AccountNotifications {
  return {
    account: mockGitHubCloudAccount,
    notifications: [],
    error,
  };
}
