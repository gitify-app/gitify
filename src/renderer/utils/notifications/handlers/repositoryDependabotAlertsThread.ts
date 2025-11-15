import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import { AlertIcon } from '@primer/octicons-react';

import type { Notification } from '../../../typesGitHub';
import { DefaultHandler } from './default';
import type { NotificationTypeHandler } from './types';

class RepositoryDependabotAlertsThreadHandler extends DefaultHandler {
  readonly type = 'RepositoryDependabotAlertsThread';

  iconType(): FC<OcticonProps> | null {
    return AlertIcon;
  }
}

export function createRepositoryDependabotAlertsThreadHandler(
  notification: Notification,
): NotificationTypeHandler {
  return new RepositoryDependabotAlertsThreadHandler(notification);
}
