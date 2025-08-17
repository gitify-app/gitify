import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';

import type { Link, SettingsState } from '../../../types';
import type {
  GitifySubject,
  Notification,
  Subject,
  SubjectType,
} from '../../../typesGitHub';

export interface NotificationTypeHandler {
  readonly type?: SubjectType;

  /**
   * Enrich a notification. Settings may be unused for some handlers.
   */
  enrich(
    notification: Notification,
    settings: SettingsState,
  ): Promise<GitifySubject>;

  /** Return an icon component for this notification type. */
  getIcon(subject: Subject): FC<OcticonProps> | null;

  /** Build a URL for this notification type (subject urls / comments resolved separately upstream). */
  buildUrl?(notification: Notification): Promise<Link> | Link;

  /** Optional color helper if we later move color logic into handlers. */
  getIconColor?(subject: Subject): string | undefined;
}
