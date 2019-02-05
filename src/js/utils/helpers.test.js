import { generateGitHubWebUrl } from './helpers';

describe('utils/helpers.js', () => {
  it('should generate the GitHub url - non enterprise - (issue)', () => {
    const apiUrl =
      'https://api.github.com/repos/ekonstantinidis/notifications-test/issues/3';
    const newUrl = generateGitHubWebUrl(apiUrl);
    expect(newUrl).toBe(
      'https://www.github.com/ekonstantinidis/notifications-test/issues/3'
    );
  });

  it('should generate the GitHub url - non enterprise - (pull request)', () => {
    const apiUrl =
      'https://api.github.com/repos/ekonstantinidis/notifications-test/pulls/123';
    const newUrl = generateGitHubWebUrl(apiUrl);
    expect(newUrl).toBe(
      'https://www.github.com/ekonstantinidis/notifications-test/pull/123'
    );
  });

  it('should generate the GitHub url - non enterprise - (release)', () => {
    const apiUrl =
      'https://api.github.com/repos/myorg/notifications-test/releases/3988077';
    const newUrl = generateGitHubWebUrl(apiUrl);
    expect(newUrl).toBe(
      'https://www.github.com/myorg/notifications-test/releases'
    );
  });

  it('should generate the GitHub url - enterprise - (issue)', () => {
    const apiUrl =
      'https://github.gitify.io/api/v3/repos/myorg/notifications-test/issues/123';
    const newUrl = generateGitHubWebUrl(apiUrl);
    expect(newUrl).toBe(
      'https://github.gitify.io/myorg/notifications-test/issues/123'
    );
  });

  it('should generate the GitHub url - enterprise - (pull request)', () => {
    const apiUrl =
      'https://github.gitify.io/api/v3/repos/myorg/notifications-test/pulls/3';
    const newUrl = generateGitHubWebUrl(apiUrl);
    expect(newUrl).toBe(
      'https://github.gitify.io/myorg/notifications-test/pull/3'
    );
  });

  it('should generate the GitHub url - enterprise - (release)', () => {
    const apiUrl =
      'https://github.gitify.io/api/v3/repos/myorg/notifications-test/releases/1';
    const newUrl = generateGitHubWebUrl(apiUrl);
    expect(newUrl).toBe(
      'https://github.gitify.io/myorg/notifications-test/releases'
    );
  });
});
