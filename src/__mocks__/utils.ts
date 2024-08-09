import * as helpers from '../utils/helpers';

export function mockDirectoryPath() {
  jest.spyOn(helpers, 'getDirectoryPath').mockReturnValue('/mocked/dir/name');
}
