import { createMockGraphQLAuthor } from '../../../__mocks__/user-mocks';
import { formatForDisplay, getNotificationAuthor } from './utils';

describe('renderer/utils/notifications/handlers/utils.ts', () => {
  describe('getNotificationAuthor', () => {
    const mockAuthor = createMockGraphQLAuthor('some-author');

    it('returns null when all users are null', () => {
      const result = getNotificationAuthor([null, null]);

      expect(result).toBeNull();
    });

    it('returns first user', () => {
      const result = getNotificationAuthor([mockAuthor, null]);

      expect(result).toEqual({
        login: mockAuthor.login,
        htmlUrl: mockAuthor.html_url,
        avatarUrl: mockAuthor.avatar_url,
        type: mockAuthor.type,
      });
    });

    it('returns second user if first is null', () => {
      const result = getNotificationAuthor([null, mockAuthor]);

      expect(result).toEqual({
        login: mockAuthor.login,
        htmlUrl: mockAuthor.html_url,
        avatarUrl: mockAuthor.avatar_url,
        type: mockAuthor.type,
      });
    });
  });

  it('formatForDisplay', () => {
    expect(formatForDisplay(null)).toBe('');
    expect(formatForDisplay([])).toBe('');
    expect(formatForDisplay(['open', 'PullRequest'])).toBe('Open Pull Request');
    expect(formatForDisplay(['OUTDATED', 'Discussion'])).toBe(
      'Outdated Discussion',
    );
    expect(formatForDisplay(['not_planned', 'Issue'])).toBe(
      'Not Planned Issue',
    );
  });
});
