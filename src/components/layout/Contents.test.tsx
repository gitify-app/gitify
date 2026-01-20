import { renderWithAppContext } from '../../__helpers__/test-utils';

import { Contents } from './Contents';

describe('renderer/components/layout/Contents.tsx', () => {
  it('should render itself & its children', () => {
    const tree = renderWithAppContext(<Contents>Test</Contents>);

    expect(tree).toMatchSnapshot();
  });
});
