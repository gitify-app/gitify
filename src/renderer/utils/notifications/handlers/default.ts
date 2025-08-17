import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import { QuestionIcon } from '@primer/octicons-react';

import type { SettingsState } from '../../../types';
import type {
  GitifySubject,
  Notification,
  Subject,
} from '../../../typesGitHub';
import type { NotificationTypeHandler } from './types';

class DefaultHandler implements NotificationTypeHandler {
  async enrich(
    _notification: Notification,
    _settings: SettingsState,
  ): Promise<GitifySubject> {
    return;
  }

  getIcon(_subject: Subject): FC<OcticonProps> | null {
    return QuestionIcon;
  }
}

export const defaultHandler = new DefaultHandler();
