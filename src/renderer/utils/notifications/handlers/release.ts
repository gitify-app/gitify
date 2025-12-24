import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import { TagIcon } from '@primer/octicons-react';

import type {
  GitifyNotificationState,
  GitifySubject,
  Link,
  SettingsState,
} from '../../../types';
import type { Notification, Subject } from '../../../typesGitHub';
import { getRelease } from '../../api/client';
import { isStateFilteredOut } from '../filters/filter';
import { DefaultHandler } from './default';
import { getNotificationAuthor } from './utils';

class ReleaseHandler extends DefaultHandler {
  readonly type = 'Release';

  async enrich(
    notification: Notification,
    settings: SettingsState,
  ): Promise<GitifySubject> {
    const releaseState: GitifyNotificationState = null; // Release notifications are stateless

    // Return early if this notification would be hidden by filters
    if (isStateFilteredOut(releaseState, settings)) {
      return null;
    }

    const release = (
      await getRelease(notification.subject.url, notification.account.token)
    ).data;

    return {
      state: releaseState,
      user: getNotificationAuthor([release.author]),
    };
  }

  iconType(_subject: Subject): FC<OcticonProps> | null {
    return TagIcon;
  }

  defaultUrl(notification: Notification): Link {
    const url = new URL(notification.repository.html_url);
    url.pathname += '/releases';
    return url.href as Link;
  }
}

export const releaseHandler = new ReleaseHandler();
