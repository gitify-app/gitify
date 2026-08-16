import type { GitifyNotificationUser, Link } from '../../../types';

import { formatGitHubNotificationUser } from './users';

function createUser(
  htmlUrl: string,
  type: GitifyNotificationUser['type'] = 'Bot',
): GitifyNotificationUser {
  return {
    login: 'actor',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1' as Link,
    htmlUrl: htmlUrl as Link,
    type,
  };
}

describe('renderer/utils/forges/github/users.ts', () => {
  it('formats an ordinary GitHub App profile as Bot', () => {
    expect(formatGitHubNotificationUser(createUser('https://github.com/apps/github-actions'))).toBe(
      'github-actions[bot]',
    );
  });

  it('formats the Copilot pull request reviewer app as AI', () => {
    expect(
      formatGitHubNotificationUser(
        createUser('https://github.com/apps/copilot-pull-request-reviewer'),
      ),
    ).toBe('copilot[ai]');
  });

  it('supports GitHub Enterprise App profile URLs', () => {
    expect(
      formatGitHubNotificationUser(createUser('https://github.example.com/apps/github-actions')),
    ).toBe('github-actions[bot]');
  });

  it.each([
    ['a non-app profile', 'https://github.com/github-actions'],
    ['an app path without a slug', 'https://github.com/apps/'],
    ['an app path with extra segments', 'https://github.com/apps/github-actions/settings'],
    ['a malformed URL', 'not a URL'],
  ])('preserves the login for %s', (_description, htmlUrl) => {
    expect(formatGitHubNotificationUser(createUser(htmlUrl))).toBe('actor');
  });

  it('preserves the login for a non-bot actor with an app profile URL', () => {
    expect(
      formatGitHubNotificationUser(createUser('https://github.com/apps/github-actions', 'User')),
    ).toBe('actor');
  });
});
