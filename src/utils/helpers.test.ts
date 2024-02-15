import {
  generateGitHubWebUrl,
  generateGitHubAPIUrl,
  generateNotificationReferrerId,
  getCommentId,
  getLatestDiscussionCommentId,
  inferWorkflowBranchFromTitle,
  getCheckSuiteUrl,
  getWorkflowRunUrl,
} from './helpers';
import {
  mockedSingleNotification,
  mockedUser,
  mockedGraphQLResponse,
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
    let notificationReferrerId =
      'notification_referrer_id=MDE4Ok5vdGlmaWNhdGlvblRocmVhZDEzODY2MTA5NjoxMjM0NTY3ODk%3D';

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
        '#issuecomment-' +
          getCommentId(`${URL.normal.api}/issues/comments/1059824632`),
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

    it('should generate the GitHub workflow url with encoded workflow name', () =>
      testGenerateUrl(
        `${URL.normal.api}/actions?workflow=Some Workflow`,
        `${URL.normal.default}/actions?workflow=Some+Workflow&${notificationReferrerId}`,
      ));

    function testGenerateUrl(apiUrl, ExpectedResult, comment?) {
      const notif = { ...mockedSingleNotification, subject: { url: apiUrl } };
      expect(
        generateGitHubWebUrl(
          notif.subject.url,
          notif.id,
          mockedUser.id,
          comment,
        ),
      ).toBe(ExpectedResult);
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

  describe('inferWorkflowBranchFromTitle', () => {
    let notification;

    beforeEach(() => {
      notification = mockedSingleNotification;
    });

    it('should infer branch name from the title', () => {
      notification.subject.title =
        'Demo workflow run succeeded for main branch';
      expect(inferWorkflowBranchFromTitle(notification)).toBe('main');
    });

    it('should return null for known branch name', () => {
      notification.subject.title =
        'Demo workflow run does not have branch name';
      expect(inferWorkflowBranchFromTitle(notification)).toBeNull();
    });
  });

  describe('getCheckSuiteUrl', () => {
    let notification;

    beforeEach(() => {
      notification = mockedSingleNotification;
    });

    it('should generate a Github Action (CheckSuite) url', () => {
      notification.subject.title = 'Demo workflow run';

      const result = getCheckSuiteUrl(notification);
      expect(result).toBe(
        'https://github.com/manosim/notifications-test/actions',
      );
    });

    it('should generate a Github Action (CheckSuite) url with workflow and branch filters', () => {
      notification.subject.title =
        'Demo workflow run unhandled for main branch';

      const result = getCheckSuiteUrl(notification);
      expect(result).toBe(
        'https://github.com/manosim/notifications-test/actions?query=workflow:"Demo"+branch:main',
      );
    });

    it('should generate a Github Action (CheckSuite) url with all filters', () => {
      notification.subject.title =
        'Demo workflow run succeeded for main branch';

      const result = getCheckSuiteUrl(notification);
      expect(result).toBe(
        'https://github.com/manosim/notifications-test/actions?query=workflow:"Demo"+is:success+branch:main',
      );
    });
  });

  describe('getWorkflowRunUrl', () => {
    let notification;

    beforeEach(() => {
      notification = mockedSingleNotification;
    });

    it('should generate a Github Action (WorkflowRun) url', () => {
      notification.subject.title = 'some title';

      const result = getWorkflowRunUrl(notification);
      expect(result).toBe(
        'https://github.com/manosim/notifications-test/actions',
      );
    });

    it('should generate a Github Action (WorkflowRun) url for deployment review', () => {
      notification.subject.title =
        'userA requested your review to deploy to an environment';

      const result = getWorkflowRunUrl(notification);
      expect(result).toBe(
        'https://github.com/manosim/notifications-test/actions?query=is:waiting',
      );
    });
  });
});
