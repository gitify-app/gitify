import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import {
  GitMergeIcon,
  GitPullRequestClosedIcon,
  GitPullRequestDraftIcon,
  GitPullRequestIcon,
} from '@primer/octicons-react';

import type { Link, SettingsState } from '../../../types';
import type {
  GitifyPullRequestReview,
  GitifySubject,
  Notification,
  PullRequest,
  PullRequestReview,
  PullRequestStateType,
  User,
} from '../../../typesGitHub';
import {
  getIssueOrPullRequestComment,
  getPullRequest,
  getPullRequestReviews,
} from '../../api/client';
import { isStateFilteredOut, isUserFilteredOut } from '../filters/filter';
import { DefaultHandler } from './default';
import type { NotificationTypeHandler } from './types';
import { getSubjectUser } from './utils';

class PullRequestHandler extends DefaultHandler {
  readonly type = 'PullRequest' as const;

  async enrich(settings: SettingsState): Promise<GitifySubject> {
    const pr = (
      await getPullRequest(
        this.notification.subject.url,
        this.notification.account.token,
      )
    ).data;

    let prState: PullRequestStateType = pr.state;
    if (pr.merged) {
      prState = 'merged';
    } else if (pr.draft) {
      prState = 'draft';
    }

    // Return early if this notification would be hidden by state filters
    if (isStateFilteredOut(prState, settings)) {
      return null;
    }

    let prCommentUser: User;
    if (
      this.notification.subject.latest_comment_url &&
      this.notification.subject.latest_comment_url !==
        this.notification.subject.url
    ) {
      const prComment = (
        await getIssueOrPullRequestComment(
          this.notification.subject.latest_comment_url,
          this.notification.account.token,
        )
      ).data;
      prCommentUser = prComment.user;
    }

    const prUser = getSubjectUser([prCommentUser, pr.user]);

    // Return early if this notification would be hidden by user filters
    if (isUserFilteredOut(prUser, settings)) {
      return null;
    }

    const reviews = await getLatestReviewForReviewers(this.notification);
    const linkedIssues = parseLinkedIssuesFromPr(pr);

    return {
      number: pr.number,
      state: prState,
      user: prUser,
      reviews: reviews,
      comments: pr.comments,
      labels: pr.labels?.map((label) => label.name) ?? [],
      linkedIssues: linkedIssues,
      milestone: pr.milestone,
    };
  }

  iconType(): FC<OcticonProps> | null {
    switch (this.notification.subject.state) {
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

export function createPullRequestHandler(
  notification: Notification,
): NotificationTypeHandler {
  return new PullRequestHandler(notification);
}

export async function getLatestReviewForReviewers(
  notification: Notification,
): Promise<GitifyPullRequestReview[]> | null {
  if (notification.subject.type !== 'PullRequest') {
    return null;
  }

  const prReviews = await getPullRequestReviews(
    `${notification.subject.url}/reviews` as Link,
    notification.account.token,
  );

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

export function parseLinkedIssuesFromPr(pr: PullRequest): string[] {
  const linkedIssues: string[] = [];

  if (!pr.body || pr.user.type !== 'User') {
    return linkedIssues;
  }

  const regexPattern = /\s?#(\d+)\s?/gi;
  const matches = pr.body.matchAll(regexPattern);

  for (const match of matches) {
    if (match[0]) {
      linkedIssues.push(match[0].trim());
    }
  }

  return linkedIssues;
}
