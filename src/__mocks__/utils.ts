import * as helpers from '../utils/helpers';

export function mockDirectoryPath() {
  jest.spyOn(helpers, 'getDirectoryPath').mockReturnValue('/mocked/dir/name');
}

/**
 * Ensure stable snapshots for our randomized emoji use-cases
 */
export function ensureStableEmojis() {
  global.Math.random = jest.fn(() => 0.1);
}
