import type { GitifyNotificationUser, GitifyUser, Link } from '../types';
import type { AuthorFieldsFragment } from '../utils/api/graphql/generated/graphql';
import type { RawUser } from '../utils/api/types';

export const mockGitifyUser: GitifyUser = {
  login: 'octocat',
  name: 'Mona Lisa Octocat',
  id: '123456789',
  avatar: 'https://avatars.githubusercontent.com/u/583231?v=4' as Link,
};

export function createPartialMockUser(login: string): RawUser {
  const mockUser: Partial<RawUser> = {
    login: login,
    html_url: `https://github.com/${login}` as Link,
    avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4' as Link,
    type: 'User',
  };

  return mockUser as RawUser;
}

export function createMockNotificationUser(
  login: string,
): GitifyNotificationUser {
  return {
    login: login,
    htmlUrl: `https://github.com/${login}` as Link,
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4' as Link,
    type: 'User',
  };
}

/**
 * Creates a mock author for use in GraphQL response mocks.
 * Uses snake_case properties to match the generated GraphQL types.
 */
export function createMockGraphQLAuthor(login: string): AuthorFieldsFragment {
  return {
    __typename: 'User',
    login: login,
    html_url: `https://github.com/${login}`,
    avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
    type: 'User',
  };
}
