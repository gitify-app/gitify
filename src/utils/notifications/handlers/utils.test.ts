import { mockAuthor } from '../../api/__mocks__/response-mocks';
import { getNotificationAuthor } from './utils';

describe('renderer/utils/notifications/handlers/utils.ts', () => {
  describe('getNotificationAuthor', () => {
    it('returns null when all users are null', () => {
      const result = getNotificationAuthor([null, null]);

      expect(result).toBeNull();
    });

    it('returns first user', () => {
      const result = getNotificationAuthor([mockAuthor, undefined]);

      expect(result).toEqual({
        login: mockAuthor.login,
        avatarUrl: mockAuthor.avatarUrl,
        htmlUrl: mockAuthor.htmlUrl,
        type: mockAuthor.type,
      });
    });

    it('returns second user if first is undefined', () => {
      const result = getNotificationAuthor([undefined, mockAuthor]);

      expect(result).toEqual({
        login: mockAuthor.login,
        avatarUrl: mockAuthor.avatarUrl,
        htmlUrl: mockAuthor.htmlUrl,
        type: mockAuthor.type,
      });
    });
  });
});
