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
  notification: Notification;

  constructor(notification: Notification) {
    this.notification = notification;
  }

  async enrich(_settings: SettingsState): Promise<GitifySubject> {
    return null;
  }

  iconType(): FC<OcticonProps> | null {
    return QuestionIcon;
  }

  iconColor(): IconColor {
    switch (this.notification.subject.state) {
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

  formattedNotificationType(): string {
    return formatForDisplay([
      this.notification.subject.state,
      this.notification.subject.type,
    ]);
  }
  formattedNotificationNumber(): string {
    return this.notification.subject?.number
      ? `#${this.notification.subject.number}`
      : '';
  }
  formattedNotificationTitle(): string {
    let title = this.notification.subject.title;

    if (this.notification.subject?.number) {
      title = `${title} [${this.formattedNotificationNumber()}]`;
    }
    return title;
  }
}

export function createDefaultHandler(
  notification: Notification,
): NotificationTypeHandler {
  return new DefaultHandler(notification);
}
