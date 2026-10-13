import type { FC, MouseEvent } from 'react';

import { RelativeTime, Stack, Text } from '@primer/react';

import { cn } from 'cn';

import { type GitifyComment, type Link, Opacity, Size } from '../../types';

import { openExternalLink } from '../../utils/system/comms';
import { AvatarWithFallback } from '../avatars/AvatarWithFallback';
import { MarkdownBody } from './MarkdownBody';

export interface CommentsPreviewProps {
  comments: GitifyComment[];
}

/**
 * Preview listing a notification's recent comments (newest first), each with
 * its author, formatted body, relative time, and a click-through to the
 * comment. The card scrolls internally for long threads.
 */
export const CommentsPreview: FC<CommentsPreviewProps> = ({ comments }) => {
  if (!comments.length) {
    return null;
  }

  const newestFirst = [...comments].reverse();

  const handleOpen = (event: MouseEvent<HTMLButtonElement>, url: Link) => {
    // The card is portaled, so React events still bubble through the row.
    event.stopPropagation();
    openExternalLink(url);
  };

  return (
    <Stack data-testid="comments-preview" direction="vertical" gap="normal">
      {newestFirst.map((comment, index) => (
        <Stack direction="vertical" gap="condensed" key={`${comment.url}-${index}`}>
          <Stack align="center" direction="horizontal" gap="condensed">
            <AvatarWithFallback
              alt={comment.author?.login}
              size={Size.SMALL}
              src={comment.author?.avatarUrl}
              userType={comment.author?.type}
            />
            <Text className="text-xs font-semibold">
              {comment.author?.login ?? 'Unknown author'}
            </Text>
            <Text className={cn('ml-auto text-xxs', Opacity.MEDIUM)}>
              <RelativeTime datetime={comment.createdAt} />
            </Text>
          </Stack>

          <MarkdownBody html={comment.bodyHtml} testId="comment-body" />

          <button
            className="text-xxs self-start text-gitify-link hover:underline"
            onClick={(event) => handleOpen(event, comment.url)}
            type="button"
          >
            View comment ↗
          </button>
        </Stack>
      ))}
    </Stack>
  );
};
