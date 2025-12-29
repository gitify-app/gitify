import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import { TagIcon } from '@primer/octicons-react';

import type {
  GitifyNotification,
  GitifyNotificationState,
  GitifyNotificationUser,
  GitifySubject,
  Link,
  SettingsState,
} from '../../../types';
import { getRelease } from '../../api/client';
import { isStateFilteredOut } from '../filters/filter';
import { DefaultHandler } from './default';
import { getNotificationAuthor } from './utils';

class ReleaseHandler extends DefaultHandler {
  readonly type = 'Release';

  async enrich(
    notification: GitifyNotification,
    settings: SettingsState,
  ): Promise<Partial<GitifySubject>> {
    const releaseState: GitifyNotificationState = null; // Release notifications are stateless

    // Return early if this notification would be hidden by filters
    if (isStateFilteredOut(releaseState, settings)) {
      return {};
    }

    const release = (
      await getRelease(notification.subject.url, notification.account.token)
    ).data;

    const user: GitifyNotificationUser = release.author
      ? {
          login: release.author.login,
          avatarUrl: release.author.avatar_url as Link,
          htmlUrl: release.author.html_url as Link,
          type: release.author.type as GitifyNotificationUser['type'],
        }
      : null;

    return {
      state: releaseState,
      user: getNotificationAuthor([user]),
    };
  }

  iconType(_subject: GitifySubject): FC<OcticonProps> | null {
    return TagIcon;
  }

  defaultUrl(notification: GitifyNotification): Link {
    const url = new URL(notification.repository.htmlUrl);
    url.pathname += '/releases';
    return url.href as Link;
  }
}

export const releaseHandler = new ReleaseHandler();
