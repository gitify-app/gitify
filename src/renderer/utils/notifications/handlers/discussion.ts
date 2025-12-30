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
import {
  type CommentFieldsFragment,
  type DiscussionCommentFieldsFragment,
  type DiscussionDetailsFragment,
  DiscussionDetailsFragmentDoc,
} from '../../api/graphql/generated/graphql';
import { DefaultHandler, defaultHandler } from './default';
import { getNotificationAuthor } from './utils';

class DiscussionHandler extends DefaultHandler {
  readonly type = 'Discussion';

  readonly mergeQueryNodeResponseType = DiscussionDetailsFragmentDoc;

  async enrich(
    notification: GitifyNotification,
    _settings: SettingsState,
    fetchedData?: DiscussionDetailsFragment,
  ): Promise<Partial<GitifySubject>> {
    // If no fetched data and no URL, we can't enrich - return empty
    if (!fetchedData && !notification.subject.url) {
      return {};
    }

    const discussion =
      fetchedData ??
      (await fetchDiscussionByNumber(notification)).data.repository?.discussion;

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

    return {
      number: discussion.number,
      state: discussionState,
      user: getNotificationAuthor([
        latestDiscussionComment?.author,
        discussion.author,
      ]),
      comments: discussion.comments.totalCount,
      labels:
        discussion.labels?.nodes?.flatMap((label) =>
          label ? [label.name] : [],
        ) ?? [],
      htmlUrl: latestDiscussionComment?.url ?? discussion.url,
    };
  }

  iconType(subject: GitifySubject): FC<OcticonProps> | null {
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

  iconColor(subject: GitifySubject): IconColor {
    switch (subject.state) {
      case 'ANSWERED':
        return IconColor.GREEN;
      case 'RESOLVED':
        return IconColor.PURPLE;
      default:
        return defaultHandler.iconColor(subject);
    }
  }

  defaultUrl(notification: GitifyNotification): Link {
    const url = new URL(notification.repository.htmlUrl);
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
