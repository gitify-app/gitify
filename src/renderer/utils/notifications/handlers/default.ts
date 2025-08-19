import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import { QuestionIcon } from '@primer/octicons-react';

import type { SettingsState } from '../../../types';
import { IconColor } from '../../../types';
import type {
  GitifySubject,
  Notification,
  Subject,
} from '../../../typesGitHub';
import type { NotificationTypeHandler } from './types';

export class DefaultHandler implements NotificationTypeHandler {
  async enrich(
    _notification: Notification,
    _settings: SettingsState,
  ): Promise<GitifySubject> {
    return null;
  }

  getIcon(_subject: Subject): FC<OcticonProps> | null {
    return QuestionIcon;
  }

  getIconColor(subject: Subject): IconColor {
    switch (subject.state) {
      case 'open':
      case 'reopened':
      case 'ANSWERED':
      case 'success':
        return IconColor.GREEN;
      case 'closed':
      case 'failure':
        return IconColor.RED;
      case 'completed':
      case 'RESOLVED':
      case 'merged':
        return IconColor.PURPLE;
      default:
        return IconColor.GRAY;
    }
  }
}

export const defaultHandler = new DefaultHandler();
