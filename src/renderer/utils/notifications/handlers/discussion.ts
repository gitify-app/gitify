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
  type GitifyNotification,
  type GitifySubject,
  IconColor,
  type Link,
  type SettingsState,
} from '../../../types';

import { fetchDiscussionByNumber } from '../../api/client';
import type {
  CommentFieldsFragment,
  DiscussionCommentFieldsFragment,
  DiscussionDetailsFragment,
} from '../../api/graphql/generated/graphql';
import { DefaultHandler, defaultHandler } from './default';
import { getNotificationAuthor } from './utils';

class DiscussionHandler extends DefaultHandler {
  readonly type = 'Discussion';

  readonly supportsMergedQueryEnrichment = true;

  async enrich(
    notification: GitifyNotification,
    _settings: SettingsState,
    fetchedData?: DiscussionDetailsFragment,
  ): Promise<Partial<GitifySubject>> {
    const discussion =
      fetchedData ??
      (await fetchDiscussionByNumber(notification)).repository?.discussion;

    let discussionState: GitifyDiscussionState = 'OPEN';

    if (discussion.isAnswered) {
      discussionState = 'ANSWERED';
    }

    if (discussion.stateReason) {
      discussionState = discussion.stateReason;
    }

    const latestDiscussionComment = getClosestDiscussionCommentOrReply(
      notification,
      discussion.comments.nodes,
    );

    const discussionReactionCount =
      latestDiscussionComment?.reactions.totalCount ??
      discussion.reactions.totalCount;
    const discussionReactionGroup =
      latestDiscussionComment?.reactionGroups ?? discussion.reactionGroups;

    return {
      number: discussion.number,
      state: discussionState,
      user: getNotificationAuthor([
        latestDiscussionComment?.author,
        discussion.author,
      ]),
      commentCount: discussion.comments.totalCount,
      labels:
        discussion.labels?.nodes.map((label) => ({
          name: label.name,
          color: label.color,
        })) ?? [],
      htmlUrl: latestDiscussionComment?.url ?? discussion.url,
      reactionsCount: discussionReactionCount,
      reactionGroups: discussionReactionGroup,
    };
  }

  iconType(notification: GitifyNotification): FC<OcticonProps> {
    switch (notification.subject.state as GitifyDiscussionState) {
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

  iconColor(notification: GitifyNotification): IconColor {
    switch (notification.subject.state) {
      case 'ANSWERED':
        return IconColor.GREEN;
      case 'RESOLVED':
        return IconColor.PURPLE;
      default:
        return defaultHandler.iconColor(notification);
    }
  }

  defaultUrl(notification: GitifyNotification): Link {
    const url = new URL(defaultHandler.defaultUrl(notification));
    url.pathname += '/discussions';
    return url.href as Link;
  }
}

export const discussionHandler = new DiscussionHandler();

export function getClosestDiscussionCommentOrReply(
  notification: GitifyNotification,
  comments: DiscussionCommentFieldsFragment[],
): CommentFieldsFragment | null {
  if (!comments || comments.length === 0) {
    return null;
  }

  const targetTimestamp = notification.updatedAt;

  const allCommentsAndReplies = comments.flatMap((comment) => [
    ...comment.replies.nodes,
    comment,
  ]);

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
