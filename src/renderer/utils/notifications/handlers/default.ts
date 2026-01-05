import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import { QuestionIcon } from '@primer/octicons-react';

import {
  type GitifyNotification,
  type GitifySubject,
  IconColor,
  type Link,
  type SettingsState,
  type SubjectType,
} from '../../../types';
import type { NotificationTypeHandler } from './types';
import { formatForDisplay } from './utils';

export class DefaultHandler implements NotificationTypeHandler {
  type?: SubjectType;

  supportsMergedQueryEnrichment?: boolean = false;

  async enrich(
    _notification: GitifyNotification,
    _settings: SettingsState,
  ): Promise<Partial<GitifySubject>> {
    return {};
  }

  iconType(_notification: GitifyNotification): FC<OcticonProps> {
    return QuestionIcon;
  }

  iconColor(_notification: GitifyNotification): IconColor {
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
    const number = this.formattedNotificationNumber(notification);

    if (number.length > 0) {
      title = `${title} [${number}]`;
    }

    return title;
  }

  defaultUrl(notification: GitifyNotification): Link {
    return notification.repository.htmlUrl;
  }
}

export const defaultHandler = new DefaultHandler();
