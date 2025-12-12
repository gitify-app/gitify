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
import { fetchDiscussionByNumber } from '../../api/client';
import { useFragment as getFragmentData } from '../../api/graphql/generated/fragment-masking';
import type {
  CommentFieldsFragment,
  FetchDiscussionByNumberQuery,
} from '../../api/graphql/generated/graphql';
import {
  AuthorFieldsFragmentDoc,
  CommentFieldsFragmentDoc,
} from '../../api/graphql/generated/graphql';

// Type for discussion comment nodes from the FetchDiscussionByNumberQuery
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

import { isStateFilteredOut } from '../filters/filter';
import { DefaultHandler } from './default';

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

    let discussionState: DiscussionStateType = 'OPEN';

    if (discussion.isAnswered) {
      discussionState = 'ANSWERED';
    }

    if (discussion.stateReason) {
      discussionState = discussion.stateReason;
    }

    // Return early if this notification would be hidden by filters
    if (isStateFilteredOut(discussionState, settings)) {
      return null;
    }

    // Discussion comments come directly from the query result
    const discussionComments = discussion.comments.nodes;

    const latestDiscussionComment = getClosestDiscussionCommentOrReply(
      notification,
      discussionComments,
    );

    // Unwrap author from fragment-masked type
    const discussionAuthor = getFragmentData(
      AuthorFieldsFragmentDoc,
      discussion.author,
    );

    let discussionUser: SubjectUser;

    if (latestDiscussionComment) {
      // Unwrap author from the latest comment
      const commentAuthor = getFragmentData(
        AuthorFieldsFragmentDoc,
        latestDiscussionComment.author,
      );

      if (commentAuthor) {
        discussionUser = {
          login: commentAuthor.login,
          html_url: commentAuthor.url,
          avatar_url: commentAuthor.avatar_url,
          type: commentAuthor.type,
        };
      }
    }

    // Fall back to discussion author if no comment author found
    if (!discussionUser && discussionAuthor) {
      discussionUser = {
        login: discussionAuthor.login,
        html_url: discussionAuthor.url,
        avatar_url: discussionAuthor.avatar_url,
        type: discussionAuthor.type,
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
  comments: DiscussionComment[],
): CommentFieldsFragment | null {
  if (!comments || comments.length === 0) {
    return null;
  }

  const targetTimestamp = notification.updated_at;

  // Unwrap all comments and their replies from fragment-masked types
  const allCommentsAndReplies: CommentFieldsFragment[] = comments.flatMap(
    (comment) => {
      const unwrappedComment = getFragmentData(
        CommentFieldsFragmentDoc,
        comment,
      );
      const unwrappedReplies =
        getFragmentData(CommentFieldsFragmentDoc, comment.replies?.nodes) || [];

      // Ensure unwrappedComment is defined before spreading
      if (!unwrappedComment) {
        return unwrappedReplies;
      }
      return [unwrappedComment, ...unwrappedReplies];
    },
  );

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
