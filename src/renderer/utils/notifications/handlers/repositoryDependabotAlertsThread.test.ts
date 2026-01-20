import { mockPartialGitifyNotification } from '../../../__mocks__/notifications-mocks';

import type { GitifyNotification, Link } from '../../../types';

import { repositoryDependabotAlertsThreadHandler } from './repositoryDependabotAlertsThread';

describe('renderer/utils/notifications/handlers/repositoryDependabotAlertsThread.ts', () => {
  it('iconType', () => {
    const mockNotification = mockPartialGitifyNotification({
      type: 'RepositoryDependabotAlertsThread',
    });

    expect(
      repositoryDependabotAlertsThreadHandler.iconType(mockNotification)
        .displayName,
    ).toBe('AlertIcon');
  });

  it('defaultUrl', () => {
    const mockHtmlUrl =
      'https://github.com/gitify-app/notifications-test' as Link;

    expect(
      repositoryDependabotAlertsThreadHandler.defaultUrl({
        repository: {
          htmlUrl: mockHtmlUrl,
        },
      } as GitifyNotification),
    ).toEqual(`${mockHtmlUrl}/security/dependabot`);
  });

  it('defaultUserType', () => {
    expect(repositoryDependabotAlertsThreadHandler.defaultUserType()).toEqual(
      'Bot',
    );
  });
});
