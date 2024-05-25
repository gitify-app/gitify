import type { Notification, Subject, User } from '../typesGitHub';
import Constants from '../utils/constants';

export function partialMockedNotification(
  subject: Partial<Subject>,
): Notification {
  const mockedNotification: Partial<Notification> = {
    hostname: Constants.GITHUB_API_BASE_URL,
    subject: subject as Subject,
  };

  return mockedNotification as Notification;
}

export function partialMockedUser(login: string): User {
  const mockedUser: Partial<User> = {
    login: login,
    html_url: `https://github.com/${login}`,
    avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
    type: 'User',
  };

  return mockedUser as User;
}
