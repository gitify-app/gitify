import { renderWithAppContext } from '../../__helpers__/test-utils';

import { Page } from './Page';

describe('renderer/components/layout/Page.tsx', () => {
  it('should render itself & its children', () => {
    const tree = renderWithAppContext(<Page testId="test">Test</Page>);

    expect(tree).toMatchSnapshot();
  });
});
