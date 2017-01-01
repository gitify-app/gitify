import Helpers from '../../utils/helpers';

describe('utils/helpers.js', () => {
  it('should generate the GitHub url (issue)', () => {
    var apiUrl = 'https://api.github.com/repos/ekonstantinidis/notifications-test/issues/3';
    var newUrl = Helpers.generateGitHubUrl(apiUrl);
    expect(newUrl).toBe('https://www.github.com/ekonstantinidis/notifications-test/issues/3');
  });

  it('should generate the GitHub url (repos)', () => {
    var apiUrl = 'https://api.github.com/repos/ekonstantinidis/notifications-test/pulls/12345';
    var newUrl = Helpers.generateGitHubUrl(apiUrl);
    expect(newUrl).toBe('https://www.github.com/ekonstantinidis/notifications-test/pull/12345');
  });

  it('should generate the GitHub url (release)', () => {
    var apiUrl = 'https://api.github.com/repos/ekonstantinidis/notifications-test/releases/3988077';
    var newUrl = Helpers.generateGitHubUrl(apiUrl);
    expect(newUrl).toBe('https://www.github.com/ekonstantinidis/notifications-test/releases');
  });
});
