import { mockAuthor } from '../__mocks__/response-mocks';

import { IconColor } from '../../../../types';

import type {
  IssueFieldSingleSelectOptionColor,
  IssueTypeColor,
} from '../graphql/generated/graphql';
import {
  getNotificationAuthor,
  mapGitHubColorToIconColor,
  mapIssueFieldColor,
  mapIssueTypeColor,
} from './utils';

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

    it('preserves an enterprise managed user name', () => {
      const result = getNotificationAuthor([
        { ...mockAuthor, type: 'EnterpriseUserAccount', name: 'Notification Author' },
      ]);

      expect(result?.name).toBe('Notification Author');
    });
  });

  describe('mapGitHubColorToIconColor', () => {
    it.each([
      ['RED', IconColor.RED],
      ['ORANGE', IconColor.ORANGE],
      ['YELLOW', IconColor.YELLOW],
      ['GREEN', IconColor.GREEN],
      ['BLUE', IconColor.BLUE],
      ['PURPLE', IconColor.PURPLE],
      ['PINK', IconColor.PINK],
      ['GRAY', IconColor.GRAY],
    ] as const satisfies readonly (readonly [IssueTypeColor, IconColor])[])(
      'maps %s to the expected token via every entry point',
      (color, expected) => {
        expect(mapGitHubColorToIconColor(color)).toBe(expected);
        expect(mapIssueTypeColor(color)).toBe(expected);
        expect(mapIssueFieldColor(color as IssueFieldSingleSelectOptionColor)).toBe(expected);
      },
    );

    it('falls back to gray for a colour Gitify does not know about', () => {
      expect(mapGitHubColorToIconColor('CHARTREUSE' as IssueTypeColor)).toBe(IconColor.GRAY);
      expect(mapIssueTypeColor('CHARTREUSE' as IssueTypeColor)).toBe(IconColor.GRAY);
      expect(mapIssueFieldColor('CHARTREUSE' as IssueFieldSingleSelectOptionColor)).toBe(
        IconColor.GRAY,
      );
    });
  });
});
