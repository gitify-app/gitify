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
  type UserType,
} from '../../../types';
import type { NotificationTypeHandler } from './types';

export class DefaultHandler implements NotificationTypeHandler {
  type?: SubjectType;

  supportsMergedQueryEnrichment?: boolean = false;

  async enrich(
    _notification: GitifyNotification,
    _settings: SettingsState,
  ): Promise<Partial<GitifySubject> | null> {
    return null;
  }

  iconType(_notification: GitifyNotification): FC<OcticonProps> {
    return QuestionIcon;
  }

  iconColor(_notification: GitifyNotification): IconColor {
    return IconColor.GRAY;
  }

  defaultUrl(notification: GitifyNotification): Link {
    return notification.repository.htmlUrl;
  }

  defaultUserType(): UserType {
    return 'User';
  }
}

export const defaultHandler = new DefaultHandler();
