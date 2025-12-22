import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import {
  CommentDiscussionIcon,
  DiscussionClosedIcon,
  DiscussionDuplicateIcon,
  DiscussionOutdatedIcon,
} from '@primer/octicons-react';

import { differenceInMilliseconds } from 'date-fns';

import type { Link, SettingsState } from '../../../types';
import type {
  GitifyDiscussionState,
  GitifySubject,
  Notification,
  Subject,
} from '../../../typesGitHub';
import { fetchDiscussionByNumber } from '../../api/client';
import type {
  CommentFieldsFragment,
  FetchDiscussionByNumberQuery,
} from '../../api/graphql/generated/graphql';
import { isStateFilteredOut } from '../filters/filter';
import { DefaultHandler } from './default';
import { getSubjectAuthor } from './utils';

type DiscussionComment = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<
        Extract<
          NonNullable<FetchDiscussionByNumberQuery['repository']>,
          { __typename?: 'Repository' }
        >['discussion']
      >
    >['comments']['nodes']
  >[number]
>;

class DiscussionHandler extends DefaultHandler {
  readonly type = 'Discussion';

  async enrich(
    notification: Notification,
    settings: SettingsState,
  ): Promise<GitifySubject> {
    const response = await fetchDiscussionByNumber(notification);
    const discussion = response.data.repository?.discussion;

    if (!discussion) {
      return null;
    }

    let discussionState: GitifyDiscussionState = 'OPEN';

    if (discussion.isAnswered) {
      discussionState = 'ANSWERED';
    } else if (discussion.stateReason) {
      discussionState = discussion.stateReason;
    }

    // Return early if this notification would be hidden by filters
    if (isStateFilteredOut(discussionState, settings)) {
      return null;
    }

    const latestDiscussionComment = getClosestDiscussionCommentOrReply(
      notification,
      discussion.comments.nodes,
    );

    return {
      number: discussion.number,
      state: discussionState,
      user: getSubjectAuthor([
        latestDiscussionComment.author,
        discussion.author,
      ]),
      comments: discussion.comments.totalCount,
      labels: discussion.labels?.nodes.map((label) => label.name) ?? [],
      htmlUrl: latestDiscussionComment.url ?? discussion.url,
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

  defaultUrl(notification: Notification): Link {
    const url = new URL(notification.repository.html_url);
    url.pathname += '/discussions';
    return url.href as Link;
  }
}

export const discussionHandler = new DiscussionHandler();

export function getClosestDiscussionCommentOrReply(
  notification: Notification,
  comments: DiscussionComment[],
): CommentFieldsFragment | null {
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
