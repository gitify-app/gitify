import type { FC } from 'react';

import { AlertIcon, type OcticonProps } from '@primer/octicons-react';

import type { GitifyNotification, Link, UserType } from '../../../types';

import { DefaultHandler, defaultHandler } from './default';

class RepositoryAdvisoryHandler extends DefaultHandler {
  override readonly type = 'RepositoryAdvisory';

  override iconType(_notification: GitifyNotification): FC<OcticonProps> {
    return AlertIcon;
  }

  override defaultUrl(notification: GitifyNotification): Link {
    const url = new URL(defaultHandler.defaultUrl(notification));
    url.pathname += '/security/advisories';
    return url.href as Link;
  }

  override defaultUserType(): UserType {
    return 'Bot';
  }
}

export const repositoryAdvisoryHandler = new RepositoryAdvisoryHandler();
