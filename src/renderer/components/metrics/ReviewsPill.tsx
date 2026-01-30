import type { FC } from 'react';

import type { GitifyPullRequestReview } from '../../types';

import { getPullRequestReviewIcon } from '../../utils/icons';
import { MetricPill } from './MetricPill';

export interface ReviewsPillProps {
  reviews: GitifyPullRequestReview[];
}

export const ReviewsPill: FC<ReviewsPillProps> = ({ reviews }) => {
  if (!reviews?.length) {
    return null;
  }

  return (
    <>
      {reviews.map((review) => {
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
    </>
  );
};
