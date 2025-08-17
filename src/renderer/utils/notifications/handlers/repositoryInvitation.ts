import type { FC } from 'react';

import { MailIcon, type OcticonProps } from '@primer/octicons-react';

import type { SettingsState } from '../../../types';
import type {
  GitifySubject,
  Notification,
  Subject,
} from '../../../typesGitHub';
import type { NotificationTypeHandler } from './types';

class RepositoryInvitationHandler implements NotificationTypeHandler {
  readonly type = 'RepositoryInvitation';

  async enrich(
    _notification: Notification,
    _settings: SettingsState,
  ): Promise<GitifySubject> {
    return;
  }

  getIcon(_subject: Subject): FC<OcticonProps> | null {
    return MailIcon;
  }
}

export const repositoryInvitationHandler = new RepositoryInvitationHandler();
