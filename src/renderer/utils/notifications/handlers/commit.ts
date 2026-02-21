import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import { GitCommitIcon } from '@primer/octicons-react';

import type {
  GitifyNotification,
  GitifyNotificationState,
  GitifyNotificationUser,
  GitifySubject,
  Link,
} from '../../../types';

import { getCommit, getCommitComment } from '../../api/client';
import { isStateFilteredOut } from '../filters/filter';
import { DefaultHandler } from './default';
import { getNotificationAuthor } from './utils';

class CommitHandler extends DefaultHandler {
  readonly type = 'Commit';

  async enrich(
    notification: GitifyNotification,
  ): Promise<Partial<GitifySubject>> {
    const commitState: GitifyNotificationState = null; // Commit notifications are stateless

    // Return early if this notification would be hidden by filters
    if (isStateFilteredOut(commitState)) {
      return {};
    }

    let user: GitifyNotificationUser;

    if (notification.subject.latestCommentUrl) {
      const commitComment = await getCommitComment(
        notification.account,
        notification.subject.latestCommentUrl,
      );

      user = {
        login: commitComment.user.login,
        avatarUrl: commitComment.user.avatar_url as Link,
        htmlUrl: commitComment.user.html_url as Link,
        type: commitComment.user.type as GitifyNotificationUser['type'],
      };
    } else {
      const commit = await getCommit(
        notification.account,
        notification.subject.url,
      );

      user = {
        login: commit.author.login,
        avatarUrl: commit.author.avatar_url as Link,
        htmlUrl: commit.author.html_url as Link,
        type: commit.author.type as GitifyNotificationUser['type'],
      };
    }

    return {
      state: commitState,
      user: getNotificationAuthor([user]),
    };
  }

  iconType(_notification: GitifyNotification): FC<OcticonProps> {
    return GitCommitIcon;
  }
}

export const commitHandler = new CommitHandler();
