import { partialMockUser } from '../../../__mocks__/partial-mocks';
import { getSubjectUser } from './utils';

describe('renderer/utils/notifications/handlers/utils.ts', () => {
  describe('getSubjectUser', () => {
    const mockAuthor = partialMockUser('some-author');

    it('returns null when all users are null', () => {
      const result = getSubjectUser([null, null]);

      expect(result).toBeNull();
    });

    it('returns first user', () => {
      const result = getSubjectUser([mockAuthor, null]);

      expect(result).toEqual({
        login: mockAuthor.login,
        html_url: mockAuthor.html_url,
        avatar_url: mockAuthor.avatar_url,
        type: mockAuthor.type,
      });
    });

    it('returns second user if first is null', () => {
      const result = getSubjectUser([null, mockAuthor]);

      expect(result).toEqual({
        login: mockAuthor.login,
        html_url: mockAuthor.html_url,
        avatar_url: mockAuthor.avatar_url,
        type: mockAuthor.type,
      });
    });
  });
});
