import type { FC } from 'react';

import { SmileyIcon } from '@primer/octicons-react';
import { IssueLabelToken, LabelGroup } from '@primer/react';

import { type GitifyReactionGroup, IconColor } from '../../types';

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

export const ReactionsPill: FC<ReactionsPillProps> = ({ reactionsCount, reactionGroups }) => {
  if (!reactionsCount) {
    return null;
  }

  const visibleReactionGroups = reactionGroups.filter(
    (rg) => !!rg.reactors && rg.reactors.totalCount > 0,
  );

  const reactionsContent = (
    <LabelGroup>
      {visibleReactionGroups.map((rg) => {
        const emoji = reactionEmojiMap[rg.content];
        const total = rg.reactors.totalCount;

        return (
          <IssueLabelToken
            fillColor="#24292e" // Same as sidebar color from tailwind config
            key={rg.content}
            size="small"
            text={`${emoji} ${total}`}
          />
        );
      })}
    </LabelGroup>
  );

  return (
    <MetricPill
      color={IconColor.GRAY}
      contents={reactionsContent}
      icon={SmileyIcon}
      metric={reactionsCount}
    />
  );
};
