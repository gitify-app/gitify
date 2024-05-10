import { formatAsGitHubSearchSyntax } from './utils';

describe('utils/api/graphql/utils.ts', () => {
  describe('formatAsGitHubCodeSearchSyntax', () => {
    test('formats search query string correctly', () => {
      const result = formatAsGitHubSearchSyntax(
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
