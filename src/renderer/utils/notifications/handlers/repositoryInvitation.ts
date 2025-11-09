import type { FC } from 'react';

import { MailIcon, type OcticonProps } from '@primer/octicons-react';

import type { Notification } from '../../../typesGitHub';
import { DefaultHandler } from './default';
import type { NotificationTypeHandler } from './types';

class RepositoryInvitationHandler extends DefaultHandler {
  readonly type = 'RepositoryInvitation';

  iconType(): FC<OcticonProps> | null {
    return MailIcon;
  }
}

export function createRepositoryInvitationHandler(
  notification: Notification,
): NotificationTypeHandler {
  return new RepositoryInvitationHandler(notification);
}
