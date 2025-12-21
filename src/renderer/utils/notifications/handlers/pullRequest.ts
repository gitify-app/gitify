import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import {
  GitMergeIcon,
  GitPullRequestClosedIcon,
  GitPullRequestDraftIcon,
  GitPullRequestIcon,
} from '@primer/octicons-react';

import type { SettingsState } from '../../../types';
import type {
  GitifyPullRequestReview,
  GitifySubject,
  Notification,
  PullRequestReview,
  PullRequestStateType,
  Subject,
} from '../../../typesGitHub';
import { fetchPullByNumber } from '../../api/client';
import type { PullRequestState } from '../../api/graphql/generated/graphql';
import { isStateFilteredOut, isUserFilteredOut } from '../filters/filter';
import { DefaultHandler } from './default';
import { getSubjectAuthor } from './utils';

class PullRequestHandler extends DefaultHandler {
  readonly type = 'PullRequest' as const;

  async enrich(
    notification: Notification,
    settings: SettingsState,
  ): Promise<GitifySubject> {
    const response = await fetchPullByNumber(notification);
    const pr = response.data.repository.pullRequest;

    let prState: PullRequestStateType | PullRequestState = pr.state;
    if (pr.isDraft) {
      prState = 'draft';
    }

    // Return early if this notification would be hidden by state filters
    if (isStateFilteredOut(prState, settings)) {
      return null;
    }

    const prCommentUser = pr.comments.nodes[0]?.author;

    const prUser = getSubjectAuthor([prCommentUser, pr.author]);

    // Return early if this notification would be hidden by user filters
    if (isUserFilteredOut(prUser, settings)) {
      return null;
    }

    const reviews = null; // await getLatestReviewForReviewers(notification);

    return {
      number: pr.number,
      state: prState,
      user: prUser,
      reviews: reviews,
      comments: pr.comments.totalCount,
      labels: pr.labels.nodes?.map((label) => label.name) ?? [],
      linkedIssues: pr.closingIssuesReferences.nodes.map(
        (issue) => `#${issue.number}`,
      ),
      milestone: null, //pr.milestone,
      htmlUrl: pr.comments.nodes[0]?.url ?? pr.url,
    };
  }

  iconType(subject: Subject): FC<OcticonProps> | null {
    switch (subject.state) {
      case 'draft':
        return GitPullRequestDraftIcon;
      case 'closed':
        return GitPullRequestClosedIcon;
      case 'merged':
        return GitMergeIcon;
      default:
        return GitPullRequestIcon;
    }
  }
}

export const pullRequestHandler = new PullRequestHandler();

export async function getLatestReviewForReviewers(
  notification: Notification,
): Promise<GitifyPullRequestReview[]> | null {
  if (notification.subject.type !== 'PullRequest') {
    return null;
  }

  const prReviews = null;

  if (!prReviews.data.length) {
    return null;
  }

  // Find the most recent review for each reviewer
  const latestReviews: PullRequestReview[] = [];
  const sortedReviews = prReviews.data.slice().reverse();
  for (const prReview of sortedReviews) {
    const reviewerFound = latestReviews.find(
      (review) => review.user.login === prReview.user.login,
    );

    if (!reviewerFound) {
      latestReviews.push(prReview);
    }
  }

  // Group by the review state
  const reviewers: GitifyPullRequestReview[] = [];
  for (const prReview of latestReviews) {
    const reviewerFound = reviewers.find(
      (review) => review.state === prReview.state,
    );

    if (reviewerFound) {
      reviewerFound.users.push(prReview.user.login);
    } else {
      reviewers.push({
        state: prReview.state,
        users: [prReview.user.login],
      });
    }
  }

  // Sort reviews by state for consistent order when rendering
  return reviewers.sort((a, b) => {
    return a.state.localeCompare(b.state);
  });
}
