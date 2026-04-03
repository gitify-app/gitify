import { mockAuthor } from '../../api/__mocks__/response-mocks';

import { getNotificationAuthor } from './utils';

describe('renderer/utils/notifications/handlers/utils.ts', () => {
  describe('getNotificationAuthor', () => {
    it('returns undefined when all users are null', () => {
      const result = getNotificationAuthor([null, null]);

      expect(result).toBeUndefined();
    });

    it('returns first user', () => {
      const result = getNotificationAuthor([mockAuthor, null]);

      expect(result).toEqual({
        login: mockAuthor.login,
        avatarUrl: mockAuthor.avatarUrl,
        htmlUrl: mockAuthor.htmlUrl,
        type: mockAuthor.type,
      });
    });

    it('returns second user if first is null', () => {
      const result = getNotificationAuthor([null, mockAuthor]);

      expect(result).toEqual({
        login: mockAuthor.login,
        avatarUrl: mockAuthor.avatarUrl,
        htmlUrl: mockAuthor.htmlUrl,
        type: mockAuthor.type,
      });
    });
  });
});
