import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import { TagIcon } from '@primer/octicons-react';

import { IconColor, type SettingsState } from '../../../types';
import type {
  GitifySubject,
  Notification,
  StateType,
  Subject,
} from '../../../typesGitHub';
import { getRelease } from '../../api/client';
import { isStateFilteredOut } from '../filters/filter';
import { DefaultHandler } from './default';
import { getSubjectUser } from './utils';

class ReleaseHandler extends DefaultHandler {
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

  getIconColor(_subject: Subject): IconColor {
    return IconColor.GREEN;
  }
}

export const releaseHandler = new ReleaseHandler();
