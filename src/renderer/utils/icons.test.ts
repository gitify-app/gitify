import {
  CheckIcon,
  CommentIcon,
  FeedPersonIcon,
  FileDiffIcon,
  MarkGithubIcon,
  OrganizationIcon,
} from '@primer/octicons-react';

import { type GitifyPullRequestReview, IconColor } from '../types';
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

  describe('getDefaultUserIcon', () => {
    expect(getDefaultUserIcon('Bot')).toBe(MarkGithubIcon);
    expect(getDefaultUserIcon('EnterpriseUserAccount')).toBe(FeedPersonIcon);
    expect(getDefaultUserIcon('Mannequin')).toBe(MarkGithubIcon);
    expect(getDefaultUserIcon('Organization')).toBe(OrganizationIcon);
    expect(getDefaultUserIcon('User')).toBe(FeedPersonIcon);
  });
});
