import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import { GitCommitIcon } from '@primer/octicons-react';

import type {
  GitifyNotification,
  GitifyNotificationState,
  GitifyNotificationUser,
  GitifySubject,
  Link,
  SettingsState,
  UserType,
} from '../../../types';
import { getCommit, getCommitComment } from '../../api/client';
import { isStateFilteredOut } from '../filters/filter';
import { DefaultHandler } from './default';
import { getNotificationAuthor } from './utils';

class CommitHandler extends DefaultHandler {
  readonly type = 'Commit';

  async enrich(
    notification: GitifyNotification,
    settings: SettingsState,
  ): Promise<Partial<GitifySubject> | null> {
    // Commit notifications are stateless
    const commitState: GitifyNotificationState | undefined = undefined;

    // Return early if this notification would be hidden by filters
    if (isStateFilteredOut(commitState, settings)) {
      return null;
    }

    let user: GitifyNotificationUser | undefined;

    if (notification.subject.latestCommentUrl) {
      const commitComment = (
        await getCommitComment(
          notification.subject.latestCommentUrl,
          notification.account.token,
        )
      ).data;

      if (commitComment.user) {
        user = {
          login: commitComment.user.login,
          avatarUrl: commitComment.user.avatar_url as Link,
          htmlUrl: commitComment.user.html_url as Link,
          type: commitComment.user.type as UserType,
        };
      }
    } else if (notification.subject.url) {
      const commit = (
        await getCommit(notification.subject.url, notification.account.token)
      ).data;

      if (commit.author) {
        user = {
          login: commit.author.login,
          avatarUrl: commit.author.avatar_url as Link,
          htmlUrl: commit.author.html_url as Link,
          type: commit.author.type as UserType,
        };
      }
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
