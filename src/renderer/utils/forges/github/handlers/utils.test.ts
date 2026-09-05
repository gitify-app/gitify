import { mockAuthor } from '../__mocks__/response-mocks';

import { IconColor } from '../../../../types';

import type {
  IssueFieldSingleSelectOptionColor,
  IssueTypeColor,
} from '../graphql/generated/graphql';
import { getNotificationAuthor, mapIssueFieldColorToHex, mapIssueTypeColor } from './utils';

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

  describe('mapIssueTypeColor', () => {
    it.each([
      ['RED', IconColor.RED],
      ['GREEN', IconColor.GREEN],
      ['YELLOW', IconColor.YELLOW],
      ['ORANGE', IconColor.YELLOW],
      ['BLUE', IconColor.PURPLE],
      ['PURPLE', IconColor.PURPLE],
      ['PINK', IconColor.PURPLE],
      ['GRAY', IconColor.GRAY],
    ] satisfies [IssueTypeColor, IconColor][])(
      'maps %s to the expected token',
      (color, expected) => {
        expect(mapIssueTypeColor(color)).toBe(expected);
      },
    );

    it('falls back to gray for a colour Gitify does not know about', () => {
      expect(mapIssueTypeColor('CHARTREUSE' as IssueTypeColor)).toBe(IconColor.GRAY);
    });
  });

  describe('mapIssueFieldColorToHex', () => {
    it.each([
      ['RED', 'cf222e'],
      ['GREEN', '1a7f37'],
      ['YELLOW', 'bf8700'],
      ['ORANGE', 'bc4c00'],
      ['BLUE', '0969da'],
      ['PURPLE', '8250df'],
      ['PINK', 'bf3989'],
      ['GRAY', '6e7781'],
    ] as const satisfies readonly (readonly [IssueFieldSingleSelectOptionColor, string])[])(
      'maps %s to its hex color',
      (color, expected) => {
        expect(mapIssueFieldColorToHex(color)).toBe(expected);
      },
    );

    it('falls back to gray for a colour Gitify does not know about', () => {
      expect(mapIssueFieldColorToHex('CHARTREUSE' as IssueFieldSingleSelectOptionColor)).toBe(
        '6e7781',
      );
    });
  });
});
