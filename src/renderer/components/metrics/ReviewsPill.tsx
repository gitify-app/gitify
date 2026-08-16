import type { FC } from 'react';

import { CommentIcon } from '@primer/octicons-react';

import { type GitifyPullRequestReviewer, IconColor } from '../../types';

import { getPullRequestReviewIcon, type PullRequestReviewGroup } from '../../utils/ui/icons';
import { MetricPill } from './MetricPill';

export interface ReviewsPillProps {
  reviewers: GitifyPullRequestReviewer[];
}

export const ReviewsPill: FC<ReviewsPillProps> = ({ reviewers }) => {
  if (!reviewers.length) {
    return null;
  }

  const reviewGroups = getReviewGroups(reviewers);
  const reviewersWithThreads = reviewers.filter((reviewer) => reviewer.threads.total > 0);
  const threadTotal = reviewersWithThreads.reduce(
    (total, reviewer) => total + reviewer.threads.total,
    0,
  );
  const resolvedThreadTotal = reviewersWithThreads.reduce(
    (total, reviewer) => total + reviewer.threads.resolved,
    0,
  );
  const unresolvedThreadTotal = threadTotal - resolvedThreadTotal;

  return (
    <>
      {reviewGroups.map((review) => {
        if (review.state === 'COMMENTED') {
          return null;
        }

        const icon = getPullRequestReviewIcon(review);

        if (!icon) {
          return null;
        }

        return (
          <MetricPill
            color={icon.color}
            contents={icon.description}
            icon={icon.type}
            key={review.state}
            metric={review.users.length}
          />
        );
      })}

      {threadTotal ? (
        <MetricPill
          color={unresolvedThreadTotal ? IconColor.YELLOW : IconColor.GREEN}
          contents={formatReviewThreadDescription(reviewersWithThreads)}
          icon={CommentIcon}
          metric={`${resolvedThreadTotal}/${threadTotal}`}
        />
      ) : null}
    </>
  );
};

function getReviewGroups(reviewers: GitifyPullRequestReviewer[]): PullRequestReviewGroup[] {
  const groups = new Map<NonNullable<GitifyPullRequestReviewer['state']>, string[]>();

  for (const reviewer of reviewers) {
    if (reviewer.state) {
      groups.set(reviewer.state, [...(groups.get(reviewer.state) ?? []), reviewer.user]);
    }
  }

  return Array.from(groups, ([state, users]) => ({ state, users })).sort((a, b) =>
    a.state.localeCompare(b.state),
  );
}

function formatReviewThreadDescription(reviewers: GitifyPullRequestReviewer[]): string {
  return reviewers
    .toSorted((a, b) => a.user.localeCompare(b.user))
    .map(({ user, threads }) => `${user}: ${threads.resolved}/${threads.total} resolved`)
    .join(' · ');
}
