import { createMockNotificationUser } from '../../../__mocks__/user-mocks';
import { formatForDisplay, getNotificationAuthor } from './utils';

describe('renderer/utils/notifications/handlers/utils.ts', () => {
  describe('getNotificationAuthor', () => {
    const mockAuthor = createMockNotificationUser('some-author');

    it('returns undefined when all users are undefined', () => {
      const result = getNotificationAuthor([undefined, undefined]);

      expect(result).toBeUndefined();
    });

    it('returns first user', () => {
      const result = getNotificationAuthor([mockAuthor, undefined]);

      expect(result).toEqual({
        login: mockAuthor.login,
        htmlUrl: mockAuthor.htmlUrl,
        avatarUrl: mockAuthor.avatarUrl,
        type: mockAuthor.type,
      });
    });

    it('returns second user if first is undefined', () => {
      const result = getNotificationAuthor([undefined, mockAuthor]);

      expect(result).toEqual({
        login: mockAuthor.login,
        htmlUrl: mockAuthor.htmlUrl,
        avatarUrl: mockAuthor.avatarUrl,
        type: mockAuthor.type,
      });
    });
  });

  it('formatForDisplay', () => {
    expect(formatForDisplay([])).toBe('');
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
