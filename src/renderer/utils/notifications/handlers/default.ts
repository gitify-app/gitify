import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import { QuestionIcon } from '@primer/octicons-react';

import type { GitifySubject, Link, SettingsState } from '../../../types';
import { IconColor } from '../../../types';
import type { Notification, Subject, SubjectType } from '../../../typesGitHub';
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

  iconType(_subject: Subject): FC<OcticonProps> | null {
    return QuestionIcon;
  }

  iconColor(subject: Subject): IconColor {
    switch (subject.state) {
      case 'OPEN':
      case 'REOPENED':
      case 'ANSWERED':
      case 'SUCCESS':
        return IconColor.GREEN;
      case 'CLOSED':
      case 'FAILURE':
        return IconColor.RED;
      case 'COMPLETED':
      case 'RESOLVED':
      case 'MERGED':
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

  defaultUrl(notification: Notification): Link {
    return notification.repository.html_url as Link;
  }
}

export const defaultHandler = new DefaultHandler();
