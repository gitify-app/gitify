import type { FC } from 'react';

import { MailIcon, type OcticonProps } from '@primer/octicons-react';

import type { GitifyNotification, Link } from '../../../types';

import { DefaultHandler, defaultHandler } from './default';

class RepositoryInvitationHandler extends DefaultHandler {
  override iconType(_notification: GitifyNotification): FC<OcticonProps> {
    return MailIcon;
  }

  override defaultUrl(notification: GitifyNotification): Link {
    const url = new URL(defaultHandler.defaultUrl(notification));
    url.pathname += '/invitations';
    return url.href as Link;
  }
}

export const repositoryInvitationHandler = new RepositoryInvitationHandler();
