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
} from '../../../../types';
import type { RawUser } from '../types';

import { isStateFilteredOut } from '../../../notifications/filters/filter';
import { getCommit, getCommitComment } from '../client';
import { DefaultHandler } from './default';

function toNotificationUser(
  user: RawUser | Record<string, never> | null | undefined,
): GitifyNotificationUser | undefined {
  if (!user || !('login' in user)) {
    return undefined;
  }

  return {
    login: user.login,
    avatarUrl: user.avatar_url as Link,
    htmlUrl: user.html_url as Link,
    type: user.type as GitifyNotificationUser['type'],
  };
}

class CommitHandler extends DefaultHandler {
  override async enrich(
    notification: GitifyNotification,
    _settings: SettingsState,
  ): Promise<Partial<GitifySubject>> {
    const commitState: GitifyNotificationState | undefined = undefined; // Commit notifications are stateless

    // Return early if this notification would be hidden by filters
    if (isStateFilteredOut(commitState)) {
      return {};
    }

    // Always resolve the commit author; additionally resolve the latest
    // comment author when the notification points at a comment. Both calls run
    // in parallel so populating both roles costs no extra latency.
    let author: GitifyNotificationUser | undefined;
    let commenter: GitifyNotificationUser | undefined;

    if (notification.subject.latestCommentUrl) {
      const [commit, commitComment] = await Promise.all([
        getCommit(notification.account, notification.subject.url!),
        getCommitComment(notification.account, notification.subject.latestCommentUrl),
      ]);

      author = toNotificationUser(commit.author);
      commenter = toNotificationUser(commitComment.user);
    } else {
      const commit = await getCommit(notification.account, notification.subject.url!);

      author = toNotificationUser(commit.author);
    }

    return {
      state: commitState,
      user: commenter ?? author,
      author: author,
      commenter: commenter,
    };
  }

  override iconType(_notification: GitifyNotification): FC<OcticonProps> {
    return GitCommitIcon;
  }
}

export const commitHandler = new CommitHandler();
