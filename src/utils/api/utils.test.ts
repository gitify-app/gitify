import { addHours, formatSearchQueryString } from './utils';

describe('utils/api/utils.ts', () => {
  describe('addHours', () => {
    // Example test using Jest
    test('adds hours correctly for positive values', () => {
      const result = addHours('2024-02-20T12:00:00.000Z', 3);
      expect(result).toBe('2024-02-20T15:00:00.000Z');
    });

    test('adds hours correctly for negative values', () => {
      const result = addHours('2024-02-20T12:00:00.000Z', -2);
      expect(result).toBe('2024-02-20T10:00:00.000Z');
    });
  });

  describe('formatSearchQueryString', () => {
    test('formats search query string correctly', () => {
      const result = formatSearchQueryString(
        'exampleRepo',
        'exampleTitle',
        '2024-02-20T12:00:00.000Z',
      );

      expect(result).toBe(
        'exampleTitle in:title repo:exampleRepo updated:>2024-02-20T10:00:00.000Z',
      );
    });
  });
});
