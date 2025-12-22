import { createMockSubject } from '../../../__mocks__/notifications-mocks';
import type { Link } from '../../../types';
import type { Notification } from '../../../typesGitHub';
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

  it('defaultUrl', () => {
    const mockHtmlUrl =
      'https://github.com/gitify-app/notifications-test' as Link;

    expect(
      repositoryDependabotAlertsThreadHandler.defaultUrl({
        repository: {
          html_url: mockHtmlUrl,
        },
      } as Notification),
    ).toEqual(`${mockHtmlUrl}/security/dependabot`);
  });
});
