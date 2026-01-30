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
import type {
  PullRequestDetailsFragment,
  PullRequestReviewFieldsFragment,
} from '../../api/graphql/generated/graphql';
import { formatGitHubNumber } from '../formatters';
import { DefaultHandler, defaultHandler } from './default';
import { getNotificationAuthor } from './utils';

class PullRequestHandler extends DefaultHandler {
  readonly type = 'PullRequest' as const;

  readonly supportsMergedQueryEnrichment = true;

  async enrich(
    notification: GitifyNotification,
    settings: SettingsState,
    fetchedData?: PullRequestDetailsFragment,
  ): Promise<Partial<GitifySubject>> {
    const pr =
      fetchedData ??
      (await fetchPullByNumber(notification, settings)).repository?.pullRequest;

    let prState: GitifyPullRequestState = pr.state;
    if (pr.isDraft) {
      prState = 'DRAFT';
    } else if (pr.isInMergeQueue) {
      prState = 'MERGE_QUEUE';
    }

    const prComment = pr.comments?.nodes[0];

    const prUser = getNotificationAuthor([prComment?.author, pr.author]);

    const reviews = getLatestReviewForReviewers(pr?.reviews.nodes);

    const prReactionCount =
      prComment?.reactions?.totalCount ?? pr?.reactions?.totalCount;
    const prReactionGroup = prComment?.reactionGroups ?? pr?.reactionGroups;

    return {
      number: pr.number,
      state: prState,
      user: prUser,
      reviews: reviews,
      commentCount: pr.comments.totalCount,
      labels: pr?.labels?.nodes.map((label) => label.name) ?? [],
      linkedIssues: pr.closingIssuesReferences?.nodes.map((issue) =>
        formatGitHubNumber(issue.number),
      ),
      milestone: pr.milestone,
      htmlUrl: prComment?.url ?? pr.url,
      reactionsCount: prReactionCount,
      reactionGroups: prReactionGroup,
    };
  }

  iconType(notification: GitifyNotification): FC<OcticonProps> {
    switch (notification.subject.state as GitifyPullRequestState) {
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

  iconColor(notification: GitifyNotification): IconColor {
    switch (notification.subject.state as GitifyPullRequestState) {
      case 'OPEN':
        return IconColor.GREEN;
      case 'CLOSED':
        return IconColor.RED;
      case 'MERGE_QUEUE':
        return IconColor.YELLOW;
      case 'MERGED':
        return IconColor.PURPLE;
      default:
        return defaultHandler.iconColor(notification);
    }
  }

  defaultUrl(notification: GitifyNotification): Link {
    const url = new URL(defaultHandler.defaultUrl(notification));
    url.pathname += '/pulls';
    return url.href as Link;
  }
}

export const pullRequestHandler = new PullRequestHandler();

export function getLatestReviewForReviewers(
  reviews: PullRequestReviewFieldsFragment[],
): GitifyPullRequestReview[] {
  if (!reviews.length) {
    return null;
  }

  // Find the most recent review for each reviewer
  const latestReviews: PullRequestReviewFieldsFragment[] = [];
  const sortedReviews = reviews.toReversed();
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
