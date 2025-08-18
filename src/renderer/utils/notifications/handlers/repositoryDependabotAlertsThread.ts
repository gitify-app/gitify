import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import { AlertIcon } from '@primer/octicons-react';

import type { SettingsState } from '../../../types';
import type {
  GitifySubject,
  Notification,
  Subject,
} from '../../../typesGitHub';
import type { NotificationTypeHandler } from './types';

class RepositoryDependabotAlertsThreadHandler
  implements NotificationTypeHandler
{
  readonly type = 'RepositoryDependabotAlertsThread';

  async enrich(
    _notification: Notification,
    _settings: SettingsState,
  ): Promise<GitifySubject> {
    return;
  }

  getIcon(_subject: Subject): FC<OcticonProps> | null {
    return AlertIcon;
  }
}

export const repositoryDependabotAlertsThreadHandler =
  new RepositoryDependabotAlertsThreadHandler();
