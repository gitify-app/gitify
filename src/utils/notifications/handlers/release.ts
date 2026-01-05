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
  UserType,
} from '../../../types';
import { getRelease } from '../../api/client';
import { isStateFilteredOut } from '../filters/filter';
import { DefaultHandler, defaultHandler } from './default';
import { getNotificationAuthor } from './utils';

class ReleaseHandler extends DefaultHandler {
  readonly type = 'Release';

  async enrich(
    notification: GitifyNotification,
    settings: SettingsState,
  ): Promise<Partial<GitifySubject> | null> {
    // Release notifications are stateless
    const releaseState: GitifyNotificationState | undefined = undefined;

    // Return early if this notification would be hidden by filters
    if (isStateFilteredOut(releaseState, settings)) {
      return null;
    }

    if (!notification.subject.url) {
      return null;
    }

    const release = (
      await getRelease(notification.subject.url, notification.account.token)
    ).data;

    // Transform raw API author to GitifyNotificationUser
    let author: GitifyNotificationUser | undefined;
    if (release.author) {
      author = {
        login: release.author.login,
        avatarUrl: release.author.avatar_url as Link,
        htmlUrl: release.author.html_url as Link,
        type: release.author.type as UserType,
      };
    }

    return {
      state: releaseState,
      user: getNotificationAuthor([author]),
    };
  }

  iconType(_notification: GitifyNotification): FC<OcticonProps> {
    return TagIcon;
  }

  defaultUrl(notification: GitifyNotification): Link {
    const url = new URL(defaultHandler.defaultUrl(notification));
    url.pathname += '/releases';
    return url.href as Link;
  }
}

export const releaseHandler = new ReleaseHandler();
