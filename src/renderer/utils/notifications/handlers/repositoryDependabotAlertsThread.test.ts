import { describe, expect, it } from 'vitest';

import { createSubjectMock } from '../../../__mocks__/notifications-mocks';
import { repositoryDependabotAlertsThreadHandler } from './repositoryDependabotAlertsThread';

describe('renderer/utils/notifications/handlers/repositoryDependabotAlertsThread.ts', () => {
  it('iconType', () => {
    expect(
      repositoryDependabotAlertsThreadHandler.iconType(
        createSubjectMock({
          type: 'RepositoryDependabotAlertsThread',
        }),
      ).displayName,
    ).toBe('AlertIcon');
  });
});
