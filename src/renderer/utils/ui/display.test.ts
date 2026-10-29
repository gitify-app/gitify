import { getChevronDetails, parseInlineCode } from './display';

describe('renderer/utils/ui/display.ts', () => {
  describe('getChevronDetails', () => {
    it('returns correct chevron details', () => {
      expect(getChevronDetails(true, true, 'account')).toEqual({
        direction: 'down',
        label: 'Hide account notifications',
      });

      expect(getChevronDetails(true, false, 'account')).toEqual({
        direction: 'right',
        label: 'Show account notifications',
      });

      expect(getChevronDetails(false, false, 'account')).toEqual({
        direction: 'left',
        label: 'No notifications for account',
      });
    });
  });

  describe('parseInlineCode', () => {
    it('returns plain text when no code blocks present', () => {
      expect(parseInlineCode('Simple notification title')).toEqual([
        {
          id: '0',
          type: 'text',
          content: 'Simple notification title',
        },
      ]);
    });

    it('parses single inline code block', () => {
      expect(parseInlineCode('refactor: migrate deprecated atlaskit `xcss`')).toEqual([
        {
          id: '0',
          type: 'text',
          content: 'refactor: migrate deprecated atlaskit ',
        },
        {
          id: '1',
          type: 'code',
          content: 'xcss',
        },
      ]);
    });

    it('parses multiple inline code blocks', () => {
      expect(parseInlineCode('Replace `foo` with `bar` in config')).toEqual([
        {
          id: '0',
          type: 'text',
          content: 'Replace ',
        },
        {
          id: '1',
          type: 'code',
          content: 'foo',
        },
        {
          id: '2',
          type: 'text',
          content: ' with ',
        },
        {
          id: '3',
          type: 'code',
          content: 'bar',
        },
        {
          id: '4',
          type: 'text',
          content: ' in config',
        },
      ]);
    });

    it('parses code block at the start', () => {
      expect(parseInlineCode('`useState` hook implementation')).toEqual([
        {
          id: '0',
          type: 'code',
          content: 'useState',
        },
        {
          id: '1',
          type: 'text',
          content: ' hook implementation',
        },
      ]);
    });

    it('parses code block at the end', () => {
      expect(parseInlineCode('Fix issue with `render`')).toEqual([
        {
          id: '0',
          type: 'text',
          content: 'Fix issue with ',
        },
        {
          id: '1',
          type: 'code',
          content: 'render',
        },
      ]);
    });

    it('handles empty string', () => {
      expect(parseInlineCode('')).toEqual([
        {
          id: '0',
          type: 'text',
          content: '',
        },
      ]);
    });

    it('handles adjacent code blocks', () => {
      expect(parseInlineCode('Compare `foo``bar`')).toEqual([
        {
          id: '0',
          type: 'text',
          content: 'Compare ',
        },
        {
          id: '1',
          type: 'code',
          content: 'foo',
        },
        {
          id: '2',
          type: 'code',
          content: 'bar',
        },
      ]);
    });
  });
});
