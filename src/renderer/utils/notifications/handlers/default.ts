import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import { QuestionIcon } from '@primer/octicons-react';

import type {
  GitifyNotification,
  GitifySubject,
  Link,
  SettingsState,
} from '../../../types';
import { IconColor } from '../../../types';
import type { SubjectType } from '../../../typesGitHub';
import type { NotificationTypeHandler } from './types';
import { formatForDisplay } from './utils';

export class DefaultHandler implements NotificationTypeHandler {
  type?: SubjectType;

  async enrich(
    _notification: GitifyNotification,
    _settings: SettingsState,
  ): Promise<Partial<GitifySubject>> {
    return {};
  }

  iconType(_subject: GitifySubject): FC<OcticonProps> | null {
    return QuestionIcon;
  }

  iconColor(_subject: GitifySubject): IconColor {
    return IconColor.GRAY;
  }

  formattedNotificationType(notification: GitifyNotification): string {
    return formatForDisplay([
      notification.subject.state,
      notification.subject.type,
    ]);
  }

  formattedNotificationNumber(notification: GitifyNotification): string {
    return notification.subject?.number
      ? `#${notification.subject.number}`
      : '';
  }

  formattedNotificationTitle(notification: GitifyNotification): string {
    let title = notification.subject.title;

    if (notification.subject?.number) {
      title = `${title} [${this.formattedNotificationNumber(notification)}]`;
    }
    return title;
  }

  defaultUrl(notification: GitifyNotification): Link {
    return notification.repository.htmlUrl;
  }
}

export const defaultHandler = new DefaultHandler();
