import {
  generateGitHubWebUrl,
  generateGitHubAPIUrl,
  generateNotificationReferrerId,
  getLatestDiscussionCommentId,
  isEnterpriseHost,
  addHours,
  formatSearchQueryString,
} from './helpers';
import {
  mockedSingleNotification,
  mockedUser,
  mockedGraphQLResponse,
  mockedAuthState,
} from '../__mocks__/mockedData';

const URL = {
  normal: {
    api: 'https://api.github.com/repos/myuser/notifications-test',
    default: 'https://github.com/myuser/notifications-test',
  },
  enterprise: {
    api: 'https://github.gitify.io/api/v3/repos/myorg/notifications-test',
    default: 'https://github.gitify.io/myorg/notifications-test',
  },
};

describe('utils/helpers.ts', () => {
  describe('isEnterpriseHost', () => {
    it('should return true for enterprise host', () => {
      expect(isEnterpriseHost('github.manos.im')).toBe(true);
      expect(isEnterpriseHost('api.github.manos.im')).toBe(true);
    });

    it('should return false for non-enterprise host', () => {
      expect(isEnterpriseHost('github.com')).toBe(false);
      expect(isEnterpriseHost('api.github.com')).toBe(false);
    });
  });

  describe('generateNotificationReferrerId', () => {
    it('should generate the notification_referrer_id', () => {
      const referrerId = generateNotificationReferrerId(
        mockedSingleNotification.id,
        mockedUser.id,
      );
      expect(referrerId).toBe(
        'MDE4Ok5vdGlmaWNhdGlvblRocmVhZDEzODY2MTA5NjoxMjM0NTY3ODk=',
      );
    });
  });

  describe('generateGitHubWebUrl', () => {
    let notificationReferrerId;
    beforeAll(() => {
      notificationReferrerId = generateNotificationReferrerId(
        mockedSingleNotification.id,
        mockedUser.id,
      );
    });

    it('should generate the GitHub url - non enterprise - (issue)', () =>
      testGenerateUrl(
        `${URL.normal.api}/issues/3`,
        `${URL.normal.default}/issues/3?${notificationReferrerId}`,
      ));

    it('should generate the GitHub url - non enterprise - (pull request)', () =>
      testGenerateUrl(
        `${URL.normal.api}/pulls/123`,
        `${URL.normal.default}/pull/123?${notificationReferrerId}`,
      ));

    it('should generate the GitHub url - non enterprise - (release)', () =>
      testGenerateUrl(
        `${URL.normal.api}/releases/3988077`,
        `${URL.normal.default}/releases/3988077?${notificationReferrerId}`,
      ));

    it('should generate the GitHub url - non enterprise - (discussion)', () =>
      testGenerateUrl(
        `${URL.normal.api}/discussions/630`,
        `${URL.normal.default}/discussions/630?${notificationReferrerId}`,
      ));

    it('should generate the GitHub url - enterprise - (issue)', () =>
      testGenerateUrl(
        `${URL.enterprise.api}/issues/123`,
        `${URL.enterprise.default}/issues/123?${notificationReferrerId}`,
      ));

    it('should generate the GitHub url - enterprise - (pull request)', () =>
      testGenerateUrl(
        `${URL.enterprise.api}/pulls/3`,
        `${URL.enterprise.default}/pull/3?${notificationReferrerId}`,
      ));

    it('should generate the GitHub url - enterprise - (release)', () =>
      testGenerateUrl(
        `${URL.enterprise.api}/releases/1`,
        `${URL.enterprise.default}/releases/1?${notificationReferrerId}`,
      ));

    it('should generate the GitHub url - enterprise - (discussion)', () =>
      testGenerateUrl(
        `${URL.enterprise.api}/discussions/343`,
        `${URL.enterprise.default}/discussions/343?${notificationReferrerId}`,
      ));

    it('should generate the GitHub issue url with correct commentId', () =>
      testGenerateUrl(
        `${URL.normal.api}/issues/5`,
        `${URL.normal.default}/issues/5?${notificationReferrerId}#issuecomment-1059824632`,
        // '#issuecomment-' +
        //   getCommentId(`${URL.normal.api}/issues/comments/1059824632`),
      ));

    it('should generate the GitHub discussion url with correct commentId', () =>
      testGenerateUrl(
        `${URL.normal.api}/discussions/75`,
        `${URL.normal.default}/discussions/75?${notificationReferrerId}#discussioncomment-2300902`,
        '#discussioncomment-' +
          getLatestDiscussionCommentId(
            mockedGraphQLResponse.data.data.search.edges[0].node.comments.edges,
          ),
      ));

    function testGenerateUrl(apiUrl, ExpectedResult, comment?) {
      const notif = {
        ...mockedSingleNotification,
        subject: { ...mockedSingleNotification.subject, url: apiUrl },
      };
      expect(generateGitHubWebUrl(notif, mockedAuthState)).toBe(ExpectedResult);
    }
  });

  describe('generateGitHubAPIUrl', () => {
    it('should generate a GitHub API url - non enterprise', () => {
      const result = generateGitHubAPIUrl('github.com');
      expect(result).toBe('https://api.github.com/');
    });

    it('should generate a GitHub API url - enterprise', () => {
      const result = generateGitHubAPIUrl('github.manos.im');
      expect(result).toBe('https://github.manos.im/api/v3/');
    });
  });

  describe('addHours', () => {
    // Example test using Jest
    test('adds hours correctly for positive values', () => {
      const result = addHours('2024-02-20T12:00:00.000Z', 3);
      expect(result).toBe('2024-02-20T15:00:00.000Z');
    });

    test('adds hours correctly for negative values', () => {
      const result = addHours('2024-02-20T12:00:00.000Z', -2);
      expect(result).toBe('2024-02-20T10:00:00.000Z');
    });
  });

  describe('formatSearchQueryString', () => {
    test('formats search query string correctly', () => {
      const result = formatSearchQueryString(
        'exampleRepo',
        'exampleTitle',
        '2024-02-20T12:00:00.000Z',
      );

      expect(result).toBe(
        `exampleTitle in:title repo:exampleRepo updated:>2024-02-20T10:00:00.000Z`,
      );
    });
  });
});
