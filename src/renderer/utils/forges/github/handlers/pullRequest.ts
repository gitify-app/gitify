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
  type GitifyPullRequestReviewThreads,
  type GitifyPullRequestState,
  type GitifySubject,
  IconColor,
  type Link,
  type ReviewRequestType,
} from '../../../../types';

import { rendererLogError, toError } from '../../../core/logger';
import { formatGitHubNumber } from '../../../notifications/formatters';
import { fetchPullByNumber, fetchPullRequestReviewThreads } from '../client';
import type {
  PullRequestDetailsFragment,
  PullRequestReviewFieldsFragment,
  PullRequestReviewThreadConnectionFieldsFragment,
} from '../graphql/generated/graphql';
import { DefaultHandler, defaultHandler } from './default';
import { getNotificationAuthor } from './utils';

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

    const author = getNotificationAuthor([pr.author]);
    const commenter = getNotificationAuthor([prComment?.author]);
    const prUser = commenter ?? author;

    const reviews = getLatestReviewForReviewers(
      (pr.reviews?.nodes?.filter(Boolean) ?? []) as PullRequestReviewFieldsFragment[],
    );
    const reviewThreads = await getCompleteReviewThreadSummary(notification, pr.reviewThreads);

    const reviewRequested = getReviewRequestTypes(
      pr.reviewRequests?.nodes?.filter(Boolean) ?? [],
      notification.account?.user?.login,
    );

    const prReactionCount = prComment?.reactions.totalCount ?? pr.reactions.totalCount;
    const prReactionGroup = prComment?.reactionGroups ?? pr.reactionGroups;

    return {
      number: pr.number,
      state: prState,
      user: prUser,
      author: author,
      commenter: commenter,
      reviewRequested,
      reviews: reviews,
      ...(reviewThreads ? { reviewThreads } : {}),
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
      htmlUrl: prComment?.url ?? pr.url,
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

export function getLatestReviewForReviewers(
  reviews: PullRequestReviewFieldsFragment[],
): GitifyPullRequestReview[] {
  if (!reviews.length) {
    return [];
  }

  // Find the most recent review for each reviewer
  const latestReviews: PullRequestReviewFieldsFragment[] = [];
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

export function getReviewThreadSummary(
  connections: PullRequestReviewThreadConnectionFieldsFragment[],
): GitifyPullRequestReviewThreads | undefined {
  const threads = connections.flatMap(
    (connection) => connection.nodes?.filter((thread) => thread !== null) ?? [],
  );
  if (!threads.length) {
    return undefined;
  }

  const starters = new Map<string, { resolved: number; total: number }>();
  let resolvedCount = 0;

  for (const thread of threads) {
    resolvedCount += Number(thread.isResolved);

    const starter = thread.comments.nodes?.[0]?.author?.login ?? 'Unknown reviewer';
    const counts = starters.get(starter) ?? { resolved: 0, total: 0 };
    counts.total += 1;
    counts.resolved += Number(thread.isResolved);
    starters.set(starter, counts);
  }

  return {
    total: threads.length,
    unresolved: threads.length - resolvedCount,
    starters: Array.from(starters, ([user, counts]) => ({ user, ...counts })).sort((a, b) =>
      a.user.localeCompare(b.user),
    ),
  };
}

async function getCompleteReviewThreadSummary(
  notification: GitifyNotification,
  initialConnection: PullRequestReviewThreadConnectionFieldsFragment,
): Promise<GitifyPullRequestReviewThreads | undefined> {
  const connections = [initialConnection];
  let pageInfo = initialConnection.pageInfo;

  try {
    while (pageInfo.hasNextPage) {
      if (!pageInfo.endCursor) {
        throw new Error('Review thread page has no end cursor');
      }

      const response = await fetchPullRequestReviewThreads(notification, pageInfo.endCursor);
      const connection = response.repository?.pullRequest?.reviewThreads;
      if (!connection) {
        throw new Error('Review thread page is unavailable');
      }

      connections.push(connection);
      pageInfo = connection.pageInfo;
    }
  } catch (error) {
    rendererLogError(
      'getCompleteReviewThreadSummary',
      'Failed to fetch complete pull request review threads',
      toError(error),
      notification,
    );
    return undefined;
  }

  return getReviewThreadSummary(connections);
}
