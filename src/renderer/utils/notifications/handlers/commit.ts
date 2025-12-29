import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import { GitCommitIcon } from '@primer/octicons-react';

import type {
  GitifyNotification,
  GitifyNotificationState,
  GitifyNotificationUser,
  GitifySubject,
  SettingsState,
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
  ): Promise<Partial<GitifySubject>> {
    const commitState: GitifyNotificationState = null; // Commit notifications are stateless

    // Return early if this notification would be hidden by filters
    if (isStateFilteredOut(commitState, settings)) {
      return {};
    }

    let user: GitifyNotificationUser;

    if (notification.subject.latestCommentUrl) {
      const commitComment = (
        await getCommitComment(
          notification.subject.latestCommentUrl,
          notification.account.token,
        )
      ).data;

      user = {
        login: commitComment.user.login,
        avatarUrl: commitComment.user.avatar_url,
        htmlUrl: commitComment.user.html_url,
        type: commitComment.user.type as GitifyNotificationUser['type'],
      };
    } else {
      const commit = (
        await getCommit(notification.subject.url, notification.account.token)
      ).data;

      user = {
        login: commit.author.login,
        avatarUrl: commit.author.avatar_url,
        htmlUrl: commit.author.html_url,
        type: commit.author.type as GitifyNotificationUser['type'],
      };
    }

    return {
      state: commitState,
      user: getNotificationAuthor([user]),
    };
  }

  iconType(_subject: GitifySubject): FC<OcticonProps> | null {
    return GitCommitIcon;
  }
}

export const commitHandler = new CommitHandler();
