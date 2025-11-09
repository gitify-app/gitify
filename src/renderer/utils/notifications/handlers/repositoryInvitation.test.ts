import { mockNotificationWithSubject } from '../../../__mocks__/notifications-mocks';
import { repositoryInvitationHandler } from './repositoryInvitation';

describe('renderer/utils/notifications/handlers/repositoryInvitation.ts', () => {
  it('iconType', () => {
    expect(
      repositoryInvitationHandler.iconType(
        mockNotificationWithSubject({
          type: 'RepositoryInvitation',
        }),
      ).displayName,
    ).toBe('MailIcon');
  });
});
