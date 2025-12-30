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
import {
  type PullRequestDetailsFragment,
  PullRequestDetailsFragmentDoc,
  PullRequestMergeQueryFragmentDoc,
  type PullRequestReviewFieldsFragment,
} from '../../api/graphql/generated/graphql';
import { DefaultHandler, defaultHandler } from './default';
import type { GraphQLMergedQueryConfig } from './types';
import { getNotificationAuthor } from './utils';

class PullRequestHandler extends DefaultHandler {
  readonly type = 'PullRequest' as const;

  mergeQueryConfig() {
    return {
      queryFragment: PullRequestMergeQueryFragmentDoc,
      responseFragment: PullRequestDetailsFragmentDoc,
      extras: [
        { name: 'firstLabels', type: 'Int', defaultValue: 100 },
        { name: 'lastComments', type: 'Int', defaultValue: 100 },
        { name: 'lastReviews', type: 'Int', defaultValue: 100 },
        { name: 'firstClosingIssues', type: 'Int', defaultValue: 100 },
      ],
    } as GraphQLMergedQueryConfig;
  }

  async enrich(
    notification: GitifyNotification,
    _settings: SettingsState,
    fetchedData?: PullRequestDetailsFragment,
  ): Promise<Partial<GitifySubject>> {
    const pr =
      fetchedData ??
      (await fetchPullByNumber(notification)).data.nodeINDEX?.pullRequest;

    let prState: GitifyPullRequestState = pr.state;
    if (pr.isDraft) {
      prState = 'DRAFT';
    } else if (pr.isInMergeQueue) {
      prState = 'MERGE_QUEUE';
    }

    const prComment = pr.comments?.nodes[0];

    const prUser = getNotificationAuthor([prComment?.author, pr.author]);

    const reviews = getLatestReviewForReviewers(pr.reviews.nodes);

    return {
      number: pr.number,
      state: prState,
      user: prUser,
      reviews: reviews,
      comments: pr.comments.totalCount,
      labels: pr.labels?.nodes.map((label) => label.name),
      linkedIssues: pr.closingIssuesReferences?.nodes.map(
        (issue) => `#${issue.number}`,
      ),
      milestone: pr.milestone,
      htmlUrl: prComment?.url ?? pr.url,
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
