import { createMockSubject } from '../../../__mocks__/notifications-mocks';
import type { Link } from '../../../types';
import type { Notification } from '../../../typesGitHub';
import { repositoryInvitationHandler } from './repositoryInvitation';

describe('renderer/utils/notifications/handlers/repositoryInvitation.ts', () => {
  it('iconType', () => {
    expect(
      repositoryInvitationHandler.iconType(
        createMockSubject({
          type: 'RepositoryInvitation',
        }),
      ).displayName,
    ).toBe('MailIcon');
  });

  it('defaultUrl', () => {
    const mockHtmlUrl =
      'https://github.com/gitify-app/notifications-test' as Link;

    expect(
      repositoryInvitationHandler.defaultUrl({
        repository: {
          html_url: mockHtmlUrl,
        },
      } as Notification),
    ).toEqual(`${mockHtmlUrl}/invitations`);
  });
});
