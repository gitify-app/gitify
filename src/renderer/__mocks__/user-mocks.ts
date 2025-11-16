import type { GitifyUser, Link } from '../types';
import type { User } from '../typesGitHub';

export const mockGitifyUser: GitifyUser = {
  login: 'octocat',
  name: 'Mona Lisa Octocat',
  id: 123456789,
  avatar: 'https://avatars.githubusercontent.com/u/583231?v=4' as Link,
};

export function createPartialMockUser(login: string): User {
  const mockUser: Partial<User> = {
    login: login,
    html_url: `https://github.com/${login}` as Link,
    avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4' as Link,
    type: 'User',
  };

  return mockUser as User;
}
