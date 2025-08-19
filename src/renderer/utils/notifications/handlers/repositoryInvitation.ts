import type { FC } from 'react';

import { MailIcon, type OcticonProps } from '@primer/octicons-react';

import type { Subject } from '../../../typesGitHub';
import { DefaultHandler } from './default';

class RepositoryInvitationHandler extends DefaultHandler {
  readonly type = 'RepositoryInvitation';

  getIcon(_subject: Subject): FC<OcticonProps> | null {
    return MailIcon;
  }
}

export const repositoryInvitationHandler = new RepositoryInvitationHandler();
