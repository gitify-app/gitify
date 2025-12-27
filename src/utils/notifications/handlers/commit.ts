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
  ): Promise<GitifySubject | null> {
    // Commit notifications are stateless
    const commitState: GitifyNotificationState | undefined = undefined;

    // Return early if this notification would be hidden by filters
    if (isStateFilteredOut(commitState, settings)) {
      return null;
    }

    let user: GitifyNotificationUser | undefined;

    if (notification.subject.latest_comment_url) {
      const commitComment = (
        await getCommitComment(
          notification.subject.latest_comment_url,
          notification.account.token,
        )
      ).data;

      user = commitComment.user ?? undefined;
    } else if (notification.subject.url) {
      const commit = (
        await getCommit(notification.subject.url, notification.account.token)
      ).data;

      user = {
        login: commit.author.login,
        avatar_url: commit.author.avatar_url,
        html_url: commit.author.html_url,
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
