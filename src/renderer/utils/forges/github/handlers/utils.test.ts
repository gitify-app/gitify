import { mockAuthor } from '../__mocks__/response-mocks';

import { IconColor } from '../../../../types';

import type {
  IssueFieldSingleSelectOptionColor,
  IssueTypeColor,
} from '../graphql/generated/graphql';
import {
  getNotificationAuthor,
  getTaskProgress,
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

  describe('getTaskProgress', () => {
    it('returns undefined for an empty body', () => {
      expect(getTaskProgress(null)).toBeUndefined();
      expect(getTaskProgress('')).toBeUndefined();
    });

    it('returns undefined when there are no tasks', () => {
      expect(getTaskProgress('Just a description\n- a bullet')).toBeUndefined();
    });

    it('counts completed and open tasks', () => {
      const body = [
        '## Checklist',
        '- [x] done',
        '- [X] also done',
        '* [ ] not done',
        '+ [ ] another',
        '1. [x] numbered',
        '  - [ ] nested',
        '> - [x] quoted',
      ].join('\n');

      expect(getTaskProgress(body)).toEqual({ total: 7, completed: 4 });
    });

    it('ignores tasks inside fenced code blocks and empty checkboxes', () => {
      const body = [
        '- [x] real',
        '```md',
        '- [ ] example',
        '~~~',
        '- [ ] still in the code block',
        '```',
        '~~~',
        '- [ ] tilde example',
        '~~~',
        '- [ ]',
        '- [ ] real too',
      ].join('\r\n');

      expect(getTaskProgress(body)).toEqual({ total: 2, completed: 1 });
    });
  });
});
