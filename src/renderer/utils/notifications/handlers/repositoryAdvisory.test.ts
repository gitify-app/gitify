import { mockPartialGitifyNotification } from '../../../__mocks__/notifications-mocks';

import type { GitifyNotification, Link } from '../../../types';

import { repositoryAdvisoryHandler } from './repositoryAdvisory';

describe('renderer/utils/notifications/handlers/repositoryAdvisory.ts', () => {
  it('iconType', () => {
    const mockNotification = mockPartialGitifyNotification({
      type: 'RepositoryAdvisory',
    });

    expect(
      repositoryAdvisoryHandler.iconType(mockNotification).displayName,
    ).toBe('AlertIcon');
  });

  it('defaultUrl', () => {
    const mockHtmlUrl =
      'https://github.com/gitify-app/notifications-test' as Link;

    expect(
      repositoryAdvisoryHandler.defaultUrl({
        repository: {
          htmlUrl: mockHtmlUrl,
        },
      } as GitifyNotification),
    ).toEqual(`${mockHtmlUrl}/security/advisories`);
  });

  it('defaultUserType', () => {
    expect(repositoryAdvisoryHandler.defaultUserType()).toEqual('Bot');
  });
});
