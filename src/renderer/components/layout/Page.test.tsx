import { render } from '@testing-library/react';

import { describe, expect, it } from 'vitest';

import { Page } from './Page';

describe('renderer/components/layout/Page.tsx', () => {
  it('should render itself & its children', () => {
    const tree = render(<Page testId="test">Test</Page>);

    expect(tree).toMatchSnapshot();
  });
});
