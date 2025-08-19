import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import { GitCommitIcon } from '@primer/octicons-react';

import type { SettingsState } from '../../../types';
import type {
  GitifySubject,
  Notification,
  StateType,
  Subject,
  User,
} from '../../../typesGitHub';
import { getCommit, getCommitComment } from '../../api/client';
import { isStateFilteredOut } from '../filters/filter';
import { DefaultHandler } from './default';
import { getSubjectUser } from './utils';

class CommitHandler extends DefaultHandler {
  readonly type = 'Commit';

  async enrich(
    notification: Notification,
    settings: SettingsState,
  ): Promise<GitifySubject> {
    const commitState: StateType = null; // Commit notifications are stateless

    // Return early if this notification would be hidden by filters
    if (isStateFilteredOut(commitState, settings)) {
      return null;
    }

    let user: User;

    if (notification.subject.latest_comment_url) {
      const commitComment = (
        await getCommitComment(
          notification.subject.latest_comment_url,
          notification.account.token,
        )
      ).data;

      user = commitComment.user;
    } else {
      const commit = (
        await getCommit(notification.subject.url, notification.account.token)
      ).data;

      user = commit.author;
    }

    return {
      state: commitState,
      user: getSubjectUser([user]),
    };
  }

  getIcon(_subject: Subject): FC<OcticonProps> | null {
    return GitCommitIcon;
  }
}

export const commitHandler = new CommitHandler();
