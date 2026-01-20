import type { GitifyNotificationUser, GitifyUser, Link } from '../types';

export const mockGitifyUser: GitifyUser = {
  login: 'octocat',
  name: 'Mona Lisa Octocat',
  id: '123456789',
  avatar: 'https://avatars.githubusercontent.com/u/583231?v=4' as Link,
};

export function mockGitifyNotificationUser(
  login: string,
): GitifyNotificationUser {
  return {
    login: login,
    htmlUrl: `https://github.com/${login}` as Link,
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4' as Link,
    type: 'User',
  };
}
