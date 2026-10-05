import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import { AgentIcon, CopilotIcon } from '@primer/octicons-react';

import {
  type GitifyNotification,
  type GitifyNotificationUser,
  type GitifySubject,
  IconColor,
  type Link,
  type UserType,
} from '../../../../types';

import { DefaultHandler } from './default';

/**
 * The Copilot agent that owns an agent-session thread. Synthesized locally:
 * the notification payload does not carry an actor, and no API request is made.
 */
const COPILOT_AGENT: GitifyNotificationUser = {
  login: 'copilot',
  name: 'Copilot',
  avatarUrl: 'https://github.com/copilot.png' as Link,
  htmlUrl: 'https://github.com/apps/copilot' as Link,
  type: 'Bot',
};

class AgentSessionThreadHandler extends DefaultHandler {
  override enrich(_notification: GitifyNotification): Partial<GitifySubject> {
    // Route the actor through the user-type taxonomy so the User Type filter
    // classifies agent sessions as Bot. No network request is made.
    return { author: COPILOT_AGENT };
  }

  override iconType(_notification: GitifyNotification): FC<OcticonProps> {
    return AgentIcon;
  }

  override iconColor(_notification: GitifyNotification): IconColor {
    return IconColor.GRAY;
  }

  override defaultUrl(notification: GitifyNotification): Link {
    return getAgentSessionUrl(notification);
  }

  override defaultUserType(): UserType {
    return 'Bot';
  }

  override defaultUserIcon(): FC<OcticonProps> {
    return CopilotIcon;
  }
}

export const agentSessionThreadHandler = new AgentSessionThreadHandler();

/**
 * Deep link for an agent-session notification.
 *
 * The notification thread carries no task or session identifier, so we cannot
 * link to an individual session. Open the repository's agents tab instead,
 * derived from the repository URL.
 */
export function getAgentSessionUrl(notification: GitifyNotification): Link {
  const repositoryUrl = notification.repository?.htmlUrl;

  if (!repositoryUrl) {
    return repositoryUrl as Link;
  }

  return `${repositoryUrl.replace(/\/+$/, '')}/agents` as Link;
}
