import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import { QuestionIcon } from '@primer/octicons-react';

import type { SettingsState } from '../../../types';
import { IconColor } from '../../../types';
import type {
  GitifySubject,
  Notification,
  SubjectType,
} from '../../../typesGitHub';
import type { NotificationTypeHandler } from './types';
import { formatForDisplay } from './utils';

export class DefaultHandler implements NotificationTypeHandler {
  type?: SubjectType;

  async enrich(
    _notification: Notification,
    _settings: SettingsState,
  ): Promise<GitifySubject> {
    return null;
  }

  iconType(_notification: Notification): FC<OcticonProps> | null {
    return QuestionIcon;
  }

  iconColor(notification: Notification): IconColor {
    switch (notification.subject.state) {
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

  formattedNotificationType(notification: Notification): string {
    return formatForDisplay([
      notification.subject.state,
      notification.subject.type,
    ]);
  }
  formattedNotificationNumber(notification: Notification): string {
    return notification.subject?.number
      ? `#${notification.subject.number}`
      : '';
  }
  formattedNotificationTitle(notification: Notification): string {
    let title = notification.subject.title;

    if (notification.subject?.number) {
      title = `${title} [${this.formattedNotificationNumber(notification)}]`;
    }
    return title;
  }
}

export const defaultHandler = new DefaultHandler();
