import { Constants } from '../constants';

import type {
  Account,
  AccountNotifications,
  GitifyError,
  Hostname,
  Token,
} from '../types';

import { getRecommendedScopeNames } from '../utils/auth/scopes';
import { mockGitifyUser } from './user-mocks';

export const mockGitHubAppAccount: Account = {
  forge: 'github',
  platform: 'GitHub Cloud',
  method: 'GitHub App',
  token: 'token-987654321' as Token,
  hostname: Constants.GITHUB_HOSTNAME,
  user: mockGitifyUser,
  scopes: getRecommendedScopeNames(),
};

export const mockPersonalAccessTokenAccount: Account = {
  forge: 'github',
  platform: 'GitHub Cloud',
  method: 'Personal Access Token',
  token: 'token-123-456' as Token,
  hostname: Constants.GITHUB_HOSTNAME,
  user: mockGitifyUser,
  scopes: getRecommendedScopeNames(),
};

export const mockOAuthAccount: Account = {
  forge: 'github',
  platform: 'GitHub Enterprise Server',
  method: 'OAuth App',
  token: 'token-1234568790' as Token,
  hostname: 'github.gitify.io' as Hostname,
  user: mockGitifyUser,
  scopes: getRecommendedScopeNames(),
};

export const mockGitHubCloudAccount: Account = {
  forge: 'github',
  platform: 'GitHub Cloud',
  method: 'Personal Access Token',
  token: 'token-123-456' as Token,
  hostname: Constants.GITHUB_HOSTNAME,
  user: mockGitifyUser,
  version: 'latest',
};

export const mockGitHubEnterpriseServerAccount: Account = {
  forge: 'github',
  platform: 'GitHub Enterprise Server',
  method: 'Personal Access Token',
  token: 'token-1234568790' as Token,
  hostname: 'github.gitify.io' as Hostname,
  user: mockGitifyUser,
};

export const mockGiteaAccount: Account = {
  forge: 'gitea',
  platform: 'Gitea',
  method: 'Personal Access Token',
  token: 'token-gitea' as Token,
  hostname: 'gitea.example.com' as Hostname,
  user: mockGitifyUser,
};

export function mockAccountWithError(error: GitifyError): AccountNotifications {
  return {
    account: mockGitHubCloudAccount,
    notifications: [],
    error,
  };
}
