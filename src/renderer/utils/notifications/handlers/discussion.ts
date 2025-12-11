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
  DiscussionStateType,
  GitifySubject,
  Notification,
  Subject,
  SubjectUser,
} from '../../../typesGitHub';
import { getLatestDiscussion } from '../../api/client';
import type {
  AuthorFieldsFragment,
  CommentFieldsFragment,
  DiscussionCommentFieldsFragment,
} from '../../api/graphql/generated/graphql';
import { isStateFilteredOut } from '../filters/filter';
import { DefaultHandler } from './default';

class DiscussionHandler extends DefaultHandler {
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
      discussion.comments.nodes as DiscussionCommentFieldsFragment[],
    );

    const discussionAuthor = discussion.author as AuthorFieldsFragment;

    let discussionUser: SubjectUser = {
      login: discussionAuthor.login,
      html_url: discussionAuthor.url,
      avatar_url: discussionAuthor.avatar_url,
      type: discussionAuthor.type,
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

  iconType(subject: Subject): FC<OcticonProps> | null {
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
  comments: DiscussionCommentFieldsFragment[],
): DiscussionCommentFieldsFragment | null {
  if (!comments || comments.length === 0) {
    return null;
  }

  const targetTimestamp = notification.updated_at;

  const allCommentsAndReplies = comments.flatMap((comment) => [
    comment,
    ...comment.replies.nodes,
  ]);

  // Find the closest match using the target timestamp
  const closestComment = allCommentsAndReplies.reduce(
    (prev: CommentFieldsFragment, curr: CommentFieldsFragment) => {
      const prevDiff = Math.abs(
        differenceInMilliseconds(prev.createdAt, targetTimestamp),
      );
      const currDiff = Math.abs(
        differenceInMilliseconds(curr.createdAt, targetTimestamp),
      );
      return currDiff < prevDiff ? curr : prev;
    },
    allCommentsAndReplies[0],
  );

  return closestComment;
}
