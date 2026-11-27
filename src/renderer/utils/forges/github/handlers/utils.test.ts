import { mockAuthor } from '../__mocks__/response-mocks';

import { IconColor } from '../../../../types';

import type {
  IssueFieldSingleSelectOptionColor,
  IssueTypeColor,
} from '../graphql/generated/graphql';
import {
  getNotificationAuthor,
  mapIssueFieldColor,
  mapIssueStatus,
  mapIssueStatusColor,
  mapIssueStatusKind,
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

  describe('mapIssueTypeColor', () => {
    it.each([
      ['RED', IconColor.RED],
      ['ORANGE', IconColor.YELLOW],
      ['YELLOW', IconColor.YELLOW],
      ['GREEN', IconColor.GREEN],
      ['BLUE', IconColor.PURPLE],
      ['PURPLE', IconColor.PURPLE],
      ['PINK', IconColor.PURPLE],
      ['GRAY', IconColor.GRAY],
    ] as const satisfies readonly (readonly [IssueTypeColor, IconColor])[])(
      'maps %s to the expected token',
      (color, expected) => {
        expect(mapIssueTypeColor(color)).toBe(expected);
      },
    );

    it('falls back to gray for a colour Gitify does not know about', () => {
      expect(mapIssueTypeColor('CHARTREUSE' as IssueTypeColor)).toBe(IconColor.GRAY);
    });
  });

  describe('mapIssueFieldColor', () => {
    it.each([
      ['RED', '#cf222e'],
      ['ORANGE', '#bc4c00'],
      ['YELLOW', '#9a6700'],
      ['GREEN', '#1a7f37'],
      ['BLUE', '#0969da'],
      ['PURPLE', '#8250df'],
      ['PINK', '#bf3989'],
      ['GRAY', '#59636e'],
    ] as const satisfies readonly (readonly [IssueFieldSingleSelectOptionColor, string])[])(
      'maps %s to the expected fill color',
      (color, expected) => {
        expect(mapIssueFieldColor(color)).toBe(expected);
      },
    );

    it('falls back to gray for an unknown color', () => {
      expect(mapIssueFieldColor('CHARTREUSE' as IssueFieldSingleSelectOptionColor)).toBe('#59636e');
    });
  });

  describe('mapIssueStatusKind', () => {
    it.each([
      ['backlog', 'Backlog', 'backlog'],
      ['planned', 'Todo', 'todo'],
      ['started', 'In progress', 'in_progress'],
      ['started', 'In review', 'in_review'],
      ['completed', 'Done', 'done'],
      ['not_planned', 'Not planned', 'not_planned'],
      ['duplicate', 'Duplicate', 'duplicate'],
    ] as const)('maps %s/%s to %s', (category, name, expected) => {
      expect(mapIssueStatusKind(category, name)).toBe(expected);
    });

    it('falls back to in_progress for an unrecognized started name', () => {
      expect(mapIssueStatusKind('started', 'Blocked')).toBe('in_progress');
    });

    it('falls back to unknown for an unrecognized category', () => {
      expect(mapIssueStatusKind('canceled', 'Canceled')).toBe('unknown');
    });
  });

  describe('mapIssueStatusColor', () => {
    it.each([
      ['backlog', IconColor.GREEN],
      ['todo', IconColor.GREEN],
      ['in_progress', IconColor.GREEN],
      ['in_review', IconColor.GREEN],
      ['done', IconColor.PURPLE],
      ['not_planned', IconColor.GRAY],
      ['duplicate', IconColor.GRAY],
      ['unknown', IconColor.GRAY],
    ] as const)('maps %s to the expected token', (kind, expected) => {
      expect(mapIssueStatusColor(kind)).toBe(expected);
    });
  });

  describe('mapIssueStatus', () => {
    it('returns the normalized status', () => {
      expect(
        mapIssueStatus({
          name: 'In review',
          category: {
            key: 'started',
            state: 'OPEN',
            stateReason: null,
          },
        }),
      ).toEqual({
        name: 'In review',
        kind: 'in_review',
        color: IconColor.GREEN,
      });
    });

    it('preserves an unknown status name and uses a neutral color', () => {
      expect(
        mapIssueStatus({
          name: 'Blocked',
          category: {
            key: 'canceled',
            state: 'OPEN',
            stateReason: null,
          },
        }),
      ).toEqual({
        name: 'Blocked',
        kind: 'unknown',
        color: IconColor.GRAY,
      });
    });
  });
});
