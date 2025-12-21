import {
  CheckIcon,
  CommentIcon,
  FeedPersonIcon,
  FileDiffIcon,
  MarkGithubIcon,
  OrganizationIcon,
} from '@primer/octicons-react';

import { IconColor } from '../types';
import type { GitifyPullRequestReview } from '../typesGitHub';
import { PullRequestReviewState } from './api/graphql/generated/graphql';
import {
  getAuthMethodIcon,
  getDefaultUserIcon,
  getPlatformIcon,
  getPullRequestReviewIcon,
} from './icons';

describe('renderer/utils/icons.ts', () => {
  describe('getPullRequestReviewIcon', () => {
    let mockReviewSingleReviewer: GitifyPullRequestReview;
    let mockReviewMultipleReviewer: GitifyPullRequestReview;

    beforeEach(() => {
      mockReviewSingleReviewer = {
        state: PullRequestReviewState.Approved,
        users: ['user1'],
      };
      mockReviewMultipleReviewer = {
        state: PullRequestReviewState.Approved,
        users: ['user1', 'user2'],
      };
    });

    it('approved', () => {
      mockReviewSingleReviewer.state = PullRequestReviewState.Approved;
      mockReviewMultipleReviewer.state = PullRequestReviewState.Approved;

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
      mockReviewSingleReviewer.state = PullRequestReviewState.ChangesRequested;
      mockReviewMultipleReviewer.state =
        PullRequestReviewState.ChangesRequested;

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
      mockReviewSingleReviewer.state = PullRequestReviewState.Commented;
      mockReviewMultipleReviewer.state = PullRequestReviewState.Commented;

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
      mockReviewSingleReviewer.state = PullRequestReviewState.Dismissed;
      mockReviewMultipleReviewer.state = PullRequestReviewState.Dismissed;

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
      mockReviewSingleReviewer.state = PullRequestReviewState.Pending;
      mockReviewMultipleReviewer.state = PullRequestReviewState.Pending;

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

  describe('getDefaultUserIcon', () => {
    expect(getDefaultUserIcon('Bot')).toBe(MarkGithubIcon);
    expect(getDefaultUserIcon('EnterpriseUserAccount')).toBe(FeedPersonIcon);
    expect(getDefaultUserIcon('Mannequin')).toBe(MarkGithubIcon);
    expect(getDefaultUserIcon('Organization')).toBe(OrganizationIcon);
    expect(getDefaultUserIcon('User')).toBe(FeedPersonIcon);
  });
});
