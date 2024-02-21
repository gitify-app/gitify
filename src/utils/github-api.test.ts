import {
  formatReason,
  getNotificationTypeIcon,
  getNotificationTypeIconColor,
} from './github-api';
import { Reason, StateType, SubjectType } from '../typesGithub';

describe('./utils/github-api.ts', () => {
  it('should format the notification reason', () => {
    expect(formatReason('assign')).toMatchSnapshot();
    expect(formatReason('author')).toMatchSnapshot();
    expect(formatReason('ci_activity')).toMatchSnapshot();
    expect(formatReason('comment')).toMatchSnapshot();
    expect(formatReason('invitation')).toMatchSnapshot();
    expect(formatReason('manual')).toMatchSnapshot();
    expect(formatReason('member_feature_requested')).toMatchSnapshot();
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
    expect(getNotificationTypeIcon('RepositoryInvitation').displayName).toBe(
      'MailIcon',
    );
    expect(
      getNotificationTypeIcon('RepositoryVulnerabilityAlert').displayName,
    ).toBe('AlertIcon');
    expect(getNotificationTypeIcon('Unknown' as SubjectType).displayName).toBe(
      'QuestionIcon',
    );
  });

  it('should format the notification color', () => {
    expect(getNotificationTypeIconColor('closed')).toMatchSnapshot();
    expect(getNotificationTypeIconColor('completed')).toMatchSnapshot();
    expect(getNotificationTypeIconColor('draft')).toMatchSnapshot();
    expect(getNotificationTypeIconColor('merged')).toMatchSnapshot();
    expect(getNotificationTypeIconColor('not_planned')).toMatchSnapshot();
    expect(getNotificationTypeIconColor('open')).toMatchSnapshot();
    expect(getNotificationTypeIconColor('reopened')).toMatchSnapshot();
    expect(
      getNotificationTypeIconColor('something_else_unknown' as StateType),
    ).toMatchSnapshot();
  });
});
