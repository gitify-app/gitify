import { CopilotIcon } from '@primer/octicons-react';

import { mockPartialGitifyNotification } from '../../__mocks__/notifications-mocks';

import type { Link } from '../../types';

import { formatNotification } from './formatNotification';

describe('renderer/utils/notifications/formatNotification.ts', () => {
  it('formatNotification', () => {
    const mockNotification = mockPartialGitifyNotification({
      title: 'This is a mock discussion',
      type: 'Discussion',
      url: 'https://api.github.com/repos/gitify-app/notifications-test/discussions/123' as Link,
      latestCommentUrl: null,
    });

    const formatted = formatNotification(mockNotification);

    expect(formatted.display).toBeDefined();
    expect(formatted.display.title).toBe('This is a mock discussion');
    expect(formatted.display.type).toBe('Discussion');
    expect(formatted.display.identifier).toBe('');
    expect(formatted.display.defaultUserType).toBe('User');
  });

  it('formatNotification copies the handler-provided actor icon into display', () => {
    const mockNotification = mockPartialGitifyNotification({
      type: 'AgentSessionThread',
    });

    const formatted = formatNotification(mockNotification);

    expect(formatted.display.defaultUserType).toBe('Bot');
    expect(formatted.display.defaultUserIcon).toBe(CopilotIcon);
  });
});
