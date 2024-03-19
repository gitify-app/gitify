import {
  formatReason,
  getNotificationTypeIcon,
  getNotificationTypeIconColor,
} from './github-api';
import { Reason, StateType, Subject, SubjectType } from '../typesGithub';

describe('formatReason', () => {
  it('should format the notification reason', () => {
    expect(formatReason('approval_requested')).toMatchSnapshot();
    expect(formatReason('assign')).toMatchSnapshot();
    expect(formatReason('author')).toMatchSnapshot();
    expect(formatReason('ci_activity')).toMatchSnapshot();
    expect(formatReason('comment')).toMatchSnapshot();
    expect(formatReason('invitation')).toMatchSnapshot();
    expect(formatReason('manual')).toMatchSnapshot();
    expect(formatReason('member_feature_requested')).toMatchSnapshot();
    expect(formatReason('mention')).toMatchSnapshot();
    expect(formatReason('review_requested')).toMatchSnapshot();
    expect(formatReason('security_advisory_credit')).toMatchSnapshot();
    expect(formatReason('security_alert')).toMatchSnapshot();
    expect(formatReason('state_change')).toMatchSnapshot();
    expect(formatReason('subscribed')).toMatchSnapshot();
    expect(formatReason('team_mention')).toMatchSnapshot();
    expect(formatReason('something_else_unknown' as Reason)).toMatchSnapshot();
  });
});

describe('getNotificationTypeIcon', () => {
  it('should get the notification type icon', () => {
    expect(
      getNotificationTypeIcon(
        createSubjectMock({ type: 'CheckSuite', state: null }),
      ).displayName,
    ).toBe('RocketIcon');
    expect(
      getNotificationTypeIcon(
        createSubjectMock({
          type: 'CheckSuite',
          state: 'cancelled',
        }),
      ).displayName,
    ).toBe('StopIcon');
    expect(
      getNotificationTypeIcon(
        createSubjectMock({
          type: 'CheckSuite',
          state: 'failure',
        }),
      ).displayName,
    ).toBe('XIcon');
    expect(
      getNotificationTypeIcon(
        createSubjectMock({
          type: 'CheckSuite',
          state: 'skipped',
        }),
      ).displayName,
    ).toBe('SkipIcon');
    expect(
      getNotificationTypeIcon(
        createSubjectMock({
          type: 'CheckSuite',
          state: 'success',
        }),
      ).displayName,
    ).toBe('CheckIcon');
    expect(
      getNotificationTypeIcon(createSubjectMock({ type: 'Commit' }))
        .displayName,
    ).toBe('GitCommitIcon');
    expect(
      getNotificationTypeIcon(createSubjectMock({ type: 'Discussion' }))
        .displayName,
    ).toBe('CommentDiscussionIcon');
    expect(
      getNotificationTypeIcon(
        createSubjectMock({ type: 'Discussion', state: 'DUPLICATE' }),
      ).displayName,
    ).toBe('DiscussionDuplicateIcon');
    expect(
      getNotificationTypeIcon(
        createSubjectMock({ type: 'Discussion', state: 'OUTDATED' }),
      ).displayName,
    ).toBe('DiscussionOutdatedIcon');
    expect(
      getNotificationTypeIcon(
        createSubjectMock({ type: 'Discussion', state: 'RESOLVED' }),
      ).displayName,
    ).toBe('DiscussionClosedIcon');
    expect(
      getNotificationTypeIcon(createSubjectMock({ type: 'Issue' })).displayName,
    ).toBe('IssueOpenedIcon');
    expect(
      getNotificationTypeIcon(
        createSubjectMock({ type: 'Issue', state: 'draft' }),
      ).displayName,
    ).toBe('IssueDraftIcon');
    expect(
      getNotificationTypeIcon(
        createSubjectMock({
          type: 'Issue',
          state: 'closed',
        }),
      ).displayName,
    ).toBe('IssueClosedIcon');
    expect(
      getNotificationTypeIcon(
        createSubjectMock({
          type: 'Issue',
          state: 'completed',
        }),
      ).displayName,
    ).toBe('IssueClosedIcon');
    expect(
      getNotificationTypeIcon(
        createSubjectMock({
          type: 'Issue',
          state: 'not_planned',
        }),
      ).displayName,
    ).toBe('SkipIcon');
    expect(
      getNotificationTypeIcon(
        createSubjectMock({
          type: 'Issue',
          state: 'reopened',
        }),
      ).displayName,
    ).toBe('IssueReopenedIcon');
    expect(
      getNotificationTypeIcon(createSubjectMock({ type: 'PullRequest' }))
        .displayName,
    ).toBe('GitPullRequestIcon');
    expect(
      getNotificationTypeIcon(
        createSubjectMock({
          type: 'PullRequest',
          state: 'draft',
        }),
      ).displayName,
    ).toBe('GitPullRequestDraftIcon');
    expect(
      getNotificationTypeIcon(
        createSubjectMock({
          type: 'PullRequest',
          state: 'closed',
        }),
      ).displayName,
    ).toBe('GitPullRequestClosedIcon');
    expect(
      getNotificationTypeIcon(
        createSubjectMock({
          type: 'PullRequest',
          state: 'merged',
        }),
      ).displayName,
    ).toBe('GitMergeIcon');
    expect(
      getNotificationTypeIcon(
        createSubjectMock({
          type: 'Release',
        }),
      ).displayName,
    ).toBe('TagIcon');
    expect(
      getNotificationTypeIcon(
        createSubjectMock({
          type: 'RepositoryInvitation',
        }),
      ).displayName,
    ).toBe('MailIcon');
    expect(
      getNotificationTypeIcon(
        createSubjectMock({
          type: 'RepositoryVulnerabilityAlert',
        }),
      ).displayName,
    ).toBe('AlertIcon');
    expect(
      getNotificationTypeIcon(
        createSubjectMock({
          type: 'WorkflowRun',
        }),
      ).displayName,
    ).toBe('RocketIcon');
    expect(getNotificationTypeIcon(createSubjectMock({})).displayName).toBe(
      'QuestionIcon',
    );
  });
});

