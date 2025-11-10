import { mockNotificationWithSubject } from '../../../__mocks__/notifications-mocks';
import { createRepositoryInvitationHandler } from './repositoryInvitation';

describe('renderer/utils/notifications/handlers/repositoryInvitation.ts', () => {
  it('iconType', () => {
    const handler = createRepositoryInvitationHandler(
      mockNotificationWithSubject({
        type: 'RepositoryInvitation',
      }),
    );

    expect(handler.iconType().displayName).toBe('MailIcon');
  });
});
