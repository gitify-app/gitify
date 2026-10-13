import type { FC } from 'react';

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
 * its author, formatted body, and a relative timestamp that links to the
 * comment - the same permalink affordance GitHub uses in timelines. Entries are
 * separated by a divider and the card scrolls internally for long threads.
 */
export const CommentsPreview: FC<CommentsPreviewProps> = ({ comments }) => {
  if (!comments.length) {
    return null;
  }

  const newestFirst = [...comments].reverse();

  const openComment = (event: React.MouseEvent<HTMLAnchorElement>, url: Link) => {
    // The card is portaled, so React events still bubble through the row.
    event.preventDefault();
    event.stopPropagation();
    openExternalLink(url);
  };

  return (
    <Stack data-testid="comments-preview" direction="vertical" gap="none">
      {newestFirst.map((comment, index) => (
        <div
          className={cn(
            'flex flex-col gap-1 py-1.5',
            index > 0 && 'border-t border-gitify-notification-border',
          )}
          key={`${comment.url}-${index}`}
        >
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
            <a
              aria-label={`Open comment by ${comment.author?.login ?? 'unknown author'}`}
              className={cn('ml-auto text-xxs hover:underline', Opacity.MEDIUM)}
              href={comment.url}
              onClick={(event) => openComment(event, comment.url)}
            >
              <RelativeTime datetime={comment.createdAt} />
            </a>
          </Stack>

          <MarkdownBody html={comment.bodyHtml} testId="comment-body" />
        </div>
      ))}
    </Stack>
  );
};
