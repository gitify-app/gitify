import type { FC } from 'react';

import { CommentIcon } from '@primer/octicons-react';

import {
  type GitifyPullRequestReview,
  type GitifyPullRequestReviewThreads,
  IconColor,
} from '../../types';

import { getPullRequestReviewIcon } from '../../utils/ui/icons';
import { MetricPill } from './MetricPill';

export interface ReviewsPillProps {
  reviews: GitifyPullRequestReview[];
  reviewThreads?: GitifyPullRequestReviewThreads;
}

export const ReviewsPill: FC<ReviewsPillProps> = ({ reviews, reviewThreads }) => {
  if (!reviews?.length && !reviewThreads) {
    return null;
  }

  const threadDescription = reviewThreads
    ? formatReviewThreadDescription(reviewThreads)
    : undefined;

  return (
    <>
      {reviews.map((review) => {
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

      {reviewThreads ? (
        <MetricPill
          color={reviewThreads.unresolved ? IconColor.YELLOW : IconColor.GREEN}
          contents={threadDescription!}
          icon={CommentIcon}
          metric={reviewThreads.unresolved || reviewThreads.total}
        />
      ) : null}
    </>
  );
};

function formatReviewThreadDescription(threads: GitifyPullRequestReviewThreads): string {
  return threads.starters
    .toSorted((a, b) => a.user.localeCompare(b.user))
    .map(({ user, resolved, total }) => `${user}: ${resolved}/${total} resolved`)
    .join(' · ');
}
