import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import { AlertIcon } from '@primer/octicons-react';

import type { Link } from '../../../types';
import type { Notification, Subject } from '../../../typesGitHub';
import { DefaultHandler } from './default';

class RepositoryDependabotAlertsThreadHandler extends DefaultHandler {
  readonly type = 'RepositoryDependabotAlertsThread';

  iconType(_subject: Subject): FC<OcticonProps> | null {
    return AlertIcon;
  }

  defaultUrl(notification: Notification): Link {
    const url = new URL(notification.repository.html_url);
    url.pathname += '/security/dependabot';
    return url.href as Link;
  }
}

export const repositoryDependabotAlertsThreadHandler =
  new RepositoryDependabotAlertsThreadHandler();
