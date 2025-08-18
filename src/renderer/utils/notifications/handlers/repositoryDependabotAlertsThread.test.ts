import { createSubjectMock } from '../../../__mocks__/notifications-mocks';
import { repositoryDependabotAlertsThreadHandler } from './repositoryDependabotAlertsThread';

describe('renderer/utils/notifications/handlers/repositoryDependabotAlertsThread.ts', () => {
  it('getIcon', () => {
    expect(
      repositoryDependabotAlertsThreadHandler.getIcon(
        createSubjectMock({
          type: 'RepositoryDependabotAlertsThread',
        }),
      ).displayName,
    ).toBe('AlertIcon');
  });
});
