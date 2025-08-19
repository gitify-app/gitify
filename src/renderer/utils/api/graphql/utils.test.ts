import { formatAsGitHubSearchSyntax } from './utils';

describe('renderer/utils/api/graphql/utils.ts', () => {
  describe('formatAsGitHubCodeSearchSyntax', () => {
    test('formats search query string correctly', () => {
      const result = formatAsGitHubSearchSyntax('exampleRepo', 'exampleTitle');

      expect(result).toBe('"exampleTitle" in:title repo:exampleRepo');
    });
  });
});
