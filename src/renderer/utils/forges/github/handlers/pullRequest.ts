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
  type GitifyPullRequestReviewer,
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

    const reviewThreads = await getCompleteReviewThreads(notification, pr.reviewThreads);
    const reviewers = getPullRequestReviewers(
      (pr.reviews?.nodes?.filter(Boolean) ?? []) as PullRequestReviewFieldsFragment[],
      reviewThreads,
    );

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
      reviewers,
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

export function getPullRequestReviewers(
  reviews: PullRequestReviewFieldsFragment[],
  threadConnections?: PullRequestReviewThreadConnectionFieldsFragment[],
): GitifyPullRequestReviewer[] {
  const reviewers = new Map<string, GitifyPullRequestReviewer>();

  for (const review of reviews.toReversed()) {
    const user = review.author?.login;
    if (user && !reviewers.has(user)) {
      reviewers.set(user, {
        user,
        state: review.state,
        threads: { resolved: 0, total: 0 },
      });
    }
  }

  for (const thread of threadConnections?.flatMap((connection) => connection.nodes) ?? []) {
    if (!thread) {
      continue;
    }

    const user = thread.comments.nodes?.[0]?.author?.login ?? 'Unknown reviewer';
    const reviewer = reviewers.get(user) ?? {
      user,
      threads: { resolved: 0, total: 0 },
    };
    reviewer.threads.total += 1;
    reviewer.threads.resolved += Number(thread.isResolved);
    reviewers.set(user, reviewer);
  }

  return Array.from(reviewers.values()).sort((a, b) => a.user.localeCompare(b.user));
}

async function getCompleteReviewThreads(
  notification: GitifyNotification,
  initialConnection: PullRequestReviewThreadConnectionFieldsFragment,
): Promise<PullRequestReviewThreadConnectionFieldsFragment[] | undefined> {
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
      'getCompleteReviewThreads',
      'Failed to fetch complete pull request review threads',
      toError(error),
      notification,
    );
    return undefined;
  }

  return connections;
}
