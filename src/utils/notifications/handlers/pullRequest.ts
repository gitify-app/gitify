import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import {
  GitMergeIcon,
  GitMergeQueueIcon,
  GitPullRequestClosedIcon,
  GitPullRequestDraftIcon,
  GitPullRequestIcon,
} from '@primer/octicons-react';

import {
  type GitifyNotification,
  type GitifyPullRequestReview,
  type GitifyPullRequestState,
  type GitifySubject,
  IconColor,
  type Link,
  type SettingsState,
} from '../../../types';
import { fetchPullByNumber } from '../../api/client';
import type { PullRequestReviewFieldsFragment } from '../../api/graphql/generated/graphql';
import { DefaultHandler, defaultHandler } from './default';
import { getNotificationAuthor } from './utils';

class PullRequestHandler extends DefaultHandler {
  readonly type = 'PullRequest' as const;

  async enrich(
    notification: GitifyNotification,
    _settings: SettingsState,
  ): Promise<Partial<GitifySubject> | null> {
    const response = await fetchPullByNumber(notification);
    const pr = response.data?.repository?.pullRequest;

    if (!pr) {
      return null;
    }

    let prState: GitifyPullRequestState = pr.state;
    if (pr.isDraft) {
      prState = 'DRAFT';
    } else if (pr.isInMergeQueue) {
      prState = 'MERGE_QUEUE';
    }

    const prComment = pr.comments?.nodes?.[0];

    const prUser = getNotificationAuthor([
      prComment?.author ?? undefined,
      pr.author ?? undefined,
    ]);

    const reviewNodes = pr.reviews?.nodes?.filter(
      (r): r is NonNullable<typeof r> => r != null,
    );
    const reviews = reviewNodes
      ? getLatestReviewForReviewers(reviewNodes)
      : undefined;

    return {
      number: pr.number,
      state: prState,
      user: prUser,
      reviews: reviews,
      comments: pr.comments?.totalCount ?? 0,
      labels: pr.labels?.nodes
        ?.filter((label): label is NonNullable<typeof label> => label != null)
        .map((label) => label.name),
      linkedIssues: pr.closingIssuesReferences?.nodes
        ?.filter((issue): issue is NonNullable<typeof issue> => issue != null)
        .map((issue) => `#${issue.number}`),
      milestone: pr.milestone ?? undefined,
      htmlUrl: (prComment?.url ?? pr.url) as Link,
    };
  }

  iconType(subject: GitifySubject): FC<OcticonProps> | null {
    switch (subject.state as GitifyPullRequestState) {
      case 'DRAFT':
        return GitPullRequestDraftIcon;
      case 'CLOSED':
        return GitPullRequestClosedIcon;
      case 'MERGE_QUEUE':
        return GitMergeQueueIcon;
      case 'MERGED':
        return GitMergeIcon;
      default:
        return GitPullRequestIcon;
    }
  }

  iconColor(subject: GitifySubject): IconColor {
    switch (subject.state as GitifyPullRequestState) {
      case 'OPEN':
        return IconColor.GREEN;
      case 'CLOSED':
        return IconColor.RED;
      case 'MERGE_QUEUE':
        return IconColor.YELLOW;
      case 'MERGED':
        return IconColor.PURPLE;
      default:
        return defaultHandler.iconColor(subject);
    }
  }

  defaultUrl(notification: GitifyNotification): Link {
    const url = new URL(notification.repository.htmlUrl);
    url.pathname += '/pulls';
    return url.href as Link;
  }
}

export const pullRequestHandler = new PullRequestHandler();

type ReviewWithAuthor = PullRequestReviewFieldsFragment & {
  author: NonNullable<PullRequestReviewFieldsFragment['author']>;
};

export function getLatestReviewForReviewers(
  reviews: PullRequestReviewFieldsFragment[],
): GitifyPullRequestReview[] | undefined {
  // Filter reviews that have an author
  const validReviews = reviews.filter(
    (r): r is ReviewWithAuthor => r.author != null,
  );

  if (!validReviews.length) {
    return undefined;
  }

  // Find the most recent review for each reviewer
  const latestReviews: ReviewWithAuthor[] = [];
  const sortedReviews = validReviews.toReversed();
  for (const prReview of sortedReviews) {
    const reviewerFound = latestReviews.find(
      (review) => review.author.login === prReview.author.login,
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
