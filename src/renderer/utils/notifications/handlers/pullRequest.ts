import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import {
  GitMergeIcon,
  GitPullRequestClosedIcon,
  GitPullRequestDraftIcon,
  GitPullRequestIcon,
} from '@primer/octicons-react';

import type {
  GitifyPullRequestReview,
  GitifyPullRequestState,
  GitifySubject,
  Link,
  SettingsState,
} from '../../../types';
import type { Notification, Subject } from '../../../typesGitHub';
import { fetchPullByNumber } from '../../api/client';
import type { FetchPullByNumberQuery } from '../../api/graphql/generated/graphql';
import { DefaultHandler } from './default';
import { getNotificationAuthor } from './utils';

class PullRequestHandler extends DefaultHandler {
  readonly type = 'PullRequest' as const;

  async enrich(
    notification: Notification,
    _settings: SettingsState,
  ): Promise<GitifySubject> {
    const response = await fetchPullByNumber(notification);
    const pr = response.data.repository.pullRequest;

    let prState: GitifyPullRequestState = pr.state;
    if (pr.isDraft) {
      prState = 'DRAFT';
    }

    const prComment = pr.comments?.nodes[0];

    const prUser = getNotificationAuthor([prComment?.author, pr.author]);

    const reviews = pr.reviews
      ? getLatestReviewForReviewers(pr.reviews.nodes)
      : null;

    return {
      number: pr.number,
      state: prState,
      user: prUser,
      reviews: reviews,
      comments: pr.comments.totalCount,
      labels: pr.labels?.nodes.map((label) => label.name) ?? [],
      linkedIssues:
        pr.closingIssuesReferences?.nodes.map((issue) => `#${issue.number}`) ??
        [],
      milestone: null, //pr.milestone,
      htmlUrl: prComment?.url ?? pr.url,
    };
  }

  iconType(subject: Subject): FC<OcticonProps> | null {
    switch (subject.state as GitifyPullRequestState) {
      case 'DRAFT':
        return GitPullRequestDraftIcon;
      case 'CLOSED':
        return GitPullRequestClosedIcon;
      case 'MERGED':
        return GitMergeIcon;
      default:
        return GitPullRequestIcon;
    }
  }

  defaultUrl(notification: Notification): Link {
    const url = new URL(notification.repository.html_url);
    url.pathname += '/pulls';
    return url.href as Link;
  }
}

export const pullRequestHandler = new PullRequestHandler();

export function getLatestReviewForReviewers(
  reviews: FetchPullByNumberQuery['repository']['pullRequest']['reviews']['nodes'],
): GitifyPullRequestReview[] {
  if (!reviews.length) {
    return null;
  }

  // Find the most recent review for each reviewer
  const latestReviews = [];
  const sortedReviews = reviews.reverse();
  for (const prReview of sortedReviews) {
    const reviewerFound = latestReviews.find(
      (review) => review.author.login === prReview.author.login,
      prReview.state,
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
      reviewerFound.users.push(prReview.author.login);
    } else {
      reviewers.push({
        state: prReview.state,
        users: [prReview.author.login],
      });
    }
  }

  // Sort reviews by state for consistent order when rendering
  return reviewers.sort((a, b) => {
    return a.state.localeCompare(b.state);
  });
}
