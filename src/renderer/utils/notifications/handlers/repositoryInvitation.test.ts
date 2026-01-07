import { mockPartialGitifyNotification } from '../../../__mocks__/notifications-mocks';
import type { GitifyNotification, Link } from '../../../types';
import { repositoryInvitationHandler } from './repositoryInvitation';

describe('renderer/utils/notifications/handlers/repositoryInvitation.ts', () => {
  it('iconType', () => {
    const mockNotification = mockPartialGitifyNotification({
      type: 'RepositoryInvitation',
    });

    expect(
      repositoryInvitationHandler.iconType(mockNotification).displayName,
    ).toBe('MailIcon');
  });

  it('defaultUrl', () => {
    const mockHtmlUrl =
      'https://github.com/gitify-app/notifications-test' as Link;

    expect(
      repositoryInvitationHandler.defaultUrl({
        repository: {
          htmlUrl: mockHtmlUrl,
        },
      } as GitifyNotification),
    ).toEqual(`${mockHtmlUrl}/invitations`);
  });
});
