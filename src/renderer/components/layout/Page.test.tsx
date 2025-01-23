import { render } from '@testing-library/react';
import { Page } from './Page';

describe('renderer/components/layout/Page.tsx', () => {
  it('should render itself & its children - full', () => {
    const tree = render(
      <Page id="test" type="h-full">
        Test
      </Page>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - screen', () => {
    const tree = render(
      <Page id="test" type="h-screen">
        Test
      </Page>,
    );

    expect(tree).toMatchSnapshot();
  });
});
