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
} from '../../../../types';

import { isStateFilteredOut } from '../../../notifications/filters/filter';
import { getRelease } from '../client';
import { DefaultHandler, defaultHandler } from './default';

class ReleaseHandler extends DefaultHandler {
  override async enrich(
    notification: GitifyNotification,
    _settings: SettingsState,
  ): Promise<Partial<GitifySubject>> {
    const releaseState: GitifyNotificationState | undefined = undefined; // Release notifications are stateless

    // Return early if this notification would be hidden by filters
    if (isStateFilteredOut(releaseState)) {
      return {};
    }

    const release = await getRelease(notification.account, notification.subject.url!);

    const author: GitifyNotificationUser | undefined = release.author
      ? {
          login: release.author.login,
          avatarUrl: release.author.avatar_url as Link,
          htmlUrl: release.author.html_url as Link,
          type: release.author.type as UserType,
        }
      : undefined;

    return {
      state: releaseState,
      user: author,
      author: author,
    };
  }

  override iconType(_notification: GitifyNotification): FC<OcticonProps> {
    return TagIcon;
  }

  override defaultUrl(notification: GitifyNotification): Link {
    const url = new URL(defaultHandler.defaultUrl(notification));
    url.pathname += '/releases';
    return url.href as Link;
  }
}

export const releaseHandler = new ReleaseHandler();
