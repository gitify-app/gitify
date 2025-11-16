import { createMockSubject } from '../../../__mocks__/notifications-mocks';
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
});
