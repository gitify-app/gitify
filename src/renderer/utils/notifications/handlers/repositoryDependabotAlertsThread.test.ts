import { mockNotificationWithSubject } from '../../../__mocks__/notifications-mocks';
import { createRepositoryDependabotAlertsThreadHandler } from './repositoryDependabotAlertsThread';

describe('renderer/utils/notifications/handlers/repositoryDependabotAlertsThread.ts', () => {
  it('iconType', () => {
    const handler = createRepositoryDependabotAlertsThreadHandler(
      mockNotificationWithSubject({
        type: 'RepositoryDependabotAlertsThread',
      }),
    );

    expect(handler.iconType().displayName).toBe('AlertIcon');
  });
});
