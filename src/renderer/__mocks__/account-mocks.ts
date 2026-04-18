import { Constants } from '../constants';

import type {
  Account,
  AccountNotifications,
  Forge,
  GitifyError,
  Hostname,
  Token,
} from '../types';

import { getRecommendedScopeNames } from '../utils/auth/scopes';
import { mockGitifyUser } from './user-mocks';

const defaultForge: Forge = 'github';

export const mockGitHubAppAccount: Account = {
  forge: defaultForge,
  platform: 'GitHub Cloud',
  method: 'GitHub App',
  token: 'token-987654321' as Token,
  hostname: Constants.GITHUB_HOSTNAME,
  user: mockGitifyUser,
  scopes: getRecommendedScopeNames(),
};

export const mockPersonalAccessTokenAccount: Account = {
  platform: 'GitHub Cloud',
  method: 'Personal Access Token',
  token: 'token-123-456' as Token,
  hostname: Constants.GITHUB_HOSTNAME,
  user: mockGitifyUser,
  scopes: getRecommendedScopeNames(),
};

export const mockOAuthAccount: Account = {
  forge: defaultForge,
  platform: 'GitHub Enterprise Server',
  method: 'OAuth App',
  token: 'token-1234568790' as Token,
  hostname: 'github.gitify.io' as Hostname,
  user: mockGitifyUser,
  scopes: getRecommendedScopeNames(),
};

export const mockGitHubCloudAccount: Account = {
  forge: defaultForge,
  platform: 'GitHub Cloud',
  method: 'Personal Access Token',
  token: 'token-123-456' as Token,
  hostname: Constants.GITHUB_HOSTNAME,
  user: mockGitifyUser,
  version: 'latest',
};

export const mockGitHubEnterpriseServerAccount: Account = {
  forge: defaultForge,
  platform: 'GitHub Enterprise Server',
  method: 'Personal Access Token',
  token: 'token-1234568790' as Token,
  hostname: 'github.gitify.io' as Hostname,
  user: mockGitifyUser,
};

export function mockAccountWithError(error: GitifyError): AccountNotifications {
  return {
    account: mockGitHubCloudAccount,
    notifications: [],
    error,
  };
}
