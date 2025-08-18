import { createSubjectMock } from '../../../__mocks__/notifications-mocks';
import { partialMockNotification } from '../../../__mocks__/partial-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import { defaultHandler } from './default';

describe('renderer/utils/notifications/handlers/default.ts', () => {
  describe('enrich', () => {
    it('unhandled subject details', async () => {
      const mockNotification = partialMockNotification({
        title:
          'There is no special subject handling for this notification type',
        type: 'RepositoryInvitation',
      });

      const result = await defaultHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toBeNull();
    });
  });

  it('getIcon', () => {
    expect(defaultHandler.getIcon(createSubjectMock({})).displayName).toBe(
      'QuestionIcon',
    );
  });
});
