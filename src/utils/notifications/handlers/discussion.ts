import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import {
  CommentDiscussionIcon,
  DiscussionClosedIcon,
  DiscussionDuplicateIcon,
  DiscussionOutdatedIcon,
} from '@primer/octicons-react';

import { differenceInMilliseconds } from 'date-fns';

import {
  type GitifyDiscussionState,
  type GitifySubject,
  IconColor,
  type Link,
  type SettingsState,
} from '../../../types';
import type { Notification, Subject } from '../../../typesGitHub';
import { fetchDiscussionByNumber } from '../../api/client';
import type {
  CommentFieldsFragment,
  DiscussionCommentFieldsFragment,
} from '../../api/graphql/generated/graphql';
import { DefaultHandler, defaultHandler } from './default';
import { getNotificationAuthor } from './utils';

class DiscussionHandler extends DefaultHandler {
  readonly type = 'Discussion';

  async enrich(
    notification: Notification,
    _settings: SettingsState,
  ): Promise<GitifySubject | null> {
    const response = await fetchDiscussionByNumber(notification);
    const discussion = response.data?.repository?.discussion;

    if (!discussion) {
      return null;
    }

    let discussionState: GitifyDiscussionState = 'OPEN';

    if (discussion.isAnswered) {
      discussionState = 'ANSWERED';
    }

    if (discussion.stateReason) {
      discussionState = discussion.stateReason;
    }

    const commentNodes = discussion.comments?.nodes?.filter(
      (node): node is NonNullable<typeof node> => node != null,
    );

    const latestDiscussionComment = getClosestDiscussionCommentOrReply(
      notification,
      commentNodes ?? [],
    );

    return {
      number: discussion.number,
      state: discussionState,
      user: getNotificationAuthor([
        latestDiscussionComment?.author ?? undefined,
        discussion.author ?? undefined,
      ]),
      comments: discussion.comments.totalCount,
      labels:
        discussion.labels?.nodes
          ?.filter((label): label is NonNullable<typeof label> => label != null)
          .map((label) => label.name) ?? [],
      htmlUrl: (latestDiscussionComment?.url ?? discussion.url) as Link,
    };
  }

  iconType(subject: Subject): FC<OcticonProps> | null {
    switch (subject.state as GitifyDiscussionState) {
      case 'DUPLICATE':
        return DiscussionDuplicateIcon;
      case 'OUTDATED':
        return DiscussionOutdatedIcon;
      case 'RESOLVED':
        return DiscussionClosedIcon;
      default:
        return CommentDiscussionIcon;
    }
  }

  iconColor(subject: Subject): IconColor {
    switch (subject.state) {
      case 'ANSWERED':
        return IconColor.GREEN;
      case 'RESOLVED':
        return IconColor.PURPLE;
      default:
        return defaultHandler.iconColor(subject);
    }
  }

  defaultUrl(notification: Notification): Link {
    const url = new URL(notification.repository.html_url);
    url.pathname += '/discussions';
    return url.href as Link;
  }
}

export const discussionHandler = new DiscussionHandler();

export function getClosestDiscussionCommentOrReply(
  notification: Notification,
  comments: DiscussionCommentFieldsFragment[],
): CommentFieldsFragment | null {
  if (!comments || comments.length === 0) {
    return null;
  }

  const targetTimestamp = notification.updated_at;

  const allCommentsAndReplies = comments.flatMap((comment) => {
    const replyNodes =
      comment.replies?.nodes?.filter(
        (node): node is NonNullable<typeof node> => node != null,
      ) ?? [];
    return [...replyNodes, comment];
  });

  if (allCommentsAndReplies.length === 0) {
    return null;
  }

  // Find the closest match using the target timestamp
  const closestComment = allCommentsAndReplies.reduce((prev, curr) => {
    const prevDiff = Math.abs(
      differenceInMilliseconds(prev.createdAt, targetTimestamp),
    );
    const currDiff = Math.abs(
      differenceInMilliseconds(curr.createdAt, targetTimestamp),
    );
    return currDiff < prevDiff ? curr : prev;
  }, allCommentsAndReplies[0]);

  return closestComment;
}
