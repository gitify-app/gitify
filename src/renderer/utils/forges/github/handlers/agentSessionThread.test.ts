import { AgentIcon, CopilotIcon } from '@primer/octicons-react';

import { mockPartialGitifyNotification } from '../../../../__mocks__/notifications-mocks';

import type { GitifyNotification } from '../../../../types';
import { IconColor } from '../../../../types';

import { userTypeFilter } from '../../../notifications/filters/userType';
import { agentSessionThreadHandler, getAgentSessionUrl } from './agentSessionThread';

describe('renderer/utils/notifications/handlers/agentSessionThread.ts', () => {
  describe('enrich', () => {
    it('synthesizes the Copilot actor as a Bot so the user-type filter classifies it', () => {
      const notification = mockPartialGitifyNotification({ type: 'AgentSessionThread' });

      const result = agentSessionThreadHandler.enrich(notification);

      expect(result.author?.type).toBe('Bot');
      expect(result.author?.login).toBe('copilot');
    });

    it('classifies as Bot in the user type filter after enrichment', () => {
      const notification = mockPartialGitifyNotification({ type: 'AgentSessionThread' });
      const enriched = {
        ...notification,
        subject: { ...notification.subject, ...agentSessionThreadHandler.enrich(notification) },
      };

      expect(userTypeFilter.classify(enriched)).toBe('Bot');
      expect(userTypeFilter.filterNotification(enriched, 'Bot')).toBe(true);
    });
  });

  it('iconType', () => {
    const notification = mockPartialGitifyNotification({ type: 'AgentSessionThread' });

    expect(agentSessionThreadHandler.iconType(notification)).toBe(AgentIcon);
    expect(agentSessionThreadHandler.iconType(notification).displayName).toBe('AgentIcon');
  });

  it('iconColor', () => {
    const notification = mockPartialGitifyNotification({ type: 'AgentSessionThread' });

    expect(agentSessionThreadHandler.iconColor(notification)).toBe(IconColor.GRAY);
  });

  it('defaultUserType', () => {
    expect(agentSessionThreadHandler.defaultUserType()).toBe('Bot');
  });

  it('defaultUserIcon', () => {
    expect(agentSessionThreadHandler.defaultUserIcon()).toBe(CopilotIcon);
  });

  describe('defaultUrl', () => {
    it('returns the repository agents tab', () => {
      const notification = mockPartialGitifyNotification({ type: 'AgentSessionThread' });

      expect(agentSessionThreadHandler.defaultUrl(notification)).toBe(
        'https://github.com/gitify-app/notifications-test/agents',
      );
    });

    it('falls back to the repository URL when the repository html url is unavailable', () => {
      const notification = { repository: {} } as GitifyNotification;

      expect(getAgentSessionUrl(notification)).toBeUndefined();
    });
  });
});
