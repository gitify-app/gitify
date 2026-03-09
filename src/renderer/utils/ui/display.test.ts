import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@primer/octicons-react';

import { getChevronDetails, parseInlineCode } from './display';

describe('renderer/utils/ui/display.ts', () => {
  describe('getChevronDetails', () => {
    it('should return correct chevron details', () => {
      expect(getChevronDetails(true, true, 'account')).toEqual({
        icon: ChevronDownIcon,
        label: 'Hide account notifications',
      });

      expect(getChevronDetails(true, false, 'account')).toEqual({
        icon: ChevronRightIcon,
        label: 'Show account notifications',
      });

      expect(getChevronDetails(false, false, 'account')).toEqual({
        icon: ChevronLeftIcon,
        label: 'No notifications for account',
      });
    });
  });

  describe('parseInlineCode', () => {
    it('should return plain text when no code blocks present', () => {
      expect(parseInlineCode('Simple notification title')).toEqual([
        {
          id: '0',
          type: 'text',
          content: 'Simple notification title',
        },
      ]);
    });

    it('should parse single inline code block', () => {
      expect(
        parseInlineCode('refactor: migrate deprecated atlaskit `xcss`'),
      ).toEqual([
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

    it('should parse multiple inline code blocks', () => {
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

    it('should parse code block at the start', () => {
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

    it('should parse code block at the end', () => {
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

    it('should handle empty string', () => {
      expect(parseInlineCode('')).toEqual([
        {
          id: '0',
          type: 'text',
          content: '',
        },
      ]);
    });

    it('should handle adjacent code blocks', () => {
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
