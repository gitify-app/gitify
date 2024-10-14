import { CheckIcon, CommentIcon, FileDiffIcon } from '@primer/octicons-react';
import { IconColor } from '../types';
import type {
  GitifyPullRequestReview,
  StateType,
  Subject,
  SubjectType,
} from '../typesGitHub';
import {
  getAuthMethodIcon,
  getNotificationTypeIcon,
  getNotificationTypeIconColor,
  getPlatformIcon,
  getPullRequestReviewIcon,
} from './icons';

describe('renderer/utils/icons.ts', () => {
  describe('getNotificationTypeIcon - should get the notification type icon', () => {
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
          type: 'RepositoryDependabotAlertsThread',
        }),
      ).displayName,
    ).toBe('AlertIcon');

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
        getNotificationTypeIconColor(
          createSubjectMock({ state: 'not_planned' }),
        ),
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

  describe('getPullRequestReviewIcon', () => {
    let mockReviewSingleReviewer: GitifyPullRequestReview;
    let mockReviewMultipleReviewer: GitifyPullRequestReview;

    beforeEach(() => {
      mockReviewSingleReviewer = {
        state: 'APPROVED',
        users: ['user1'],
      };
      mockReviewMultipleReviewer = {
        state: 'APPROVED',
        users: ['user1', 'user2'],
      };
    });

    it('approved', () => {
      mockReviewSingleReviewer.state = 'APPROVED';
      mockReviewMultipleReviewer.state = 'APPROVED';

      expect(getPullRequestReviewIcon(mockReviewSingleReviewer)).toEqual({
        type: CheckIcon,
        color: IconColor.GREEN,
        description: 'user1 approved these changes',
      });

      expect(getPullRequestReviewIcon(mockReviewMultipleReviewer)).toEqual({
        type: CheckIcon,
        color: IconColor.GREEN,
        description: 'user1, user2 approved these changes',
      });
    });

    it('changes requested', () => {
      mockReviewSingleReviewer.state = 'CHANGES_REQUESTED';
      mockReviewMultipleReviewer.state = 'CHANGES_REQUESTED';

      expect(getPullRequestReviewIcon(mockReviewSingleReviewer)).toEqual({
        type: FileDiffIcon,
        color: IconColor.RED,
        description: 'user1 requested changes',
      });

      expect(getPullRequestReviewIcon(mockReviewMultipleReviewer)).toEqual({
        type: FileDiffIcon,
        color: IconColor.RED,
        description: 'user1, user2 requested changes',
      });
    });

    it('commented', () => {
      mockReviewSingleReviewer.state = 'COMMENTED';
      mockReviewMultipleReviewer.state = 'COMMENTED';

      expect(getPullRequestReviewIcon(mockReviewSingleReviewer)).toEqual({
        type: CommentIcon,
        color: IconColor.YELLOW,
        description: 'user1 left review comments',
      });

      expect(getPullRequestReviewIcon(mockReviewMultipleReviewer)).toEqual({
        type: CommentIcon,
        color: IconColor.YELLOW,
        description: 'user1, user2 left review comments',
      });
    });

    it('dismissed', () => {
      mockReviewSingleReviewer.state = 'DISMISSED';
      mockReviewMultipleReviewer.state = 'DISMISSED';

      expect(getPullRequestReviewIcon(mockReviewSingleReviewer)).toEqual({
        type: CommentIcon,
        color: IconColor.GRAY,
        description: 'user1 review has been dismissed',
      });

      expect(getPullRequestReviewIcon(mockReviewMultipleReviewer)).toEqual({
        type: CommentIcon,
        color: IconColor.GRAY,
        description: 'user1, user2 reviews have been dismissed',
      });
    });

    it('pending', () => {
      mockReviewSingleReviewer.state = 'PENDING';
      mockReviewMultipleReviewer.state = 'PENDING';

      expect(getPullRequestReviewIcon(mockReviewSingleReviewer)).toBeNull();

      expect(getPullRequestReviewIcon(mockReviewMultipleReviewer)).toBeNull();
    });
  });

  describe('getAuthMethodIcon', () => {
    expect(getAuthMethodIcon('GitHub App')).toMatchSnapshot();

    expect(getAuthMethodIcon('OAuth App')).toMatchSnapshot();

    expect(getAuthMethodIcon('Personal Access Token')).toMatchSnapshot();
  });

  describe('getPlatformIcon', () => {
    expect(getPlatformIcon('GitHub Cloud')).toMatchSnapshot();

    expect(getPlatformIcon('GitHub Enterprise Server')).toMatchSnapshot();
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
