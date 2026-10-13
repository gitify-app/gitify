import type { FC, MouseEvent } from 'react';

import { Stack, Text } from '@primer/react';

import { cn } from 'cn';

import { type GitifyPullRequestReviewer, type Link, Opacity, Size } from '../../types';

import { openExternalLink } from '../../utils/system/comms';
import { AvatarWithFallback } from '../avatars/AvatarWithFallback';

const REVIEW_STATE_LABELS: Record<string, string> = {
  APPROVED: 'Approved',
  CHANGES_REQUESTED: 'Changes requested',
  COMMENTED: 'Commented',
  DISMISSED: 'Dismissed',
  PENDING: 'Pending',
};

export interface ReviewsCardProps {
  reviewers: GitifyPullRequestReviewer[];
}

/**
 * Preview listing a pull request's reviewers, each with their avatar, identity,
 * review state, and review-thread resolution counts, with a click-through to
 * the reviewer's profile.
 */
export const ReviewsCard: FC<ReviewsCardProps> = ({ reviewers }) => {
  if (!reviewers.length) {
    return null;
  }

  const handleOpen = (event: MouseEvent<HTMLButtonElement>, url?: Link) => {
    // The card is portaled, so React events still bubble through the row.
    event.stopPropagation();

    if (url) {
      openExternalLink(url);
    }
  };

  return (
    <Stack data-testid="reviews-card" direction="vertical" gap="condensed">
      {reviewers.map((reviewer) => (
        <button
          aria-label={`Open reviewer ${reviewer.login ?? reviewer.user}`}
          className="flex items-center gap-2 text-left"
          key={reviewer.user}
          onClick={(event) => handleOpen(event, reviewer.htmlUrl)}
          type="button"
        >
          <AvatarWithFallback
            alt={reviewer.login ?? reviewer.user}
            size={Size.SMALL}
            src={reviewer.avatarUrl}
            userType={reviewer.type}
          />
          <Stack direction="vertical" gap="none">
            <Text className="text-xs font-semibold">{reviewer.user}</Text>
            <Text className={cn('text-xxs', Opacity.MEDIUM)}>
              {reviewer.state
                ? (REVIEW_STATE_LABELS[reviewer.state] ?? reviewer.state)
                : 'Reviewer'}
              {reviewer.threads.total > 0
                ? ` · ${reviewer.threads.resolved}/${reviewer.threads.total} resolved`
                : ''}
            </Text>
          </Stack>
        </button>
      ))}
    </Stack>
  );
};
