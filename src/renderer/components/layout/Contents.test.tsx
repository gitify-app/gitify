import { render } from '@testing-library/react';
import { Contents } from './Contents';

describe('renderer/components/layout/Contents.tsx', () => {
  it('should render itself & its children', () => {
    const tree = render(<Contents>Test</Contents>);

    expect(tree).toMatchSnapshot();
  });
});
