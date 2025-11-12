import { describe, expect, it } from 'vitest';

import { createSubjectMock } from '../../../__mocks__/notifications-mocks';
import { repositoryInvitationHandler } from './repositoryInvitation';

describe('renderer/utils/notifications/handlers/repositoryInvitation.ts', () => {
  it('iconType', () => {
    expect(
      repositoryInvitationHandler.iconType(
        createSubjectMock({
          type: 'RepositoryInvitation',
        }),
      ).displayName,
    ).toBe('MailIcon');
  });
});
