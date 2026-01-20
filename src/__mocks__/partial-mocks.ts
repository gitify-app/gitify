import { Constants } from '../constants';

import type {
  GitifyNotification,
  GitifyNotificationUser,
  GitifyRepository,
  GitifySubject,
  Hostname,
  Link,
} from '../types';

import type { User } from '../typesGitHub';
import { mockToken } from './state-mocks';
import { mockGitifyUser } from './user-mocks';

export function partialMockNotification(
  subject: Partial<GitifySubject>,
  repository?: Partial<GitifyRepository>,
): GitifyNotification {
  const mockNotification: Partial<GitifyNotification> = {
    account: {
      method: 'Personal Access Token',
      platform: 'GitHub Cloud',
      hostname: Constants.GITHUB_API_BASE_URL as Hostname,
      token: mockToken,
      user: mockGitifyUser,
      hasRequiredScopes: true,
    },
    subject: subject as GitifySubject,
    repository: repository as GitifyRepository,
  };

  return mockNotification as GitifyNotification;
}

export function partialMockUser(login: string): GitifyNotificationUser {
  const mockUser: Partial<GitifyNotificationUser> = {
    login: login,
    htmlUrl: `https://github.com/${login}` as Link,
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4' as Link,
    type: 'User',
  };

  return mockUser as GitifyNotificationUser;
}

export function partialMockRawUser(login: string): User {
  const mockUser: Partial<User> = {
    login: login,
    html_url: `https://github.com/${login}` as Link,
    avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4' as Link,
    type: 'User',
  };

  return mockUser as User;
}
