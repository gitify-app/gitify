import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import {
  GitMergeIcon,
  GitMergeQueueIcon,
  GitPullRequestClosedIcon,
  GitPullRequestDraftIcon,
  GitPullRequestIcon,
} from '@primer/octicons-react';

import { differenceInMilliseconds } from 'date-fns/differenceInMilliseconds';

import {
  type GitifyNotification,
  type GitifyPullRequestReview,
  type GitifyPullRequestState,
  type GitifySubject,
  IconColor,
  type Link,
  type ReviewRequestType,
} from '../../../../types';

import { formatGitHubNumber } from '../../../notifications/formatters';
import { fetchPullByNumber } from '../client';
import type {
  AuthorFieldsFragment,
  PullRequestDetailsFragment,
  PullRequestReviewFieldsFragment,
} from '../graphql/generated/graphql';
import { DefaultHandler, defaultHandler } from './default';
import { getNotificationAuthor } from './utils';

type PullRequestActivity = {
  author: AuthorFieldsFragment;
  timestamp: string;
  url: Link;
  comment?: NonNullable<NonNullable<PullRequestDetailsFragment['comments']['nodes']>[number]>;
};

class PullRequestHandler extends DefaultHandler {
  override readonly supportsMergedQueryEnrichment = true;

  override async enrich(
    notification: GitifyNotification,
    fetchedData?: PullRequestDetailsFragment,
  ): Promise<Partial<GitifySubject>> {
    const pr = fetchedData ?? (await fetchPullByNumber(notification)).repository?.pullRequest;

    if (!pr) {
      return {};
    }

    let prState: GitifyPullRequestState = pr.state;
    if (pr.isDraft) {
      prState = 'DRAFT';
    } else if (pr.isInMergeQueue) {
      prState = 'MERGE_QUEUE';
    }

    const prComment = pr.comments?.nodes?.[0];
    const activity = getClosestPullRequestActivity(notification.updatedAt, pr);

    const author = getNotificationAuthor([pr.author]);
    const commenter = getNotificationAuthor([prComment?.author]);
    const prUser = getNotificationAuthor([activity?.author]) ?? author;

    const reviews = getLatestReviewForReviewers(
      (pr.reviews?.nodes?.filter(Boolean) ?? []) as PullRequestReviewFieldsFragment[],
    );

    const reviewRequested = getReviewRequestTypes(
      pr.reviewRequests?.nodes?.filter(Boolean) ?? [],
      notification.account?.user?.login,
    );

    const prReactionCount = activity?.comment?.reactions.totalCount ?? pr.reactions.totalCount;
    const prReactionGroup = activity?.comment?.reactionGroups ?? pr.reactionGroups;

    return {
      number: pr.number,
      state: prState,
      user: prUser,
      author: author,
      commenter: commenter,
      reviewRequested,
      reviews: reviews,
      commentCount: pr.comments.totalCount,
      labels:
        pr.labels?.nodes?.filter(Boolean).map((label) => ({
          name: label!.name,
          color: label!.color,
        })) ?? [],
      isStacked: pr.stackEntry ? true : undefined,
      stackPosition: pr.stackEntry?.position,
      stackDepth: pr.stackEntry?.stack?.size,
      linkedIssues: pr.closingIssuesReferences?.nodes
        ?.filter(Boolean)
        .map((issue) => formatGitHubNumber(issue!.number)),
      milestone: pr.milestone ?? undefined,
      htmlUrl: activity?.url ?? pr.url,
      reactionsCount: prReactionCount,
      reactionGroups: prReactionGroup ?? undefined,
    };
  }

  override iconType(notification: GitifyNotification): FC<OcticonProps> {
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

  override iconColor(notification: GitifyNotification): IconColor {
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

  override defaultUrl(notification: GitifyNotification): Link {
    const url = new URL(defaultHandler.defaultUrl(notification));
    url.pathname += '/pulls';
    return url.href as Link;
  }
}

export const pullRequestHandler = new PullRequestHandler();

export function getClosestPullRequestActivity(
  notificationUpdatedAt: string,
  pullRequest: PullRequestDetailsFragment,
): PullRequestActivity | undefined {
  const activities: PullRequestActivity[] = [];

  for (const comment of pullRequest.comments.nodes ?? []) {
    if (!comment) {
      continue;
    }

    if (comment.author && comment.updatedAt && comment.url) {
      activities.push({
        author: comment.author,
        timestamp: comment.updatedAt,
        url: comment.url,
        comment,
      });
    }
  }

  for (const review of pullRequest.reviews?.nodes ?? []) {
    if (!review) {
      continue;
    }

    if (review.author && review.submittedAt && review.url) {
      activities.push({
        author: review.author,
        timestamp: review.submittedAt,
        url: review.url,
      });
    }
  }

  return activities.reduce<PullRequestActivity | undefined>((closest, activity) => {
    const distance = Math.abs(differenceInMilliseconds(activity.timestamp, notificationUpdatedAt));
    if (Number.isNaN(distance)) {
      return closest;
    }

    if (!closest) {
      return activity;
    }

    const closestDistance = Math.abs(
      differenceInMilliseconds(closest.timestamp, notificationUpdatedAt),
    );
    return distance < closestDistance ? activity : closest;
  }, undefined);
}

export function getReviewRequestTypes(
  nodes: NonNullable<NonNullable<PullRequestDetailsFragment['reviewRequests']>['nodes']>,
  currentUserLogin: string | undefined,
): ReviewRequestType[] {
  if (!nodes.length || !currentUserLogin) {
    return [];
  }

  const types = new Set<ReviewRequestType>();

  for (const node of nodes) {
    if (!node?.requestedReviewer) {
      continue;
    }

    if (
      node.requestedReviewer.__typename === 'User' &&
      node.requestedReviewer.login === currentUserLogin
    ) {
      types.add('direct');
    } else if (node.requestedReviewer.__typename === 'Team') {
      types.add('team');
    }
  }

  return Array.from(types);
}

type ReviewForMetrics = Pick<PullRequestReviewFieldsFragment, 'state'> & {
  author?: { login: string } | null;
};

export function getLatestReviewForReviewers(
  reviews: ReviewForMetrics[],
): GitifyPullRequestReview[] {
  if (!reviews.length) {
    return [];
  }

  // Find the most recent review for each reviewer
  const latestReviews: ReviewForMetrics[] = [];
  const sortedReviews = reviews.toReversed();
  for (const prReview of sortedReviews) {
    const reviewerFound = latestReviews.find(
      (review) => review.author?.login === prReview.author?.login,
    );

    if (!reviewerFound) {
      latestReviews.push(prReview);
    }
  }

  // Group by the review state
  const reviewers: GitifyPullRequestReview[] = [];
  for (const prReview of latestReviews) {
    const reviewerFound = reviewers.find((review) => review.state === prReview.state);

    if (reviewerFound) {
      reviewerFound.users.push(prReview.author?.login ?? '');
    } else {
      reviewers.push({
        state: prReview.state,
        users: [prReview.author?.login ?? ''],
      });
    }
  }

  // Sort reviews by state for consistent order when rendering
  return reviewers.sort((a, b) => {
    return a.state.localeCompare(b.state);
  });
}
