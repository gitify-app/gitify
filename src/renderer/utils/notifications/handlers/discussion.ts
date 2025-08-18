import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import {
  CommentDiscussionIcon,
  DiscussionClosedIcon,
  DiscussionDuplicateIcon,
  DiscussionOutdatedIcon,
} from '@primer/octicons-react';

import { differenceInMilliseconds } from 'date-fns';

import type { SettingsState } from '../../../types';
import type {
  DiscussionComment,
  DiscussionStateType,
  GitifySubject,
  Notification,
  Subject,
  SubjectUser,
} from '../../../typesGitHub';
import { getLatestDiscussion } from '../../api/client';
import { isStateFilteredOut } from '../filters/filter';
import type { NotificationTypeHandler } from './types';

class DiscussionHandler implements NotificationTypeHandler {
  readonly type = 'Discussion';

  async enrich(
    notification: Notification,
    settings: SettingsState,
  ): Promise<GitifySubject> {
    const discussion = await getLatestDiscussion(notification);
    let discussionState: DiscussionStateType = 'OPEN';

    if (discussion) {
      if (discussion.isAnswered) {
        discussionState = 'ANSWERED';
      }

      if (discussion.stateReason) {
        discussionState = discussion.stateReason;
      }
    }

    // Return early if this notification would be hidden by filters
    if (isStateFilteredOut(discussionState, settings)) {
      return null;
    }

    const latestDiscussionComment = getClosestDiscussionCommentOrReply(
      notification,
      discussion.comments.nodes,
    );

    let discussionUser: SubjectUser = {
      login: discussion.author.login,
      html_url: discussion.author.url,
      avatar_url: discussion.author.avatar_url,
      type: discussion.author.type,
    };
    if (latestDiscussionComment) {
      discussionUser = {
        login: latestDiscussionComment.author.login,
        html_url: latestDiscussionComment.author.url,
        avatar_url: latestDiscussionComment.author.avatar_url,
        type: latestDiscussionComment.author.type,
      };
    }

    return {
      number: discussion.number,
      state: discussionState,
      user: discussionUser,
      comments: discussion.comments.totalCount,
      labels: discussion.labels?.nodes.map((label) => label.name) ?? [],
    };
  }

  getIcon(subject: Subject): FC<OcticonProps> | null {
    switch (subject.state) {
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
}

export const discussionHandler = new DiscussionHandler();

export function getClosestDiscussionCommentOrReply(
  notification: Notification,
  comments: DiscussionComment[],
): DiscussionComment | null {
  if (!comments || comments.length === 0) {
    return null;
  }

  const targetTimestamp = notification.updated_at;

  const allCommentsAndReplies = comments.flatMap((comment) => [
    comment,
    ...comment.replies.nodes,
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
