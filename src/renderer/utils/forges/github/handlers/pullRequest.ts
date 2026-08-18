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
  type Account,
  type GitifyNotification,
  type GitifyPullRequestReviewer,
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
  PullRequestReviewThreadConnectionFieldsFragment,
} from '../graphql/generated/graphql';
import { formatGitHubNotificationUser } from '../users';
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

    const reviewers = getPullRequestReviewers(
      notification.account,
      (pr.reviews?.nodes?.filter(Boolean) ?? []) as PullRequestReviewFieldsFragment[],
      pr.reviewThreads,
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

export function getPullRequestReviewers(
  account: Account,
  reviews: Pick<PullRequestReviewFieldsFragment, 'state' | 'author'>[],
  threadConnection?: PullRequestReviewThreadConnectionFieldsFragment,
): GitifyPullRequestReviewer[] {
  const reviewers = new Map<string, GitifyPullRequestReviewer>();

  for (const review of reviews.toReversed()) {
    const user = review.author?.login;
    if (user && !reviewers.has(user)) {
      const author = getNotificationAuthor([review.author]);
      reviewers.set(user, {
        user: author ? formatGitHubNotificationUser(account, author) : user,
        state: review.state,
        threads: { resolved: 0, total: 0 },
      });
    }
  }

  for (const thread of threadConnection?.nodes ?? []) {
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
