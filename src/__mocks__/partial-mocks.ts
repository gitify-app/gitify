import type { Notification, Subject, User } from '../typesGitHub';
import Constants from '../utils/constants';

export function partialMockNotification(
  subject: Partial<Subject>,
): Notification {
  const mockNotification: Partial<Notification> = {
    hostname: Constants.GITHUB_API_BASE_URL,
    subject: subject as Subject,
  };

  return mockNotification as Notification;
}

export function partialMockUser(login: string): User {
  const mockUser: Partial<User> = {
    login: login,
    html_url: `https://github.com/${login}`,
    avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
    type: 'User',
  };

  return mockUser as User;
}
