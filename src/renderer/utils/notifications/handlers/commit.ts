import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import { GitCommitIcon } from '@primer/octicons-react';

import type { SettingsState } from '../../../types';
import type {
  GitifySubject,
  Notification,
  Subject,
  User,
} from '../../../typesGitHub';
import { getCommit, getCommitComment } from '../../api/client';
import type { NotificationTypeHandler } from './types';
import { getSubjectUser } from './utils';

class CommitHandler implements NotificationTypeHandler {
  readonly type = 'Commit';

  async enrich(
    notification: Notification,
    _settings: SettingsState,
  ): Promise<GitifySubject> {
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
      state: null,
      user: getSubjectUser([user]),
    };
  }

  getIcon(_subject: Subject): FC<OcticonProps> | null {
    return GitCommitIcon;
  }
}

export const commitHandler = new CommitHandler();
