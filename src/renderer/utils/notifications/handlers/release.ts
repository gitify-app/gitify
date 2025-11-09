import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import { TagIcon } from '@primer/octicons-react';

import type { SettingsState } from '../../../types';
import type {
  GitifySubject,
  Notification,
  StateType,
} from '../../../typesGitHub';
import { getRelease } from '../../api/client';
import { isStateFilteredOut } from '../filters/filter';
import { DefaultHandler } from './default';
import type { NotificationTypeHandler } from './types';
import { getSubjectUser } from './utils';

class ReleaseHandler extends DefaultHandler {
  readonly type = 'Release';

  async enrich(settings: SettingsState): Promise<GitifySubject> {
    const releaseState: StateType = null; // Release notifications are stateless

    // Return early if this notification would be hidden by filters
    if (isStateFilteredOut(releaseState, settings)) {
      return null;
    }

    const release = (
      await getRelease(
        this.notification.subject.url,
        this.notification.account.token,
      )
    ).data;

    return {
      state: releaseState,
      user: getSubjectUser([release.author]),
    };
  }

  iconType(): FC<OcticonProps> | null {
    return TagIcon;
  }
}

export function createReleaseHandler(
  notification: Notification,
): NotificationTypeHandler {
  return new ReleaseHandler(notification);
}