describe('getNotificationTypeIconColor', () => {
  it('should format the notification color for check suite', () => {
    expect(
      getNotificationTypeIconColor(
        createSubjectMock({
          type: 'CheckSuite',
          state: 'cancelled',
        }),
      ),
    ).toMatchSnapshot();
    expect(
      getNotificationTypeIconColor(
        createSubjectMock({
          type: 'CheckSuite',
          state: 'failure',
        }),
      ),
    ).toMatchSnapshot();

    expect(
      getNotificationTypeIconColor(
        createSubjectMock({
          type: 'CheckSuite',
          state: 'skipped',
        }),
      ),
    ).toMatchSnapshot();
    expect(
      getNotificationTypeIconColor(
        createSubjectMock({
          type: 'CheckSuite',
          state: 'success',
        }),
      ),
    ).toMatchSnapshot();
    expect(
      getNotificationTypeIconColor(
        createSubjectMock({
          type: 'CheckSuite',
          state: null,
        }),
      ),
    ).toMatchSnapshot();
  });

  it('should format the notification color for state', () => {
    expect(
      getNotificationTypeIconColor(createSubjectMock({ state: 'ANSWERED' })),
    ).toMatchSnapshot();
    expect(
      getNotificationTypeIconColor(createSubjectMock({ state: 'closed' })),
    ).toMatchSnapshot();
    expect(
      getNotificationTypeIconColor(createSubjectMock({ state: 'completed' })),
    ).toMatchSnapshot();
    expect(
      getNotificationTypeIconColor(createSubjectMock({ state: 'draft' })),
    ).toMatchSnapshot();
    expect(
      getNotificationTypeIconColor(createSubjectMock({ state: 'merged' })),
    ).toMatchSnapshot();
    expect(
      getNotificationTypeIconColor(createSubjectMock({ state: 'not_planned' })),
    ).toMatchSnapshot();
    expect(
      getNotificationTypeIconColor(createSubjectMock({ state: 'open' })),
    ).toMatchSnapshot();
    expect(
      getNotificationTypeIconColor(createSubjectMock({ state: 'reopened' })),
    ).toMatchSnapshot();
    expect(
      getNotificationTypeIconColor(createSubjectMock({ state: 'RESOLVED' })),
    ).toMatchSnapshot();
    expect(
      getNotificationTypeIconColor(
        createSubjectMock({
          state: 'something_else_unknown' as StateType,
        }),
      ),
    ).toMatchSnapshot();
  });
});

function createSubjectMock(mocks: {
  title?: string;
  type?: SubjectType;
  state?: StateType;
}): Subject {
  return {
    title: mocks.title ?? 'Mock Subject',
    type: mocks.type ?? ('Unknown' as SubjectType),
    state: mocks.state ?? ('Unknown' as StateType),
    url: null,
    latest_comment_url: null,
  };
}
