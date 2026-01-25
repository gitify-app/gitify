import { Constants } from '../constants';

import type {
  Account,
  AccountNotifications,
  GitifyError,
  Hostname,
  Token,
} from '../types';

import { mockGitifyUser } from './user-mocks';

export const mockGitHubAppAccount: Account = {
  platform: 'GitHub Cloud',
  method: 'GitHub App',
  token: 'token-987654321' as Token,
  hostname: Constants.GITHUB_HOSTNAME,
  user: mockGitifyUser,
  hasRequiredScopes: true,
};

export const mockPersonalAccessTokenAccount: Account = {
  platform: 'GitHub Cloud',
  method: 'Personal Access Token',
  token: 'token-123-456' as Token,
  hostname: Constants.GITHUB_HOSTNAME,
  user: mockGitifyUser,
  hasRequiredScopes: true,
};

export const mockOAuthAccount: Account = {
  platform: 'GitHub Enterprise Server',
  method: 'OAuth App',
  token: 'token-1234568790' as Token,
  hostname: 'github.gitify.io' as Hostname,
  user: mockGitifyUser,
  hasRequiredScopes: true,
};

export const mockGitHubCloudAccount: Account = {
  platform: 'GitHub Cloud',
  method: 'Personal Access Token',
  token: 'token-123-456' as Token,
  hostname: Constants.GITHUB_HOSTNAME,
  user: mockGitifyUser,
  version: 'latest',
  hasRequiredScopes: true,
};

export const mockGitHubEnterpriseServerAccount: Account = {
  platform: 'GitHub Enterprise Server',
  method: 'Personal Access Token',
  token: 'token-1234568790' as Token,
  hostname: 'github.gitify.io' as Hostname,
  user: mockGitifyUser,
  hasRequiredScopes: true,
};

export function mockAccountWithError(error: GitifyError): AccountNotifications {
  return {
    account: mockGitHubCloudAccount,
    notifications: [],
    error,
  };
}
