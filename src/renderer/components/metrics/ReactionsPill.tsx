import type { FC } from 'react';

import { SmileyIcon } from '@primer/octicons-react';

import { type GitifyReactionGroup, IconColor } from '../../types';

import { formatMetricDescription } from '../../utils/notifications/formatters';
import { MetricPill } from './MetricPill';

export interface ReactionsPillProps {
  reactionsCount: number;
  reactionGroups: GitifyReactionGroup[];
}

const reactionEmojiMap: Record<string, string> = {
  THUMBS_UP: '👍',
  THUMBS_DOWN: '👎',
  LAUGH: '😆',
  HOORAY: '🎉',
  CONFUSED: '😕',
  ROCKET: '🚀',
  EYES: '👀',
  HEART: '❤️',
};

export const ReactionsPill: FC<ReactionsPillProps> = ({
  reactionsCount,
  reactionGroups,
}) => {
  if (!reactionsCount) {
    return null;
  }

  const hasMultipleReactions =
    reactionGroups.filter((rg) => rg.reactors.totalCount > 0).length > 1;

  const description = formatMetricDescription(
    reactionsCount,
    'reaction',
    (count, noun) => {
      const formatted = reactionGroups
        .map((rg) => {
          const emoji = reactionEmojiMap[rg.content];
          if (!emoji || !rg.reactors.totalCount) {
            return '';
          }
          return `${emoji} ${hasMultipleReactions ? rg.reactors.totalCount : ''}`.trim();
        })
        .filter(Boolean)
        .join(' ');
      return `${count} ${noun}: ${formatted}`;
    },
  );

  return (
    <MetricPill
      color={IconColor.GRAY}
      icon={SmileyIcon}
      metric={reactionsCount}
      title={description}
    />
  );
};
