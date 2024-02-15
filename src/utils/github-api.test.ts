import {
  formatReason,
  getNotificationTypeIcon,
  getWorkflowTypeFromTitle,
} from './github-api';
import { Reason, SubjectType } from '../typesGithub';

describe('./utils/github-api.ts', () => {
  it('should format the notification reason', () => {
    expect(formatReason('approval_requested')).toMatchSnapshot();
    expect(formatReason('assign')).toMatchSnapshot();
    expect(formatReason('author')).toMatchSnapshot();
    expect(formatReason('ci_activity')).toMatchSnapshot();
    expect(formatReason('comment')).toMatchSnapshot();
    expect(formatReason('invitation')).toMatchSnapshot();
    expect(formatReason('manual')).toMatchSnapshot();
    expect(formatReason('mention')).toMatchSnapshot();
    expect(formatReason('review_requested')).toMatchSnapshot();
    expect(formatReason('security_alert')).toMatchSnapshot();
    expect(formatReason('state_change')).toMatchSnapshot();
    expect(formatReason('subscribed')).toMatchSnapshot();
    expect(formatReason('team_mention')).toMatchSnapshot();
    expect(formatReason('something_else_unknown' as Reason)).toMatchSnapshot();
  });

  it('should get the notification type icon', () => {
    expect(getNotificationTypeIcon('CheckSuite').displayName).toBe('SyncIcon');
    expect(getNotificationTypeIcon('Commit').displayName).toBe('GitCommitIcon');
    expect(getNotificationTypeIcon('Discussion').displayName).toBe(
      'CommentDiscussionIcon',
    );
    expect(getNotificationTypeIcon('Issue').displayName).toBe(
      'IssueOpenedIcon',
    );
    expect(getNotificationTypeIcon('Issue', 'draft').displayName).toBe(
      'IssueDraftIcon',
    );
    expect(getNotificationTypeIcon('Issue', 'closed').displayName).toBe(
      'IssueClosedIcon',
    );
    expect(getNotificationTypeIcon('Issue', 'completed').displayName).toBe(
      'IssueClosedIcon',
    );
    expect(getNotificationTypeIcon('Issue', 'reopened').displayName).toBe(
      'IssueReopenedIcon',
    );
    expect(getNotificationTypeIcon('PullRequest').displayName).toBe(
      'GitPullRequestIcon',
    );
    expect(getNotificationTypeIcon('PullRequest', 'draft').displayName).toBe(
      'GitPullRequestDraftIcon',
    );
    expect(getNotificationTypeIcon('PullRequest', 'closed').displayName).toBe(
      'GitPullRequestClosedIcon',
    );
    expect(getNotificationTypeIcon('PullRequest', 'merged').displayName).toBe(
      'GitMergeIcon',
    );
    expect(getNotificationTypeIcon('Release').displayName).toBe('TagIcon');
    expect(
      getNotificationTypeIcon('RepositoryVulnerabilityAlert').displayName,
    ).toBe('AlertIcon');
    expect(getNotificationTypeIcon('WorkflowRun').displayName).toBe(
      'RocketIcon',
    );
    expect(getNotificationTypeIcon('Unknown' as SubjectType).displayName).toBe(
      'QuestionIcon',
    );
  });

  describe('should get the workflow status type from title', () => {
    it('should infer failed workflow status from the title', () => {
      expect(
        getWorkflowTypeFromTitle('Demo workflow run failed for main branch'),
      ).toBe('failure');
    });

    it('should infer success workflow status from the title', () => {
      expect(
        getWorkflowTypeFromTitle('Demo workflow run succeeded for main branch'),
      ).toBe('success');
    });

    it('should infer cancelled workflow status from the title', () => {
      expect(
        getWorkflowTypeFromTitle('Demo workflow run cancelled for main branch'),
      ).toBe('cancelled');
    });

    it('should infer approval waiting status from the title', () => {
      expect(
        getWorkflowTypeFromTitle(
          'user requested your review to deploy to an environment',
        ),
      ).toBe('waiting');
    });

    it('should return null for known workflow status', () => {
      expect(
        getWorkflowTypeFromTitle(
          'Demo workflow run has not status for main branch',
        ),
      ).toBeNull();
    });
  });
});
