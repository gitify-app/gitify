import type { FC } from 'react';

import { MailIcon, type OcticonProps } from '@primer/octicons-react';

import type { GitifyNotification, GitifySubject, Link } from '../../../types';
import { DefaultHandler, defaultHandler } from './default';

class RepositoryInvitationHandler extends DefaultHandler {
  readonly type = 'RepositoryInvitation';

  iconType(_subject: GitifySubject): FC<OcticonProps> | null {
    return MailIcon;
  }

  defaultUrl(notification: GitifyNotification): Link {
    const url = new URL(defaultHandler.defaultUrl(notification));
    url.pathname += '/invitations';
    return url.href as Link;
  }
}

export const repositoryInvitationHandler = new RepositoryInvitationHandler();
