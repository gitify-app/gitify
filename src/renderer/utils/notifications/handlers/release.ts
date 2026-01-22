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

import { followUrl } from '../../api/client';
import { isStateFilteredOut } from '../filters/filter';
import { DefaultHandler, defaultHandler } from './default';
import { getNotificationAuthor } from './utils';
import { GetReleaseResponse } from '../../api/types';

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
      await followUrl<GetReleaseResponse>(notification.account, notification.subject.url)
    );

    const user: GitifyNotificationUser = release.author
      ? {
          login: release.author.login,
          avatarUrl: release.author.avatar_url as Link,
          htmlUrl: release.author.html_url as Link,
          type: release.author.type as UserType,
        }
      : null;

    return {
      state: releaseState,
      user: getNotificationAuthor([user]),
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
