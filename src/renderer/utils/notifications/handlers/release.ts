import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import { TagIcon } from '@primer/octicons-react';

import type { SettingsState } from '../../../types';
import type {
  GitifySubject,
  Notification,
  StateType,
  Subject,
} from '../../../typesGitHub';
import { getRelease } from '../../api/client';
import { isStateFilteredOut } from '../filters/filter';
import type { NotificationTypeHandler } from './types';
import { getSubjectUser } from './utils';

class ReleaseHandler implements NotificationTypeHandler {
  readonly type = 'Release';

  async enrich(
    notification: Notification,
    settings: SettingsState,
  ): Promise<GitifySubject> {
    const releaseState: StateType = null; // Release notifications are stateless

    // Return early if this notification would be hidden by filters
    if (isStateFilteredOut(releaseState, settings)) {
      return null;
    }

    const release = (
      await getRelease(notification.subject.url, notification.account.token)
    ).data;

    return {
      state: releaseState,
      user: getSubjectUser([release.author]),
    };
  }

  getIcon(_subject: Subject): FC<OcticonProps> | null {
    return TagIcon;
  }
}

export const releaseHandler = new ReleaseHandler();
