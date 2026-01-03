import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import { AlertIcon } from '@primer/octicons-react';

import type { GitifyNotification, Link } from '../../../types';
import { DefaultHandler } from './default';

class RepositoryDependabotAlertsThreadHandler extends DefaultHandler {
  readonly type = 'RepositoryDependabotAlertsThread';

  iconType(_notification: GitifyNotification): FC<OcticonProps> {
    return AlertIcon;
  }

  defaultUrl(notification: GitifyNotification): Link {
    const url = new URL(notification.repository.htmlUrl);
    url.pathname += '/security/dependabot';
    return url.href as Link;
  }
}

export const repositoryDependabotAlertsThreadHandler =
  new RepositoryDependabotAlertsThreadHandler();
