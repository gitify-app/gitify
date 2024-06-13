import type { Hostname, WebUrl } from '../types';
import type { Notification, Subject, User } from '../typesGitHub';
import Constants from '../utils/constants';
import { mockGitifyUser, mockToken } from './state-mocks';

export function partialMockNotification(
  subject: Partial<Subject>,
): Notification {
  const mockNotification: Partial<Notification> = {
    account: {
      method: 'Personal Access Token',
      platform: 'GitHub Cloud',
      hostname: Constants.GITHUB_API_BASE_URL as Hostname,
      token: mockToken,
      user: mockGitifyUser,
    },
    subject: subject as Subject,
  };

  return mockNotification as Notification;
}

export function partialMockUser(login: string): User {
  const mockUser: Partial<User> = {
    login: login,
    html_url: `https://github.com/${login}` as WebUrl,
    avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4' as WebUrl,
    type: 'User',
  };

  return mockUser as User;
}
