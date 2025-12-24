import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import { GitCommitIcon } from '@primer/octicons-react';

import type {
  GitifyNotificationState,
  GitifyNotificationUser,
  GitifySubject,
  SettingsState,
} from '../../../types';
import type { Notification, Subject } from '../../../typesGitHub';
import { getCommit, getCommitComment } from '../../api/client';
import { isStateFilteredOut } from '../filters/filter';
import { DefaultHandler } from './default';
import { getNotificationAuthor } from './utils';

class CommitHandler extends DefaultHandler {
  readonly type = 'Commit';

  async enrich(
    notification: Notification,
    settings: SettingsState,
  ): Promise<GitifySubject> {
    const commitState: GitifyNotificationState = null; // Commit notifications are stateless

    // Return early if this notification would be hidden by filters
    if (isStateFilteredOut(commitState, settings)) {
      return null;
    }

    let user: GitifyNotificationUser;

    if (notification.subject.latest_comment_url) {
      const commitComment = (
        await getCommitComment(
          notification.subject.latest_comment_url,
          notification.account.token,
        )
      ).data;

      user = {
        login: commitComment.user.login,
        html_url: commitComment.user.html_url,
        avatar_url: commitComment.user.avatar_url,
        type: commitComment.user.type,
      };
    } else {
      const commit = (
        await getCommit(notification.subject.url, notification.account.token)
      ).data;

      user = {
        login: commit.author.login,
        html_url: commit.author.html_url,
        avatar_url: commit.author.avatar_url,
        type: commit.author.type,
      };
    }

    return {
      state: commitState,
      user: getNotificationAuthor([user]),
    };
  }

  iconType(_subject: Subject): FC<OcticonProps> | null {
    return GitCommitIcon;
  }
}

export const commitHandler = new CommitHandler();
