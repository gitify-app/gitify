import { createMockSubject } from '../../../__mocks__/notifications-mocks';
import { repositoryDependabotAlertsThreadHandler } from './repositoryDependabotAlertsThread';

describe('renderer/utils/notifications/handlers/repositoryDependabotAlertsThread.ts', () => {
  it('iconType', () => {
    expect(
      repositoryDependabotAlertsThreadHandler.iconType(
        createMockSubject({
          type: 'RepositoryDependabotAlertsThread',
        }),
      ).displayName,
    ).toBe('AlertIcon');
  });
});
