import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import { AlertIcon } from '@primer/octicons-react';

import type { GitifyNotification, GitifySubject, Link } from '../../../types';
import { DefaultHandler, defaultHandler } from './default';

class RepositoryDependabotAlertsThreadHandler extends DefaultHandler {
  readonly type = 'RepositoryDependabotAlertsThread';

  iconType(_subject: GitifySubject): FC<OcticonProps> | null {
    return AlertIcon;
  }

  defaultUrl(notification: GitifyNotification): Link {
    const url = new URL(defaultHandler.defaultUrl(notification));
    url.pathname += '/security/dependabot';
    return url.href as Link;
  }
}

export const repositoryDependabotAlertsThreadHandler =
  new RepositoryDependabotAlertsThreadHandler();
