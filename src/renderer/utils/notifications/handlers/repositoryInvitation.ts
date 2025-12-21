import type { FC } from 'react';

import { MailIcon, type OcticonProps } from '@primer/octicons-react';

import type { Link } from '../../../types';
import type { Notification, Subject } from '../../../typesGitHub';
import { DefaultHandler } from './default';

class RepositoryInvitationHandler extends DefaultHandler {
  readonly type = 'RepositoryInvitation';

  iconType(_subject: Subject): FC<OcticonProps> | null {
    return MailIcon;
  }

  defaultUrl(notification: Notification): Link {
    const url = new URL(notification.repository.html_url);
    url.pathname += '/invitations';
    return url.href as Link;
  }
}

export const repositoryInvitationHandler = new RepositoryInvitationHandler();
